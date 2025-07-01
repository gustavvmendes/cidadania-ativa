// src/screens/RegisterScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
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
import { RootStackParamList } from '../App';
import AppButton from '../src/components/AppButton';
import { theme } from '../src/theme/theme';
import { apiRequest } from '../src/utils/api'; // Importar a função apiRequest

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen = ({ navigation }: Props) => {
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const handleRegisterPress = async () => {
    if (!nome || !sobrenome || !email || !senha || !confirmarSenha) {
      Alert.alert('Erro de Registro', 'Por favor, preencha todos os campos.');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Erro de Registro', 'As senhas não coincidem.');
      return;
    }

    try {
      const data = await apiRequest('/users', 'POST', {
        nome: `${nome} ${sobrenome}`,
        email,
        senha,
        tipo_usuario: 'cliente', // Assumindo que o registro é para clientes
      });

      if (data.success) {
        Alert.alert('Registro Bem-Sucedido', 'Sua conta foi criada com sucesso! Agora você pode fazer login.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Erro de Registro', data.message || 'Ocorreu um erro ao registrar. Tente novamente.');
      }
    } catch (error: any) {
      console.error('Erro ao tentar registrar:', error);
      Alert.alert('Erro de Conexão', error.message || 'Não foi possível conectar ao servidor. Verifique sua conexão ou tente novamente mais tarde.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.lightBlueHeaderArea} />

      <View style={styles.topHeaderSection}>
        <View style={styles.headerActionsContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={30} color={theme.colors.backArrow} />
          </TouchableOpacity>
        </View>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logo-cidadania-ativa.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.pageTitle}>Registre-se</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TextInput
          style={styles.input}
          placeholderTextColor={theme.colors.placeholder}
          placeholder="Primeiro Nome"
          onChangeText={setNome}
          value={nome}
        />
        <TextInput
          style={styles.input}
          placeholderTextColor={theme.colors.placeholder}
          placeholder="Sobrenome"
          onChangeText={setSobrenome}
          value={sobrenome}
        />
        <TextInput
          style={styles.input}
          placeholderTextColor={theme.colors.placeholder}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={setEmail}
          value={email}
        />
        <TextInput
          style={styles.input}
          placeholderTextColor={theme.colors.placeholder}
          placeholder="Crie sua senha"
          secureTextEntry
          onChangeText={setSenha}
          value={senha}
        />
        <TextInput
          style={styles.input}
          placeholderTextColor={theme.colors.placeholder}
          placeholder="Confirme sua senha"
          secureTextEntry
          onChangeText={setConfirmarSenha}
          value={confirmarSenha}
        />

        <AppButton
          title="REGISTRE-SE"
          onPress={handleRegisterPress}
          style={styles.submitButton}
        />

        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginPromptText}>
            Já possui uma conta?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLinkText}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.lightBlueHeaderArea,
  },
  topHeaderSection: {
    backgroundColor: theme.colors.lightBlueHeaderArea,
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerActionsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  backButton: {
    padding: 5,
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: theme.colors.logoBackground,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.colors.pageTitle,
    textAlign: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: theme.colors.backgroundMain,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
  },
  input: {
    width: '90%',
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: theme.typography.fontSizeBase,
    marginBottom: theme.spacing.medium,
    color: theme.colors.textInput,
    borderColor: theme.colors.inputBorder,
    borderWidth: 1,
  },
  submitButton: {
    marginTop: theme.spacing.medium,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing.large,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginPromptText: {
    fontSize: 14,
    color: theme.colors.textLinkPrompt,
  },
  loginLinkText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: theme.colors.textLinkAction,
  },
});


