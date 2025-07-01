// screens/EventDetailsScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../App';
import AppButton from '../src/components/AppButton';
import { API_BASE_URL } from '../src/config/api'; // Importar API_BASE_URL

// --- DEFINIÇÕES DE ESTILO LOCAIS ---
const screenColors = {
  background: '#FFFFFF',
  statusBar: '#FFFFFF',
  imageContainerBackground: '#FFFFFF',
  infoSectionBackground: '#FFFFFF',
  infoSectionBorder: '#EEEEEE',
  productNameText: '#333333',
  productPriceText: '#3498DB',
  descriptionTitleText: '#333333',
  descriptionParagraphText: '#555555',
  buyButtonBackground: '#4CAF50',
  buyButtonText: '#FFFFFF',
  bottomNavBackground: '#FFFFFF',
  bottomNavBorder: '#E0E0E0',
  bottomNavIcon: '#808080',
  black: '#000000',
  commentInputBackground: '#F5F5F5',
  commentInputBorder: '#E0E0E0',
  commentButtonBackground: '#3498DB',
  commentButtonText: '#FFFFFF',
  commentText: '#333333',
  commentAuthor: '#555555',
  commentDate: '#888888',
  errorText: '#ff4444',
  placeholderImage: '#f0f0f0'
};

const screenTypography = {
  fontRegular: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  fontBold: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  productNameSize: 20,
  productPriceSize: 16,
  descriptionTitleSize: 24,
  descriptionTextSize: 16,
  buyButtonTextSize: 18,
  commentTextSize: 14,
  commentAuthorSize: 12,
  commentDateSize: 10,
};

const screenSpacing = {
  xsmall: 4,
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 30,
};

const screenBorderRadius = {
  infoSectionCard: 8,
  buyButton: 12,
  commentInput: 8,
  commentCard: 8,
};
// --- FIM DAS DEFINIÇÕES DE ESTILO LOCAIS ---

interface Comment {
  id_comentario: number;
  id_usuario: number;
  nome_usuario: string; // Assumindo que o backend pode retornar o nome do usuário
  texto: string;
  data_criacao: string;
  id_comentario_pai?: number;
}

interface EventDetailsRouteParams {
  productId: string;
  name: string;
  price: string; // Para eventos, pode ser 'N/A'
  image: { uri: string } | number; // Pode ser URI ou require (para placeholder)
  description: string;
  tipo_anuncio: string;
  data_evento?: string | null;
  local_evento?: string | null;
}

type Props = NativeStackScreenProps<RootStackParamList, 'EventDetails'>;

const EventDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const product = route.params as EventDetailsRouteParams;
  const [newCommentText, setNewCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [errorComments, setErrorComments] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  // Função para validar e converter o ID do evento
  const validateEventId = (id: string): number | null => {
    // Converter para número
    const numericId = parseInt(id, 10);

    // Verificar se é um número válido, positivo e inteiro
    if (isNaN(numericId) || numericId <= 0 || !Number.isInteger(numericId)) {
      console.error('ID do evento inválido:', id);
      return null;
    }

    return numericId;
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    setErrorComments(null);

    try {
      // Validar o ID do evento antes de fazer a requisição
      const validEventId = validateEventId(product.productId);

      if (!validEventId) {
        setErrorComments('ID do evento inválido.');
        setLoadingComments(false);
        return;
      }

      const userToken = await AsyncStorage.getItem('userToken');

      const headers: { [key: string]: string } = {
        'Content-Type': 'application/json',
      };

      // Adicionar token de autenticação se disponível
      if (userToken) {
        headers['Authorization'] = `Bearer ${userToken}`;
      }

      const response = await fetch(`${API_BASE_URL}/anuncios/${validEventId}/comentarios`, {
        method: 'GET',
        headers: headers,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setComments(data.data || []);
      } else {
        setErrorComments(data.message || 'Erro ao carregar comentários.');
      }
    } catch (err: any) {
      console.error('Erro ao buscar comentários:', err);
      setErrorComments('Não foi possível conectar ao servidor para carregar os comentários.');
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [product.productId]);

  const handleParticipatePress = () => {
    console.log(`Participar ${product.name} pressionado! ID: ${product.productId}`);
    Alert.alert('Funcionalidade', 'A funcionalidade de participação ainda não foi implementada.');
  };

  const handleSubmitComment = async () => {
    if (!newCommentText.trim()) {
      Alert.alert('Erro', 'Por favor, digite um comentário.');
      return;
    }

    try {
      // Validar o ID do evento antes de fazer a requisição
      const validEventId = validateEventId(product.productId);

      if (!validEventId) {
        Alert.alert('Erro', 'ID do evento inválido.');
        return;
      }

      const userToken = await AsyncStorage.getItem('userToken');
      const userDataString = await AsyncStorage.getItem('userData');
      let userId = null;
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        userId = userData.user.id_usuario;
      }

      const response = await fetch(`${API_BASE_URL}/anuncios/${validEventId}/comentarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          id_usuario: userId,
          texto: newCommentText,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert('Sucesso', 'Comentário adicionado!');
        setNewCommentText('');
        fetchComments();
      } else {
        Alert.alert('Erro', data.message || 'Ocorreu um erro ao adicionar o comentário.');
      }
    } catch (error: any) {
      console.error('Erro ao enviar comentário:', error);
      Alert.alert('Erro de Conexão', error.message || 'Não foi possível conectar ao servidor para enviar o comentário.');
    }
  };

  const renderCommentItem = ({ item }: { item: Comment }) => (
    <View style={styles.commentCard}>
      <Text style={styles.commentAuthor}>{item.nome_usuario || `Usuário ${item.id_usuario}`}</Text>
      <Text style={styles.commentText}>{item.texto}</Text>
      <Text style={styles.commentDate}>{new Date(item.data_criacao).toLocaleString()}</Text>
    </View>
  );

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    // Fallback para placeholder se a imagem falhar
    product.image = require('../assets/images/placeholder-event.png');
  };

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Evento não encontrado.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={screenColors.statusBar} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.imageContainer}>
          {imageLoading && typeof product.image === 'object' && product.image.uri && (
            <ActivityIndicator
              style={styles.imageLoader}
              size="large"
              color={screenColors.productPriceText}
            />
          )}
          <Image
            source={product.image}
            style={styles.productImage}
            resizeMode="contain"
            onLoad={handleImageLoad}
            onError={handleImageError}
            onLoadStart={() => setImageLoading(true)}
          />
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.infoSection}>
            <Text style={styles.productName}>{product.name}</Text>
            {product.data_evento && (
              <Text style={styles.productPrice}>Data: {new Date(product.data_evento).toLocaleDateString()}</Text>
            )}
            {product.local_evento && (
              <Text style={styles.productPrice}>Local: {product.local_evento}</Text>
            )}
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionTitle}>Descrição</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>

          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>Comentários</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Adicione um comentário..."
              placeholderTextColor={screenColors.commentAuthor}
              multiline
              value={newCommentText}
              onChangeText={setNewCommentText}
            />
            <AppButton
              title="Enviar Comentário"
              onPress={handleSubmitComment}
              style={styles.commentButton}
              textStyle={{ color: screenColors.commentButtonText }}
            />

            {loadingComments ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={screenColors.productPriceText} />
                <Text style={styles.emptyCommentsText}>Carregando comentários...</Text>
              </View>
            ) : errorComments ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={24} color={screenColors.errorText} />
                <Text style={styles.emptyCommentsText}>Erro: {errorComments}</Text>
              </View>
            ) : comments.length === 0 ? (
              <Text style={styles.emptyCommentsText}>Nenhum comentário ainda. Seja o primeiro a comentar!</Text>
            ) : (
              <FlatList
                data={comments}
                renderItem={renderCommentItem}
                keyExtractor={(item) => item.id_comentario.toString()}
                scrollEnabled={false}
              />
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.buyButtonWrapper}>
        <AppButton
          title="Participar! ➡"
          onPress={handleParticipatePress}
          style={{
            backgroundColor: screenColors.buyButtonBackground,
            width: '100%',
            borderRadius: screenBorderRadius.buyButton,
          }}
          textStyle={{
            color: screenColors.buyButtonText,
            textTransform: 'none',
            fontWeight: '600',
            fontSize: screenTypography.buyButtonTextSize,
          }}
        />
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home-outline" size={28} color={screenColors.bottomNavIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Login')}>
          <Ionicons name="person-outline" size={28} color={screenColors.bottomNavIcon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EventDetailsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: screenColors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 70 + 70 + screenSpacing.medium,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: screenColors.imageContainerBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: '80%',
    height: '80%',
  },
  detailsContainer: {
    paddingHorizontal: screenSpacing.medium,
    paddingTop: screenSpacing.large,
  },
  infoSection: {
    marginBottom: screenSpacing.large,
    padding: screenSpacing.medium,
    backgroundColor: screenColors.infoSectionBackground,
    borderRadius: screenBorderRadius.infoSectionCard,
    borderColor: screenColors.infoSectionBorder,
    borderWidth: 1,
    shadowColor: screenColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  productName: {
    fontSize: screenTypography.productNameSize,
    fontFamily: screenTypography.fontBold,
    color: screenColors.productNameText,
    marginBottom: screenSpacing.small,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: screenTypography.productPriceSize,
    fontFamily: screenTypography.fontRegular,
    color: screenColors.productPriceText,
    textAlign: 'center',
    marginBottom: screenSpacing.xsmall,
  },
  descriptionSection: {
    marginBottom: screenSpacing.large,
  },
  descriptionTitle: {
    fontSize: screenTypography.descriptionTitleSize - 4,
    fontFamily: screenTypography.fontBold,
    color: screenColors.descriptionTitleText,
    marginBottom: screenSpacing.medium,
  },
  descriptionText: {
    fontSize: screenTypography.descriptionTextSize,
    fontFamily: screenTypography.fontRegular,
    color: screenColors.descriptionParagraphText,
    lineHeight: screenTypography.descriptionTextSize * 1.5,
  },
  commentsSection: {
    marginTop: screenSpacing.large,
    padding: screenSpacing.medium,
    backgroundColor: screenColors.infoSectionBackground,
    borderRadius: screenBorderRadius.infoSectionCard,
    borderColor: screenColors.infoSectionBorder,
    borderWidth: 1,
    shadowColor: screenColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  commentsTitle: {
    fontSize: screenTypography.descriptionTitleSize - 4,
    fontFamily: screenTypography.fontBold,
    color: screenColors.descriptionTitleText,
    marginBottom: screenSpacing.medium,
  },
  commentInput: {
    minHeight: 80,
    borderColor: screenColors.commentInputBorder,
    borderWidth: 1,
    borderRadius: screenBorderRadius.commentInput,
    padding: screenSpacing.small,
    marginBottom: screenSpacing.small,
    backgroundColor: screenColors.commentInputBackground,
    fontSize: screenTypography.commentTextSize,
    color: screenColors.commentText,
    textAlignVertical: 'top',
  },
  commentButton: {
    backgroundColor: screenColors.commentButtonBackground,
    marginBottom: screenSpacing.medium,
  },
  commentCard: {
    backgroundColor: screenColors.commentInputBackground,
    borderRadius: screenBorderRadius.commentCard,
    padding: screenSpacing.medium,
    marginBottom: screenSpacing.small,
    borderColor: screenColors.commentInputBorder,
    borderWidth: 1,
  },
  commentAuthor: {
    fontSize: screenTypography.commentAuthorSize,
    fontFamily: screenTypography.fontBold,
    color: screenColors.commentAuthor,
    marginBottom: screenSpacing.xsmall,
  },
  commentText: {
    fontSize: screenTypography.commentTextSize,
    fontFamily: screenTypography.fontRegular,
    color: screenColors.commentText,
    marginBottom: screenSpacing.xsmall,
  },
  commentDate: {
    fontSize: screenTypography.commentDateSize,
    color: screenColors.commentDate,
    textAlign: 'right',
  },
  emptyCommentsText: {
    textAlign: 'center',
    marginTop: screenSpacing.medium,
    fontSize: 14,
    color: screenColors.commentAuthor,
  },
  buyButtonWrapper: {
    paddingHorizontal: screenSpacing.medium,
    paddingVertical: screenSpacing.medium,
    backgroundColor: screenColors.background,
    borderTopWidth: 1,
    borderTopColor: screenColors.infoSectionBorder,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 70,
    backgroundColor: screenColors.bottomNavBackground,
    borderTopWidth: 1,
    borderTopColor: screenColors.bottomNavBorder,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: screenSpacing.medium,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: screenSpacing.medium,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: screenSpacing.medium,
  },
  imageLoader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -20,
    marginLeft: -20,
    zIndex: 1,
  },
});

