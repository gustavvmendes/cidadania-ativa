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
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importar AsyncStorage
import { RootStackParamList } from '../App';
import AppButton from '../src/components/AppButton';
import { theme } from '../src/theme/theme';
import { API_BASE_URL } from '../src/config/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LoginScreen({ navigation }: Props) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLoginPress = async () => {
    if (!email || !senha) {
      Alert.alert('Erro de Login', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Armazenar o token JWT
        await AsyncStorage.setItem('userToken', data.data.token);
        Alert.alert("Login Bem-Sucedido", "Você foi logado com sucesso!");
        navigation.navigate("Home");
      } else {
        Alert.alert('Erro de Login', data.message || 'Credenciais inválidas.');
      }
    } catch (error) {
      console.error('Erro ao tentar login:', error);
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor. Verifique sua conexão ou tente novamente mais tarde.');
    }
  };

  const handleRegisterNavigation = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.gradientBlueStart} />

      <LinearGradient
        colors={[theme.colors.gradientBlueStart, theme.colors.white]}
        style={styles.gradientBackground}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          <View style={styles.logoOuterContainer}>
            <View style={styles.logoImageContainer}>
              <Image
                source={require('../assets/images/logo-cidadania-ativa.png')}
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
                color={theme.colors.iconGray}
                style={styles.icon}
              />
              <TextInput
                placeholderTextColor={theme.colors.placeholder}
                placeholder="Usuário:"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={22}
                color={theme.colors.iconGray}
                style={styles.icon}
              />
              <TextInput
                placeholderTextColor={theme.colors.placeholder}
                placeholder="Senha:"
                secureTextEntry={!passwordVisible}
                style={styles.input}
                value={senha}
                onChangeText={setSenha}
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(prev => !prev)}
                style={styles.iconRightButton}
              >
                <Ionicons
                  name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                  size={24}
                  color={theme.colors.iconGray}
                />
              </TouchableOpacity>
            </View>
          </View>

          <AppButton
            title="LOGIN"
            onPress={handleLoginPress}
            style={styles.actionButton}
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
    backgroundColor: theme.colors.backgroundMain,
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: SCREEN_HEIGHT * 0.55,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
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
  loginTitle: {
    fontSize: theme.typography.fontSizeLargeTitle,
    fontWeight: '600',
    color: theme.colors.textDark,
    marginBottom: theme.spacing.xlarge,
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
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: theme.spacing.medium,
    width: '90%',
    height: 55,
    borderColor: theme.colors.inputBorder,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.fontSizeInput,
    color: theme.colors.textInput,
    marginLeft: theme.spacing.small,
  },
  icon: {},
  iconRightButton: {
    padding: theme.spacing.small,
  },
  actionButton: {
    marginTop: theme.spacing.medium,
    width: '90%',
  },
  registerLinkContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing.xlarge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerPromptText: {
    fontSize: 14,
    color: theme.colors.textLinkPrompt,
  },
  registerLinkText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: theme.colors.textLinkAction,
  },
});


