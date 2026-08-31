import {
  Button,
  ButtonType,
  CheckBoxRow,
  DispatchAction,
  InfoTextBox,
  Screens,
  testIdWithKey,
  ThemedText,
  useStore,
  useTheme,
} from '@bifold/core'
import { useNavigation } from '@react-navigation/native'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// Numeric string required: core compares Number(stored) === Number(version).
// Bump to '3', '4', … when the text changes materially.
export const TermsVersionICI = '2'

// Both pilot languages; the active one follows the language selected in
// Settings (useTranslation re-renders on change).
const COPY = {
  ro: {
    info: 'Citiți și acceptați condițiile de utilizare înainte de a folosi aplicația.',
    title: 'Condiții de utilizare — ICI Wallet (pilot RoDID)',
    intro:
      'ICI Wallet este o aplicație demonstrativă, dezvoltată de Institutul Național de Cercetare-Dezvoltare în ' +
      'Informatică — ICI București în cadrul proiectului de cercetare RoDID („Sisteme de comunicație reziliente și ' +
      'interoperabile bazate pe tehnologii distribuite și identitate digitală auto-suverană", Programul Nucleu ' +
      'FUTURE TECH).',
    h1: '1. Caracter demonstrativ',
    p1:
      'Aplicația și acreditările emise în cadrul pilotului au exclusiv rol de demonstrație tehnică și nu produc ' +
      'efecte juridice. Ele nu înlocuiesc actele de identitate sau documentele oficiale emise de autoritățile ' +
      'statului.',
    h2: '2. Datele dumneavoastră',
    p2:
      'Cheile criptografice și acreditările sunt stocate exclusiv pe acest dispozitiv, protejate de PIN-ul ales ' +
      'și, opțional, de biometrie. Aplicația transmite date doar atunci când aprobați explicit o cerere de ' +
      'prezentare, și numai atributele afișate în ecranul de aprobare. În cadrul pilotului se folosesc date ' +
      'fictive de test; vă recomandăm să nu introduceți date personale reale.',
    h3: '3. Trasabilitate',
    p3:
      'Evenimentele relevante ale pilotului (emiteri, verificări, schimburi interinstituționale) sunt consemnate ' +
      'într-un jurnal de audit înlănțuit criptografic și ancorat într-un registru distribuit. Jurnalul nu conține ' +
      'date personale, ci doar amprente criptografice ale operațiunilor.',
    h4: '4. Limitarea răspunderii',
    p4:
      'Aplicația este furnizată „ca atare", în scop de cercetare și evaluare. ICI București nu răspunde pentru ' +
      'decizii luate pe baza acreditărilor demonstrative și poate reseta oricând datele mediului-pilot.',
    agree: 'Am citit, am înțeles și accept condițiile de utilizare.',
  },
  en: {
    info: 'Please read and accept the terms of use before using this application.',
    title: 'Terms of use — ICI Wallet (RoDID pilot)',
    intro:
      'ICI Wallet is a demonstration application developed by the National Institute for Research & Development ' +
      'in Informatics — ICI Bucharest within the RoDID research project (“Resilient and interoperable ' +
      'communication systems based on distributed technologies and self-sovereign digital identity”, the ' +
      'FUTURE TECH Core Programme).',
    h1: '1. Demonstrative character',
    p1:
      'The application and the credentials issued within the pilot serve exclusively as a technical ' +
      'demonstration and produce no legal effects. They do not replace identity documents or official documents ' +
      'issued by state authorities.',
    h2: '2. Your data',
    p2:
      'Cryptographic keys and credentials are stored exclusively on this device, protected by your chosen PIN ' +
      'and, optionally, biometrics. The application transmits data only when you explicitly approve a ' +
      'presentation request, and only the attributes shown on the approval screen. The pilot uses fictitious ' +
      'test data; we recommend not entering real personal data.',
    h3: '3. Traceability',
    p3:
      'Relevant pilot events (issuances, verifications, inter-institutional exchanges) are recorded in a ' +
      'cryptographically chained audit journal anchored into a distributed ledger. The journal contains no ' +
      'personal data — only cryptographic fingerprints of the operations.',
    h4: '4. Limitation of liability',
    p4:
      'The application is provided “as is”, for research and evaluation purposes. ICI Bucharest is not liable ' +
      'for decisions taken based on the demonstrative credentials and may reset the pilot environment’s data ' +
      'at any time.',
    agree: 'I have read, understood and accept the terms of use.',
  },
}

