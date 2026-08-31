import { Button, ButtonType, createStyles, testIdWithKey, ThemedText, useTheme } from '@bifold/core'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'

// Copy in both pilot languages; the active one follows the language selected
// in Settings (useTranslation re-renders these screens on change).
const COPY = {
  ro: {
    p1t: 'Actele tale, în telefonul tău',
    p1b:
      'ICI Wallet este portofelul digital al pilotului RoDID: instituțiile îți emit acreditări verificabile — ' +
      'identitatea de bază, domiciliul, alte atestate — semnate criptografic și păstrate doar pe dispozitivul tău.',
    p2t: 'Dovedești doar ce este necesar',
    p2b:
      'Când un serviciu public îți cere o dovadă, vezi exact ce date pleacă de pe telefon și aprobi fiecare ' +
      'cerere. Poți dovedi, de exemplu, că ai peste 18 ani fără să dezvălui data nașterii sau CNP-ul.',
    p3t: 'Sigur, privat, auditabil',
    p3b:
      'Cheile criptografice rămân doar pe telefonul tău, protejate de PIN sau biometrie. Emitenții acreditărilor ' +
      'sunt verificați în registrul de încredere al pilotului, iar operațiunile importante sunt ancorate într-un ' +
      'registru distribuit — nimic nu poate fi rescris pe ascuns.',
    start: 'Începe',
  },
  en: {
    p1t: 'Your documents, on your phone',
    p1b:
      'ICI Wallet is the digital wallet of the RoDID pilot: institutions issue you verifiable credentials — ' +
      'your core identity, domicile, other attestations — cryptographically signed and stored only on your device.',
    p2t: 'Prove only what is necessary',
    p2b:
      'When a public service asks for a proof, you see exactly which data leaves your phone and you approve every ' +
      'request. You can prove, for example, that you are over 18 without revealing your birth date or personal number.',
    p3t: 'Secure, private, auditable',
    p3b:
      'Your cryptographic keys stay on your phone alone, protected by your PIN or biometrics. Credential issuers ' +
      'are validated against the pilot’s trust registry, and important operations are anchored into a distributed ' +
      'ledger — nothing can be silently rewritten.',
    start: 'Get started',
  },
}

const useCopy = () => {
  const { i18n } = useTranslation()
  return i18n.language?.startsWith('ro') ? COPY.ro : COPY.en
}

// Bifold passes (onTutorialCompleted, OnboardingTheme) and expects an array of
// rendered pages. Content is tailored to the RoDID government pilot demo.

type GenericFn = () => void

const imageOptions = (OnboardingTheme: any) => ({
  ...OnboardingTheme.imageDisplayOptions,
  height: 180,
  width: 180,
})

const Page: React.FC<{ theme: any; title: string; body: string; image: React.ReactNode }> = ({
  theme,
  title,
  body,
  image,
}) => {
  const styles = createStyles(theme)
  return (
    <ScrollView style={{ padding: 20 }}>
      <View style={{ alignItems: 'center' }}>{image}</View>
      <View style={{ marginBottom: 20 }}>
        <ThemedText style={styles.headerText} testID={testIdWithKey('HeaderText')}>
          {title}
        </ThemedText>
        <ThemedText style={[styles.bodyText, { marginTop: 25 }]} testID={testIdWithKey('BodyText')}>
          {body}
        </ThemedText>
      </View>
    </ScrollView>
  )
}

const FinalPage: React.FC<{ onDone: GenericFn; theme: any }> = ({ onDone, theme }) => {
  const { Assets } = useTheme()
  const c = useCopy()
  const styles = createStyles(theme)
  return (
    <>
      <ScrollView style={{ padding: 20 }}>
        <View style={{ alignItems: 'center' }}>
          <Assets.svg.secureImage {...imageOptions(theme)} />
        </View>
        <View style={{ marginBottom: 20 }}>
          <ThemedText style={styles.headerText} testID={testIdWithKey('HeaderText')}>
            {c.p3t}
          </ThemedText>
          <ThemedText style={[styles.bodyText, { marginTop: 25 }]} testID={testIdWithKey('BodyText')}>
            {c.p3b}
          </ThemedText>
        </View>
      </ScrollView>
      <View style={{ marginTop: 'auto', margin: 20 }}>
        <Button
          title={c.start}
          accessibilityLabel={c.start}
          testID={testIdWithKey('GetStarted')}
          onPress={onDone}
          buttonType={ButtonType.Primary}
        />
      </View>
    </>
  )
}

const FirstPage: React.FC<{ theme: any }> = ({ theme }) => {
  const { Assets } = useTheme()
  const c = useCopy()
  return <Page theme={theme} title={c.p1t} body={c.p1b} image={<Assets.svg.credentialList style={imageOptions(theme)} />} />
}

const SecondPage: React.FC<{ theme: any }> = ({ theme }) => {
  const { Assets } = useTheme()
  const c = useCopy()
  return <Page theme={theme} title={c.p2t} body={c.p2b} image={<Assets.svg.scanShare style={imageOptions(theme)} />} />
}

const OnboardingPagesICI = (onTutorialCompleted: GenericFn, OnboardingTheme: any): Array<Element> => {
  return [
    <FirstPage key="p1" theme={OnboardingTheme} />,
    <SecondPage key="p2" theme={OnboardingTheme} />,
    <FinalPage key="p3" onDone={onTutorialCompleted} theme={OnboardingTheme} />,
  ]
}

export default OnboardingPagesICI
