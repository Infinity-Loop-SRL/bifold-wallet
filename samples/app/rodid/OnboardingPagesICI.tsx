import { Button, ButtonType, createStyles, testIdWithKey, ThemedText, useTheme } from '@bifold/core'
import React from 'react'
import { ScrollView, View } from 'react-native'

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

const FinalPage = (onTutorialCompleted: GenericFn, OnboardingTheme: any) => {
  const { Assets } = useTheme()
  const styles = createStyles(OnboardingTheme)
  return (
    <>
      <ScrollView style={{ padding: 20 }}>
        <View style={{ alignItems: 'center' }}>
          <Assets.svg.secureImage {...imageOptions(OnboardingTheme)} />
        </View>
        <View style={{ marginBottom: 20 }}>
          <ThemedText style={styles.headerText} testID={testIdWithKey('HeaderText')}>
            Sigur, privat, auditabil
          </ThemedText>
          <ThemedText style={[styles.bodyText, { marginTop: 25 }]} testID={testIdWithKey('BodyText')}>
            Cheile criptografice rămân doar pe telefonul tău, protejate de PIN sau biometrie. Emitenții acreditărilor
            sunt verificați în registrul de încredere al pilotului, iar operațiunile importante sunt ancorate într-un
            registru distribuit — nimic nu poate fi rescris pe ascuns.
          </ThemedText>
        </View>
      </ScrollView>
      <View style={{ marginTop: 'auto', margin: 20 }}>
        <Button
          title={'Începe'}
          accessibilityLabel={'Începe'}
          testID={testIdWithKey('GetStarted')}
          onPress={onTutorialCompleted}
          buttonType={ButtonType.Primary}
        />
      </View>
    </>
  )
}

const FirstPage: React.FC<{ theme: any }> = ({ theme }) => {
  const { Assets } = useTheme()
  return (
    <Page
      theme={theme}
      title={'Actele tale, în telefonul tău'}
      body={
        'ICI Wallet este portofelul digital al pilotului RoDID: instituțiile îți emit acreditări verificabile — ' +
        'identitatea de bază, domiciliul, alte atestate — semnate criptografic și păstrate doar pe dispozitivul tău.'
      }
      image={<Assets.svg.credentialList style={imageOptions(theme)} />}
    />
  )
}

const SecondPage: React.FC<{ theme: any }> = ({ theme }) => {
  const { Assets } = useTheme()
  return (
    <Page
      theme={theme}
      title={'Dovedești doar ce este necesar'}
      body={
        'Când un serviciu public îți cere o dovadă, vezi exact ce date pleacă de pe telefon și aprobi fiecare ' +
        'cerere. Poți dovedi, de exemplu, că ai peste 18 ani fără să dezvălui data nașterii sau CNP-ul.'
      }
      image={<Assets.svg.scanShare style={imageOptions(theme)} />}
    />
  )
}

const OnboardingPagesICI = (onTutorialCompleted: GenericFn, OnboardingTheme: any): Array<Element> => {
  return [
    <FirstPage key="p1" theme={OnboardingTheme} />,
    <SecondPage key="p2" theme={OnboardingTheme} />,
    FinalPage(onTutorialCompleted, OnboardingTheme),
  ]
}

export default OnboardingPagesICI
