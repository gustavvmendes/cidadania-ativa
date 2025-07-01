// screens/SearchEventScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Dimensions,
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
import { theme } from '../src/theme/theme';
import { API_BASE_URL } from '../src/config/api'; // Importar API_BASE_URL

import { RootStackParamList } from '../App';

// --- DEFINIÇÕES DE ESTILO LOCAIS (CORES, TIPOGRAFIA, ETC.) ---
const appColors = {
  screenBackground: '#FFFFFF',
  logoContainerBackground: '#EBF5FF',
  titleText: '#333333',
  subtitleText: '#555555',
  searchText: '#333333',
  searchPlaceholder: '#A0A0A0',
  searchBorder: '#E0E0E0',
  searchIcon: '#808080',
  checkboxChecked: '#3498DB',
  checkboxUnchecked: '#808080',
  checkboxLabelText: '#333333',
  sliderLabelText: '#333333',
  sliderValueText: '#555555',
  sliderTrackMax: '#E0E0E0',
  cardBackground: '#FFFFFF',
  cardBorder: '#E0E0E0',
  productNameText: '#333333',
  productPriceText: '#3498DB',
  bottomNavBackground: '#FFFFFF',
  bottomNavBorder: '#E0E0E0',
  bottomNavIcon: '#808080',
  black: '#000000',
  white: '#FFFFFF',
  errorText: '#ff4444',
  placeholderImage: '#f0f0f0'
};

const appTypography = {
  fontRegular: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  fontBold: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  titleSize: 26,
  subtitleSize: 16,
  bodySize: 16,
  captionSize: 12,
  inputSize: 16,
  productNameSize: 16,
  productPriceSize: 16
};

const appSpacing = {
  xsmall: 4,
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 30
};

const appBorderRadius = {
  small: 6,
  medium: 12,
  large: 16,
  searchBar: 25,
  productCard: 12,
  logoContainer: 25
};

const { width } = Dimensions.get('window');

interface Event {
  id_anuncio: string;
  titulo: string;
  preco?: string; // Alterado para string
  imagem_url: string | null; // Alterado para imagem_url e pode ser null
  descricao: string;
  tipo_anuncio: string; // Adicionado para diferenciar produto/evento
  status: string;
  data_criacao: string;
  data_evento?: string; // Adicionado para eventos
  local_evento?: string; // Adicionado para eventos
}

interface CheckboxItemProps {
  label: string;
  checked: boolean;
  onPress: () => void;
}

interface EventCardProps {
  item: Event;
  onPress: (event: Event) => void;
}

type SearchEventScreenProps = NativeStackScreenProps<RootStackParamList, 'SearchEvent'>;

const CheckboxItem: React.FC<CheckboxItemProps> = ({ label, checked, onPress }) => (
  <TouchableOpacity style={styles.checkboxContainer} onPress={onPress} activeOpacity={0.7}>
    <Ionicons
      name={checked ? 'checkbox-sharp' : 'square-outline'}
      size={24}
      color={checked ? appColors.checkboxChecked : appColors.checkboxUnchecked}
    />
    <Text style={styles.checkboxLabel}>{label}</Text>
  </TouchableOpacity>
);

