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

const P: React.FC<{ children: React.ReactNode; style: any; bold?: boolean }> = ({ children, style, bold }) => (
  <ThemedText style={[style, { marginTop: 16 }, bold ? { fontWeight: 'bold' } : null]}>{children}</ThemedText>
)

const TermsICI: React.FC = () => {
  const [store, dispatch] = useStore()
  const agreedToPreviousTerms = store.onboarding.didAgreeToTerms
  const [checked, setChecked] = useState(agreedToPreviousTerms)
  const { t } = useTranslation()
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
        <InfoTextBox>Citiți și acceptați condițiile de utilizare înainte de a folosi aplicația.</InfoTextBox>

        <P style={style.titleText} bold>
          Condiții de utilizare — ICI Wallet (pilot RoDID)
        </P>

        <P style={style.bodyText}>
          ICI Wallet este o aplicație demonstrativă, dezvoltată de Institutul Național de Cercetare-Dezvoltare în
          Informatică — ICI București în cadrul proiectului de cercetare RoDID („Sisteme de comunicație reziliente și
          interoperabile bazate pe tehnologii distribuite și identitate digitală auto-suverană", Programul Nucleu
          FUTURE TECH).
        </P>

        <P style={style.bodyText} bold>
          1. Caracter demonstrativ
        </P>
        <P style={style.bodyText}>
          Aplicația și acreditările emise în cadrul pilotului au exclusiv rol de demonstrație tehnică și nu produc
          efecte juridice. Ele nu înlocuiesc actele de identitate sau documentele oficiale emise de autoritățile
          statului.
        </P>

        <P style={style.bodyText} bold>
          2. Datele dumneavoastră
        </P>
        <P style={style.bodyText}>
          Cheile criptografice și acreditările sunt stocate exclusiv pe acest dispozitiv, protejate de PIN-ul ales
          și, opțional, de biometrie. Aplicația transmite date doar atunci când aprobați explicit o cerere de
          prezentare, și numai atributele afișate în ecranul de aprobare. În cadrul pilotului se folosesc date
          fictive de test; vă recomandăm să nu introduceți date personale reale.
        </P>

        <P style={style.bodyText} bold>
          3. Trasabilitate
        </P>
        <P style={style.bodyText}>
          Evenimentele relevante ale pilotului (emiteri, verificări, schimburi interinstituționale) sunt consemnate
          într-un jurnal de audit înlănțuit criptografic și ancorat într-un registru distribuit. Jurnalul nu conține
          date personale, ci doar amprente criptografice ale operațiunilor.
        </P>

        <P style={style.bodyText} bold>
          4. Limitarea răspunderii
        </P>
        <P style={style.bodyText}>
          Aplicația este furnizată „ca atare", în scop de cercetare și evaluare. ICI București nu răspunde pentru
          decizii luate pe baza acreditărilor demonstrative și poate reseta oricând datele mediului-pilot.
        </P>

        <View style={style.controlsContainer}>
          {!agreedToPreviousTerms && (
            <CheckBoxRow
              title={'Am citit, am înțeles și accept condițiile de utilizare.'}
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
