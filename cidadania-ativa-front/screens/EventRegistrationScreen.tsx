// src/screens/EventRegistration.tsx
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../App';
import AppButton from '../src/components/AppButton';
import { theme } from '../src/theme/theme';
import { API_BASE_URL } from '../src/config/api'; // Importar API_BASE_URL

type Props = NativeStackScreenProps<RootStackParamList, 'EventRegistration'>;

const EventRegistrationScreen = ({ navigation }: Props) => {
  const [nomeEvento, setNomeEvento] = useState('');
  const [localEvento, setLocalEvento] = useState('');
  const [dataEvento, setDataEvento] = useState('');
  const [descricao, setDescricao] = useState('');
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegisterPress = async () => {
    if (!nomeEvento || !localEvento || !dataEvento || !descricao) {
      Alert.alert('Erro de Cadastro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Validar formato da data (AAAA-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dataEvento)) {
      Alert.alert('Erro de Cadastro', 'Por favor, insira a data no formato AAAA-MM-DD (ex: 2024-12-25).');
      return;
    }

    // Validar se a data não é no passado
    const eventDate = new Date(dataEvento);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (eventDate < today) {
      Alert.alert('Erro de Cadastro', 'A data do evento não pode ser no passado.');
      return;
    }

    setLoading(true);

    try {
      // Obter o token de autenticação e dados do usuário
      const authToken = await AsyncStorage.getItem('userToken');
      const userDataString = await AsyncStorage.getItem('userData');

      const userData = userDataString ? JSON.parse(userDataString) : null;

      // Criar FormData para envio
      const formData = new FormData();
      formData.append('titulo', nomeEvento);
      formData.append('descricao', descricao);
      formData.append('tipo_anuncio', 'evento');
      formData.append('data_evento', dataEvento);
      formData.append('local_evento', localEvento);

      // Adicionar a imagem ao FormData se selecionada
      if (selectedImageUri) {
        // Obter informações do arquivo
        const uriParts = selectedImageUri.split('.');
        const fileType = uriParts[uriParts.length - 1];

        formData.append('imagem', {
          uri: selectedImageUri,
          name: `evento-${Date.now()}.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      const response = await fetch(`${API_BASE_URL}/anuncios`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          // NÃO definir Content-Type para FormData - o fetch faz isso automaticamente
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert(
          'Cadastro Bem-Sucedido',
          'Seu evento foi cadastrado com sucesso!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Limpar formulário
                setNomeEvento('');
                setLocalEvento('');
                setDataEvento('');
                setDescricao('');
                setSelectedImageUri(null);
                // Navegar de volta ou para outra tela
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        Alert.alert('Erro de Cadastro', data.message || 'Ocorreu um erro ao cadastrar o evento. Tente novamente.');
      }
    } catch (error: any) {
      console.error('Erro ao tentar cadastrar evento:', error);
      Alert.alert(
        'Erro de Conexão',
        'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permissão Necessária', 'Permissão para acessar a galeria é necessária!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8, // Reduzir qualidade para diminuir tamanho do arquivo
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem. Tente novamente.');
    }
  };

  const removeImage = () => {
    setSelectedImageUri(null);
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
        <Text style={styles.pageTitle}>Cadastre seu Evento</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TextInput
          style={styles.input}
          placeholderTextColor={theme.colors.placeholder}
          placeholder="Nome do Evento *"
          onChangeText={setNomeEvento}
          value={nomeEvento}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholderTextColor={theme.colors.placeholder}
          placeholder="Local do Evento *"
          onChangeText={setLocalEvento}
          value={localEvento}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholderTextColor={theme.colors.placeholder}
          placeholder="Data do Evento (AAAA-MM-DD) *"
          onChangeText={setDataEvento}
          value={dataEvento}
          editable={!loading}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholderTextColor={theme.colors.placeholder}
          placeholder="Descrição do Evento *"
          multiline
          numberOfLines={5}
          onChangeText={setDescricao}
          value={descricao}
          editable={!loading}
        />

        <TouchableOpacity
          onPress={pickImage}
          style={[styles.input, styles.imagePicker]}
          disabled={loading}
        >
          <Text style={styles.imagePickerText}>
            {selectedImageUri ? 'Imagem selecionada ✔️' : '📷 Selecione uma imagem do evento (Opcional)'}
          </Text>
        </TouchableOpacity>

        {selectedImageUri && (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: selectedImageUri }}
              style={styles.imagePreview}
            />
            <TouchableOpacity
              onPress={removeImage}
              style={styles.removeImageButton}
              disabled={loading}
            >
              <Ionicons name="close-circle" size={24} color="#ff4444" />
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.requiredFieldsNote}>
          * Campos obrigatórios
        </Text>

        <Text style={styles.permissionNote}>
          📝 Apenas usuários da prefeitura podem cadastrar eventos
        </Text>

        <AppButton
          title={loading ? "Cadastrando..." : "Cadastrar"}
          onPress={handleRegisterPress}
          style={[styles.submitButton, loading && styles.disabledButton]}
          disabled={loading}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default EventRegistrationScreen;

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
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  headerActionsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  imagePicker: {
    justifyContent: 'center',
  },
  imagePickerText: {
    color: theme.colors.textInput,
    fontSize: theme.typography.fontSizeBase,
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
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: theme.spacing.medium,
  },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  requiredFieldsNote: {
    fontSize: 12,
    color: theme.colors.placeholder,
    marginBottom: theme.spacing.small,
    textAlign: 'center',
  },
  permissionNote: {
    fontSize: 12,
    color: '#ff6b35',
    marginBottom: theme.spacing.medium,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  submitButton: {
    marginTop: theme.spacing.medium,
  },
  disabledButton: {
    opacity: 0.6,
  },
});



