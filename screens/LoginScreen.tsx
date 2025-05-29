// screens/LoginScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity, // Mantenha para o ícone do olho e o link de registro
  View,
} from 'react-native';
import { RootStackParamList } from '../App'; // Verifique o caminho
import AppButton from '../src/components/AppButton'; // Importe o AppButton
import { theme } from '../src/theme/theme'; // Importe o tema centralizado

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
// As constantes GRADIENT_TOP_COLOR_START e GRADIENT_TOP_COLOR_END foram removidas
// pois agora usaremos theme.colors

export default function LoginScreen({ navigation }: Props) {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleLoginPress = () => {
    // Sua lógica de login aqui
    console.log('Botão LOGIN Pressionado - via AppButton');
  };

  const handleRegisterNavigation = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.gradientBlueStart} />

      <LinearGradient
        colors={[theme.colors.gradientBlueStart, theme.colors.white]} // Usando cores do tema
        style={styles.gradientBackground}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          <View style={styles.logoOuterContainer}>
            <View style={styles.logoImageContainer}>
              <Image
                source={require('../assets/images/logo-cidadania-ativa.png')} // Verifique o caminho
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>

          <Text style={styles.loginTitle}>Login</Text>

          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={22}
                color={theme.colors.iconGray} // Usando cor do tema
                style={styles.icon}
              />
              <TextInput
                placeholderTextColor={theme.colors.placeholder} // Usando cor do tema
                placeholder="Usuário:"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={22}
                color={theme.colors.iconGray} // Usando cor do tema
                style={styles.icon}
              />
              <TextInput
                placeholderTextColor={theme.colors.placeholder} // Usando cor do tema
                placeholder="Senha:"
                secureTextEntry={!passwordVisible}
                style={styles.input}
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(prev => !prev)}
                style={styles.iconRightButton}
              >
                <Ionicons
                  name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                  size={24}
                  color={theme.colors.iconGray} // Usando cor do tema
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Usando o componente AppButton para o botão de Login */}
          <AppButton
            title="LOGIN"
            onPress={handleLoginPress}
            style={styles.actionButton} // Para margens ou ajustes de largura específicos
          />

          <View style={styles.registerLinkContainer}>
            <Text style={styles.registerPromptText}>
              Ainda não possui uma conta?{' '}
            </Text>
            <TouchableOpacity onPress={handleRegisterNavigation}>
              <Text style={styles.registerLinkText}>Registre-se</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.backgroundMain, // Cor de fundo principal do tema
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: SCREEN_HEIGHT * 0.55, // Ajuste conforme necessário
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20, // Pode usar theme.spacing.large ou similar
    paddingBottom: theme.spacing.large,
  },
  logoOuterContainer: {
    alignItems: 'center',
    marginTop: SCREEN_HEIGHT * 0.08,
    marginBottom: theme.spacing.xlarge,
  },
  logoImageContainer: {
    width: 140,
    height: 140,
    backgroundColor: theme.colors.logoBackground, // Usando cor do tema
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10, // Pode usar theme.spacing.small ou similar
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
  loginTitle: {
    fontSize: theme.typography.fontSizeLargeTitle, // Usando tipografia do tema
    fontWeight: '600',
    color: theme.colors.textDark, // Usando cor do tema
    marginBottom: theme.spacing.xlarge, // Usando espaçamento do tema
    textAlign: 'center',
  },
  inputWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white, // Usando cor do tema
    borderRadius: 12,
    paddingHorizontal: 15, // Pode usar theme.spacing.medium ou similar
    marginBottom: theme.spacing.medium, // Usando espaçamento do tema
    width: '90%',
    height: 55,
    borderColor: theme.colors.inputBorder, // Usando cor do tema
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.fontSizeInput, // Usando tipografia do tema
    color: theme.colors.textInput, // Usando cor do tema
    marginLeft: theme.spacing.small, // Usando espaçamento do tema
  },
  icon: {
    // Estilos de ícone já aplicados diretamente no componente Ionicons
  },
  iconRightButton: {
    padding: theme.spacing.small, // Usando espaçamento do tema
  },
  actionButton: { // Estilo para o AppButton
    marginTop: theme.spacing.medium,
    width: '90%', // Garante consistência com os inputs
  },
  // Os estilos 'button' e 'buttonText' foram removidos, pois AppButton os gerencia
  registerLinkContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing.xlarge, // Usando espaçamento do tema
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerPromptText: {
    fontSize: 14, // Considere adicionar a theme.typography
    color: theme.colors.textLinkPrompt, // Usando cor do tema
  },
  registerLinkText: {
    fontWeight: 'bold',
    fontSize: 14, // Considere adicionar a theme.typography
    color: theme.colors.textLinkAction, // Usando cor do tema
  },
});