// screens/HomeScreen.tsx
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Dimensions, Image, SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { RootStackParamList } from '../App';
import AppButton from '../src/components/AppButton';
import { theme } from '../src/theme/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- ESTILOS LOCAIS — MESMOS PADRÕES ---
const screenColors = {
  background: '#FFFFFF',
  primary: '#3498DB',
  buttonBackground: '#FFFFFF',
  buttonBorder: '#3498DB',
};

const screenTypography = {
  fontBold: 'System',
  buttonTextSize: 18,
};

const screenSpacing = {
  small: 8,
  medium: 16,
  large: 24,
};

const screenBorderRadius = {
  button: 12,
  logo: 8,
};
// -----------------------------------

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={screenColors.background} />
      <View style={styles.logoOuterContainer}>
                  <View style={styles.logoImageContainer}>
                    <Image
                      source={require('../assets/images/logo-cidadania-ativa.png')}
                      style={styles.logo}
                      resizeMode="contain"
                    />
                  </View>
                </View>
      <View style={styles.container}>
        <AppButton
          title="Buscar Produto"
          onPress={() => navigation.navigate('SearchProduct')}
          style={styles.button}
          textStyle={styles.buttonText}
        />
        <AppButton
          title="Buscar Evento"
          onPress={() => navigation.navigate('SearchEvent')}
          style={styles.button}
          textStyle={styles.buttonText}
        />
        <AppButton
          title="+ Cadastrar Produto"
          onPress={() => navigation.navigate('ProductRegistration')}
          style={styles.buttonFilled}
          textStyle={styles.buttonTextFilled}
        />
        <AppButton
          title="+ Cadastrar Evento"
          onPress={() => navigation.navigate('EventRegistration')}
          style={styles.buttonFilled}
          textStyle={styles.buttonTextFilled}
        />
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: screenColors.background,
  },
  logoOuterContainer: {
    alignItems: 'center',
    marginTop: SCREEN_HEIGHT * 0.08,
    marginBottom: theme.spacing.xlarge,
  },
  logoImageContainer: {
    width: 140,
    height: 140,
    backgroundColor: theme.colors.logoBackground,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: screenSpacing.large,
    backgroundColor: screenColors.background,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    borderWidth: 1,
    borderColor: screenColors.buttonBorder,
    backgroundColor: screenColors.buttonBackground,
    paddingVertical: screenSpacing.medium,
    borderRadius: screenBorderRadius.button,
    marginBottom: screenSpacing.small,
  },
  buttonFilled: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    backgroundColor: screenColors.primary,
    paddingVertical: screenSpacing.medium,
    borderRadius: screenBorderRadius.button,
    marginBottom: screenSpacing.small,
  },
  buttonText: {
    fontSize: screenTypography.buttonTextSize,
    fontFamily: screenTypography.fontBold,
    color: screenColors.primary,
    marginLeft: screenSpacing.small,
  },
  buttonTextFilled: {
    fontSize: screenTypography.buttonTextSize,
    fontFamily: screenTypography.fontBold,
    color: '#FFFFFF',
    marginLeft: screenSpacing.small,
  },
});
