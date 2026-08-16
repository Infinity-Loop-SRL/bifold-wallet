import { Agent, CredoError } from '@credo-ts/core'
import { DidCommHttpOutboundTransport, DidCommWsOutboundTransport } from '@credo-ts/didcomm'
import { IndyVdrPoolService } from '@credo-ts/indy-vdr'
import { agentDependencies } from '@credo-ts/react-native'
import { GetCredentialDefinitionRequest, GetSchemaRequest } from '@hyperledger/indy-vdr-shared'
import { useCallback, useRef, useState } from 'react'
import { CachesDirectoryPath } from 'react-native-fs'

import { TOKENS, useServices } from '../container-api'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { WalletSecret } from '../types/security'
import { createLinkSecretIfRequired, getAgentModules } from '../utils/agent'
import { migrateToAskar } from '../utils/migration'

export type AgentSetupReturnType = {
  agent: Agent | null
  initializeAgent: (walletSecret: WalletSecret) => Promise<void>
  shutdownAndClearAgentIfExists: () => Promise<void>
}

const useBifoldAgentSetup = (): AgentSetupReturnType => {
  const [agent, setAgent] = useState<Agent | null>(null)
  const agentInstanceRef = useRef<Agent | null>(null)
  const [store, dispatch] = useStore()
  const [cacheSchemas, cacheCredDefs, logger, indyLedgers, bridge] = useServices([
    TOKENS.CACHE_SCHEMAS,
    TOKENS.CACHE_CRED_DEFS,
    TOKENS.UTIL_LOGGER,
    TOKENS.UTIL_LEDGERS,
    TOKENS.UTIL_AGENT_BRIDGE,
    TOKENS.UTIL_REFRESH_ORCHESTRATOR,
  ])

  const restartExistingAgent = useCallback(
    async (agent: Agent): Promise<Agent | undefined> => {
      try {
        await agent.initialize()
      } catch (error) {
        logger.warn(`Agent restart failed with error ${error}`)
        // if the existing agents wallet cannot be opened or initialize() fails it was
        // again not a clean shutdown and the agent should be replaced, not restarted
        return
      }

      return agent
    },
    [logger]
  )

  const createNewAgent = useCallback(
    async (walletSecret: WalletSecret, mediatorUrl: string): Promise<Agent> => {
      const newAgent = new Agent({
        config: {
          logger,
          autoUpdateStorageOnStartup: true,
        },
        dependencies: agentDependencies,
        modules: getAgentModules({
          walletSecret,
          indyNetworks: indyLedgers,
          mediatorInvitationUrl: mediatorUrl,
          txnCache: {
            capacity: 1000,
            expiryOffsetMs: 1000 * 60 * 60 * 24 * 7,
            path: CachesDirectoryPath + '/txn-cache',
          },
        }),
      })
      const wsTransport = new DidCommWsOutboundTransport()
      const httpTransport = new DidCommHttpOutboundTransport()

      newAgent.modules.didcomm.registerOutboundTransport(wsTransport)
      newAgent.modules.didcomm.registerOutboundTransport(httpTransport)

      return newAgent
    },
    [logger, indyLedgers]
  )

  /**
   * Provisions mediation from an Out-of-Band invitation.
   *
   * The legacy `mediationRecipient.mediatorInvitationUrl` agent option only understands connection
   * invitations, so it times out waiting for a mediation grant against mediators that issue OOB
   * invitations. Provisioning manually after `initialize()` avoids that path. Reuses the existing
   * mediator connection when one is already stored. See `docs/didcomm-mediator-credo.md`.
   */
  const startMediation = useCallback(
    async (newAgent: Agent, mediatorUrl: string) => {
      const didcomm = newAgent.modules.didcomm
      logger.debug('Mediation: parsing invitation')
      const invitation = await didcomm.oob.parseInvitation(mediatorUrl)
      logger.debug(`Mediation: parsed invitation ${invitation.id}`)
      const outOfBandRecord = await didcomm.oob.findByReceivedInvitationId(invitation.id)
      logger.debug(`Mediation: existing oob record: ${outOfBandRecord?.id ?? 'none'}`)

      let [connection] = outOfBandRecord ? await didcomm.connections.findAllByOutOfBandId(outOfBandRecord.id) : []

      if (!connection) {
        logger.debug('Mediation connection does not exist, creating connection')

        const { connectionRecord } = await didcomm.oob.receiveInvitation(invitation, {
          label: store.preferences.walletName,
          autoAcceptInvitation: true,
          autoAcceptConnection: true,
        })

        if (!connectionRecord) {
          logger.error('No connection record to provision mediation.')
          return
        }

        connection = connectionRecord
      }

      logger.debug(`Mediation: connection ${connection.id} state=${connection.state} isReady=${connection.isReady}`)

      const readyConnection = connection.isReady
        ? connection
        : await didcomm.connections.returnWhenIsConnected(connection.id)

      logger.debug('Mediation: connection ready, requesting mediation grant')
      return didcomm.mediationRecipient.provision(readyConnection)
    },
    [logger, store.preferences.walletName]
  )

  const migrateIfRequired = useCallback(
    async (newAgent: Agent, walletSecret: WalletSecret) => {
      // If we haven't migrated to Aries Askar yet, we need to do this before we initialize the agent.
      if (!store.migration.didMigrateToAskar) {
        await migrateToAskar(walletSecret.id, walletSecret.key, newAgent)
        // Store that we migrated to askar.
        dispatch({
          type: DispatchAction.DID_MIGRATE_TO_ASKAR,
        })
      }
    },
    [store.migration.didMigrateToAskar, dispatch]
  )

  const warmUpCache = useCallback(
    async (newAgent: Agent) => {
      const poolService: IndyVdrPoolService = newAgent.dependencyManager.resolve(IndyVdrPoolService) // Maybe should resolve differently
      cacheCredDefs.forEach(async ({ did, id }) => {
        const pool = await poolService.getPoolForDid(newAgent.context, did)
        const credDefRequest = new GetCredentialDefinitionRequest({ credentialDefinitionId: id })
        await pool.pool.submitRequest(credDefRequest)
      })

      cacheSchemas.forEach(async ({ did, id }) => {
        const pool = await poolService.getPoolForDid(newAgent.context, did)
        const schemaRequest = new GetSchemaRequest({ schemaId: id })
        await pool.pool.submitRequest(schemaRequest)
      })
    },
    [cacheCredDefs, cacheSchemas]
  )

  const initializeAgent = useCallback(
    async (walletSecret: WalletSecret): Promise<void> => {
      const mediatorUrl = store.preferences.selectedMediator
      logger.info('Checking for existing agent...')
      if (agentInstanceRef.current) {
        const restartedAgent = await restartExistingAgent(agentInstanceRef.current)
        if (restartedAgent) {
          logger.info('Successfully restarted existing agent...')
          agentInstanceRef.current = restartedAgent
          bridge.setAgent(restartedAgent)
          setAgent(restartedAgent)
          return
        }
      }

      logger.info('Creating new agent...')
      const newAgent = await createNewAgent(walletSecret, mediatorUrl)

      logger.info('Migrating if required...')
      await migrateIfRequired(newAgent, walletSecret)

      try {
        logger.info('Initializing agent...')
        await newAgent.initialize()
      } catch (e: any) {
        logger.error('Stack: ' + (e as CredoError).stack)
        logger.error('Message: ' + (e as CredoError).message)
        logger.error((e as CredoError).cause?.stack ?? 'No cause stack')
        logger.error((e as CredoError).cause?.message ?? 'No cause message')
        throw e
      }

      if (mediatorUrl) {
        try {
          logger.info('Provisioning mediation...')
          await startMediation(newAgent, mediatorUrl)
          await newAgent.modules.didcomm.mediationRecipient.initiateMessagePickup()
        } catch (e: unknown) {
          // A mediator that is unreachable or misbehaving must not prevent the wallet from opening.
          // DIDComm messaging will be unavailable until mediation succeeds, but OpenID4VC flows and
          // stored credentials remain usable.
          logger.error(`Mediation provisioning failed, continuing without a mediator: ${e}`)
          logger.error(`Mediation failure stack: ${(e as Error)?.stack ?? 'none'}`)
        }
      }

      logger.info('Creating link secret if required...')
      await createLinkSecretIfRequired(newAgent)

      logger.info('Warming up cache...')
      await warmUpCache(newAgent)

      logger.info('Agent initialized successfully')
      agentInstanceRef.current = newAgent
      setAgent(newAgent)
      bridge.setAgent(newAgent)
    },
    [
      logger,
      restartExistingAgent,
      createNewAgent,
      migrateIfRequired,
      startMediation,
      warmUpCache,
      store.preferences.selectedMediator,
      bridge,
    ]
  )

  const shutdownAndClearAgentIfExists = useCallback(async () => {
    if (agent) {
      try {
        await agent.shutdown()
      } catch (error) {
        logger.error(`Error shutting down agent with shutdownAndClearAgentIfExists: ${error}`)
      } finally {
        bridge.clearAgent()
        setAgent(null)
      }
    }
  }, [agent, logger, bridge])

  return { agent, initializeAgent, shutdownAndClearAgentIfExists }
}

export default useBifoldAgentSetup