const EventCard: React.FC<EventCardProps> = ({ item, onPress }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const getImageSource = () => {
    if (imageError || !item.imagem_url) {
      return require('../assets/images/placeholder-event.png'); // Placeholder para eventos
    }
    return { uri: item.imagem_url };
  };

  return (
    <TouchableOpacity onPress={() => onPress(item)} activeOpacity={0.8} style={styles.productCard}>
      <View style={styles.imageContainer}>
        {imageLoading && !imageError && item.imagem_url && (
          <ActivityIndicator
            style={styles.imageLoader}
            size="small"
            color={appColors.checkboxChecked}
          />
        )}
        <Image
          source={getImageSource()}
          style={styles.productImage}
          resizeMode="cover"
          onError={handleImageError}
          onLoad={handleImageLoad}
          onLoadStart={() => setImageLoading(true)}
        />
        {!item.imagem_url && (
          <View style={styles.noImageOverlay}>
            <Ionicons name="calendar-outline" size={40} color={appColors.searchIcon} />
            <Text style={styles.noImageText}>Sem imagem</Text>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.titulo}</Text>
        {item.data_evento && (
          <Text style={styles.eventDate}>
            {new Date(item.data_evento).toLocaleDateString()}
          </Text>
        )}
        {item.local_evento && (
          <Text style={styles.eventLocation} numberOfLines={1}>
            {item.local_evento}
          </Text>
        )}
        <Text style={styles.productType}>Evento</Text>
      </View>
    </TouchableOpacity>
  );
};

const SearchEventScreen: React.FC<SearchEventScreenProps> = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      // Buscar apenas eventos
      const url = `${API_BASE_URL}/anuncios?status=aprovado&tipo_anuncio=evento&limit=50`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok && data.success) {
        setEvents(data.data || []);
      } else {
        setError(data.message || 'Erro ao carregar eventos.');
      }
    } catch (err: any) {
      console.error('Erro ao buscar eventos:', err);
      setError('Não foi possível conectar ao servidor para carregar os eventos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEventPress = (event: Event) => {
    navigation.navigate('EventDetails', {
      productId: event.id_anuncio,
      name: event.titulo,
      price: 'N/A', // Eventos não têm preço
      image: event.imagem_url ? { uri: event.imagem_url } : require('../assets/images/placeholder-event.png'),
      description: event.descricao,
      tipo_anuncio: event.tipo_anuncio,
      data_evento: event.data_evento || null,
      local_evento: event.local_evento || null,
    });
  };

  const displayedEvents = useMemo(() => {
    let filteredEvents = events;

    // Filtro por texto de busca
    if (searchText.trim()) {
      const lowercasedSearchText = searchText.toLowerCase();
      filteredEvents = filteredEvents.filter(event =>
        event.titulo.toLowerCase().includes(lowercasedSearchText) ||
        event.descricao.toLowerCase().includes(lowercasedSearchText) ||
        (event.local_evento && event.local_evento.toLowerCase().includes(lowercasedSearchText))
      );
    }

    return filteredEvents;
  }, [searchText, events]);

  const renderEventItem = ({ item }: { item: Event }) => (
    <EventCard item={item} onPress={handleEventPress} />
  );

  const handleRefresh = () => {
    fetchEvents();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={appColors.screenBackground} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <View style={styles.headerActionsContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={30} color={theme.colors.backArrow} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
              <Ionicons name="refresh" size={24} color={theme.colors.backArrow} />
            </TouchableOpacity>
          </View>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/logo-cidadania-ativa.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>

        <Text style={styles.title}>Busque seu Evento</Text>
        <Text style={styles.subtitle}>O que você busca</Text>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar evento..."
            placeholderTextColor={appColors.searchPlaceholder}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
          />
          <Ionicons name="search" size={22} color={appColors.searchIcon} style={styles.searchIcon} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={appColors.checkboxChecked} />
            <Text style={styles.loadingText}>Carregando eventos...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={appColors.errorText} />
            <Text style={styles.errorText}>Erro: {error}</Text>
            <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : displayedEvents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color={appColors.searchIcon} />
            <Text style={styles.emptyListText}>
              {searchText.trim() ? `Nenhum evento encontrado para "${searchText}"` : "Nenhum evento encontrado."}
            </Text>
          </View>
        ) : (
          <FlatList
            data={displayedEvents}
            renderItem={renderEventItem}
            keyExtractor={(item) => item.id_anuncio.toString()}
            scrollEnabled={false}
            style={styles.productListWrapper}
            numColumns={2}
            columnWrapperStyle={styles.row}
          />
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home-outline" size={28} color={appColors.bottomNavIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Login')}>
          <Ionicons name="person-outline" size={28} color={appColors.bottomNavIcon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: appColors.screenBackground,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: appSpacing.large,
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? appSpacing.medium : appSpacing.small,
    paddingHorizontal: appSpacing.medium,
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: appColors.logoContainerBackground,
    borderRadius: appBorderRadius.logoContainer,
    justifyContent: 'center',
    alignItems: 'center',
    padding: appSpacing.small,
    marginBottom: appSpacing.small,
    shadowColor: appColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  logoImage: {
    width: '80%',
    height: '80%'
  },
  title: {
    fontSize: appTypography.titleSize,
    fontFamily: appTypography.fontBold,
    color: appColors.titleText,
    textAlign: 'center',
    marginBottom: appSpacing.xsmall,
    paddingHorizontal: appSpacing.medium
  },
  subtitle: {
    fontSize: appTypography.subtitleSize,
    fontFamily: appTypography.fontRegular,
    color: appColors.subtitleText,
    textAlign: 'center',
    marginBottom: appSpacing.medium,
    paddingHorizontal: appSpacing.medium
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appColors.cardBackground,
    borderRadius: appBorderRadius.searchBar,
    marginHorizontal: appSpacing.medium,
    paddingHorizontal: appSpacing.medium,
    borderColor: appColors.searchBorder,
    borderWidth: 1,
    marginBottom: appSpacing.medium,
    height: 50
  },
  searchInput: {
    flex: 1,
    fontSize: appTypography.inputSize,
    fontFamily: appTypography.fontRegular,
    color: appColors.searchText,
    height: '100%'
  },
  searchIcon: {
    marginLeft: appSpacing.small
  },
  headerActionsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  backButton: {
    padding: 5,
  },
  refreshButton: {
    padding: 5,
  },
  productListWrapper: {
    paddingHorizontal: appSpacing.small,
  },
  row: {
    justifyContent: 'space-around',
  },
  productCard: {
    backgroundColor: appColors.cardBackground,
    borderRadius: appBorderRadius.productCard,
    padding: appSpacing.small,
    marginBottom: appSpacing.medium,
    marginHorizontal: appSpacing.small,
    borderColor: appColors.cardBorder,
    borderWidth: 1,
    shadowColor: appColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    width: (width / 2) - (appSpacing.medium * 2),
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
    marginBottom: appSpacing.small,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: appBorderRadius.small,
  },
  imageLoader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -10,
    marginLeft: -10,
    zIndex: 1,
  },
  noImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: appColors.placeholderImage,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: appBorderRadius.small,
  },
  noImageText: {
    fontSize: 10,
    color: appColors.searchIcon,
    marginTop: 4,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: appTypography.productNameSize - 2,
    fontFamily: appTypography.fontBold,
    color: appColors.productNameText,
    marginBottom: appSpacing.xsmall,
    minHeight: 32,
  },
  eventDate: {
    fontSize: appTypography.productPriceSize - 1,
    fontFamily: appTypography.fontRegular,
    color: appColors.productPriceText,
    marginBottom: appSpacing.xsmall,
  },
  eventLocation: {
    fontSize: appTypography.captionSize,
    fontFamily: appTypography.fontRegular,
    color: appColors.subtitleText,
    marginBottom: appSpacing.xsmall,
  },
  productType: {
    fontSize: appTypography.captionSize,
    color: appColors.subtitleText,
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: appSpacing.xlarge,
  },
  loadingText: {
    marginTop: appSpacing.medium,
    fontSize: appTypography.bodySize,
    color: appColors.subtitleText,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: appSpacing.xlarge,
    paddingHorizontal: appSpacing.medium,
  },
  errorText: {
    textAlign: 'center',
    marginTop: appSpacing.medium,
    fontSize: appTypography.bodySize,
    color: appColors.errorText,
    marginBottom: appSpacing.medium,
  },
  retryButton: {
    backgroundColor: appColors.checkboxChecked,
    paddingVertical: appSpacing.small,
    paddingHorizontal: appSpacing.medium,
    borderRadius: appBorderRadius.medium,
  },
  retryButtonText: {
    color: appColors.white,
    fontSize: appTypography.bodySize,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: appSpacing.xlarge,
    paddingHorizontal: appSpacing.medium,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: appSpacing.medium,
    fontSize: appTypography.bodySize,
    color: appColors.subtitleText,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 70,
    backgroundColor: appColors.bottomNavBackground,
    borderTopWidth: 1,
    borderTopColor: appColors.bottomNavBorder
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: appSpacing.medium
  },
});

export default SearchEventScreen;