const P: React.FC<{ children: React.ReactNode; style: any; bold?: boolean }> = ({ children, style, bold }) => (
  <ThemedText style={[style, { marginTop: 16 }, bold ? { fontWeight: 'bold' } : null]}>{children}</ThemedText>
)

const TermsICI: React.FC = () => {
  const [store, dispatch] = useStore()
  const agreedToPreviousTerms = store.onboarding.didAgreeToTerms
  const [checked, setChecked] = useState(agreedToPreviousTerms)
  const { t, i18n } = useTranslation()
  const c = i18n.language?.startsWith('ro') ? COPY.ro : COPY.en
  const navigation = useNavigation<any>()
  const { OnboardingTheme } = useTheme()

  const onSubmitPressed = useCallback(() => {
    dispatch({
      type: DispatchAction.DID_AGREE_TO_TERMS,
      payload: [{ DidAgreeToTerms: TermsVersionICI }],
    })
  }, [dispatch])

  const style = StyleSheet.create({
    screen: { flex: 1, backgroundColor: OnboardingTheme.container?.backgroundColor },
    container: { ...OnboardingTheme.container, padding: 20 },
    bodyText: { ...OnboardingTheme.bodyText, flexShrink: 1 },
    titleText: { ...OnboardingTheme.bodyText, fontWeight: 'bold', fontSize: 18 },
    controlsContainer: { marginTop: 'auto', marginBottom: 20 },
  })

  const onBackPressed = () => {
    dispatch({ type: DispatchAction.DID_COMPLETE_TUTORIAL, payload: [{ didCompleteTutorial: false }] })
    navigation.navigate(Screens.Onboarding)
  }

  return (
    <SafeAreaView style={style.screen} edges={['bottom']}>
      <ScrollView style={style.container}>
        <InfoTextBox>{c.info}</InfoTextBox>

        <P style={style.titleText} bold>
          {c.title}
        </P>

        <P style={style.bodyText}>{c.intro}</P>

        <P style={style.bodyText} bold>{c.h1}</P>
        <P style={style.bodyText}>{c.p1}</P>

        <P style={style.bodyText} bold>{c.h2}</P>
        <P style={style.bodyText}>{c.p2}</P>

        <P style={style.bodyText} bold>{c.h3}</P>
        <P style={style.bodyText}>{c.p3}</P>

        <P style={style.bodyText} bold>{c.h4}</P>
        <P style={style.bodyText}>{c.p4}</P>

        <View style={style.controlsContainer}>
          {!agreedToPreviousTerms && (
            <CheckBoxRow
              title={c.agree}
              accessibilityLabel={t('Terms.IAgree')}
              testID={testIdWithKey('IAgree')}
              checked={!!checked}
              onPress={() => setChecked(!checked)}
            />
          )}
          <View style={{ paddingTop: 10 }}>
            <Button
              title={agreedToPreviousTerms ? t('Global.Accept') : t('Global.Continue')}
              accessibilityLabel={agreedToPreviousTerms ? t('Global.Accept') : t('Global.Continue')}
              testID={agreedToPreviousTerms ? testIdWithKey('Accept') : testIdWithKey('Continue')}
              disabled={!checked}
              onPress={onSubmitPressed}
              buttonType={ButtonType.Primary}
            />
          </View>
          {!agreedToPreviousTerms && (
            <View style={{ paddingTop: 10 }}>
              <Button
                title={t('Global.Back')}
                accessibilityLabel={t('Global.Back')}
                testID={testIdWithKey('Back')}
                onPress={onBackPressed}
                buttonType={ButtonType.Secondary}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default TermsICI
