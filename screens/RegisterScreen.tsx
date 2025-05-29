// src/screens/RegisterScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react'; // useState pode ser necessário para os inputs no futuro
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity, // Mantenha para o link de Login e botão de voltar
  View,
} from 'react-native';
import { RootStackParamList } from '../App'; // Verifique o caminho
import AppButton from '../src/components/AppButton'; // Importe o novo componente AppButton
import { theme } from '../src/theme/theme'; // Importe o tema centralizado

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen = ({ navigation }: Props) => {
  // No futuro, você adicionaria estados para os inputs aqui:
  // const [firstName, setFirstName] = useState('');
  // const [lastName, setLastName] = useState('');
  // etc.

  const handleRegisterPress = () => {
    // Lógica de registro aqui
    console.log('Botão REGISTRE-SE pressionado');
    // Exemplo: console.log(firstName, lastName, email, password);
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
          // onChangeText={setFirstName}
          // value={firstName}
        />
        <TextInput
          style={styles.input}
          placeholderTextColor={theme.colors.placeholder}
          placeholder="Sobrenome"
          // onChangeText={setLastName}
          // value={lastName}
        />
        <TextInput
          style={styles.input}
          placeholderTextColor={theme.colors.placeholder}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          // onChangeText={setEmail}
          // value={email}
        />
        <TextInput
          style={styles.input}
          placeholderTextColor={theme.colors.placeholder}
          placeholder="Crie sua senha"
          secureTextEntry
          // onChangeText={setPassword}
          // value={password}
        />
        <TextInput
          style={styles.input}
          placeholderTextColor={theme.colors.placeholder}
          placeholder="Confirme sua senha"
          secureTextEntry
          // onChangeText={setConfirmPassword}
          // value={confirmPassword}
        />

        {/* Usando o novo componente AppButton */}
        <AppButton
          title="REGISTRE-SE"
          onPress={handleRegisterPress}
          style={styles.submitButton} // Adicionando um estilo específico se necessário (ex: margem)
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
    marginBottom: theme.spacing.medium, // Usando espaçamento do tema
    color: theme.colors.textInput,
    borderColor: theme.colors.inputBorder,
    borderWidth: 1,
  },
  // O AppButton agora tem seus próprios estilos, mas podemos adicionar uma margem específica aqui se necessário
  submitButton: {
    marginTop: theme.spacing.medium, // Adiciona uma margem acima do botão
    // A largura de '90%' já é o padrão do AppButton, então não precisa repetir aqui
    // a menos que queira um valor diferente para esta tela específica.
  },
  // Os estilos registerButton e registerButtonText foram removidos pois o AppButton os gerencia.
  loginLinkContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing.large, // Usando espaçamento do tema
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginPromptText: {
    fontSize: 14, // Poderia vir de theme.typography.fontSizeSmall ou similar
    color: theme.colors.textLinkPrompt,
  },
  loginLinkText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: theme.colors.textLinkAction,
  },
});