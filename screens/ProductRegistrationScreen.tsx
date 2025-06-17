// src/screens/ProductRegistration.tsx
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
} from 'react-native';
import { RootStackParamList } from '../App';
import AppButton from '../src/components/AppButton';
import { theme } from '../src/theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductRegistration'>;

const ProductRegistrationScreen = ({ navigation }: Props) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleRegisterPress = () => {
    console.log('Botão Cadastrar pressionado');
    console.log('Imagem selecionada:', selectedImage);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert('Permissão para acessar a galeria é necessária!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
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
        <Text style={styles.pageTitle}>Cadastre seu Produto</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TextInput
          style={styles.input}
          placeholderTextColor={theme.colors.placeholder}
          placeholder="Nome do Produto"
        />
        <TextInput
          style={styles.input}
          placeholderTextColor={theme.colors.placeholder}
          placeholder="Preço"
        />
        <TextInput
          style={styles.input}
          placeholderTextColor={theme.colors.placeholder}
          placeholder="Vigência da Oferta"
        />
        <TextInput
            style={[styles.input, styles.textArea]}
            placeholderTextColor={theme.colors.placeholder}
            placeholder="Descrição do Produto"
            multiline
            numberOfLines={5}
          />

          <TouchableOpacity onPress={pickImage} style={[styles.input, styles.imagePicker]}>
            <Text style={styles.imagePickerText}>
              {selectedImage ? 'Imagem selecionada ✔️' : '📷 Selecione uma imagem do produto'}
            </Text>
          </TouchableOpacity>

          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={{ width: 100, height: 100, marginBottom: 20, borderRadius: 10 }}
            />
          )}

        <AppButton
          title="Cadastrar"
          onPress={handleRegisterPress}
          style={styles.submitButton}
        />

      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductRegistrationScreen;

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
  textAlignVertical: 'top', // Garante que o texto comece do topo
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
