// screens/SearchProductScreen.tsx
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
  Alert,
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

interface Product {
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

interface ProductCardProps {
  item: Product;
  onPress: (product: Product) => void;
}

type SearchProductScreenProps = NativeStackScreenProps<RootStackParamList, 'SearchProduct'>;

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

const ProductCard: React.FC<ProductCardProps> = ({ item, onPress }) => {
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
      return require('../assets/images/placeholder-product.png'); // Você pode criar uma imagem placeholder
    }
    return { uri: item.imagem_url };
  };

  const formattedPrice = item.preco ? parseFloat(item.preco).toFixed(2).replace('.', ',') : '0,00';

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
            <Ionicons name="image-outline" size={40} color={appColors.searchIcon} />
            <Text style={styles.noImageText}>Sem imagem</Text>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.titulo}</Text>
        {item.tipo_anuncio === 'produto' && (
          <Text style={styles.productPrice}>
            {`R$ ${formattedPrice}`}
          </Text>
        )}
        <Text style={styles.productType}>{item.tipo_anuncio === 'produto' ? 'Produto' : 'Evento'}</Text>
      </View>
    </TouchableOpacity>
  );
};

const SearchProductScreen: React.FC<SearchProductScreenProps> = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [priceValue, setPriceValue] = useState(1000);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Buscar apenas produtos
      const url = `${API_BASE_URL}/anuncios?status=aprovado&tipo_anuncio=produto&limit=50`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok && data.success) {
        setProducts(data.data || []);
      } else {
        setError(data.message || 'Erro ao carregar produtos.');
      }
    } catch (err: any) {
      console.error('Erro ao buscar produtos:', err);
      setError('Não foi possível conectar ao servidor para carregar os produtos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetails', {
      productId: product.id_anuncio,
      name: product.titulo,
      price: product.preco ? parseFloat(product.preco).toFixed(2).replace('.', ',') : 'N/A',
      image: product.imagem_url ? { uri: product.imagem_url } : require('../assets/images/placeholder-product.png'),
      description: product.descricao,
      tipo_anuncio: product.tipo_anuncio,
      data_evento: product.data_evento || null,
      local_evento: product.local_evento || null,
    });
  };

  const displayedProducts = useMemo(() => {
    let filteredProducts = products;

    // Filtro por texto de busca
    if (searchText.trim()) {
      const lowercasedSearchText = searchText.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.titulo.toLowerCase().includes(lowercasedSearchText) ||
        product.descricao.toLowerCase().includes(lowercasedSearchText)
      );
    }

    // Filtro por preço (apenas para produtos)
    filteredProducts = filteredProducts.filter(product => {
      const productPrice = product.preco ? parseFloat(product.preco) : 0;
      return product.tipo_anuncio !== 'produto' || productPrice <= priceValue;
    });

    return filteredProducts;
  }, [searchText, products, priceValue]);

  const renderProductItem = ({ item }: { item: Product }) => (
    <ProductCard item={item} onPress={handleProductPress} />
  );

  const handleRefresh = () => {
    fetchProducts();
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

        <Text style={styles.title}>Busque seu Produto</Text>
        <Text style={styles.subtitle}>O que você busca</Text>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar produto..."
            placeholderTextColor={appColors.searchPlaceholder}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
          />
          <Ionicons name="search" size={22} color={appColors.searchIcon} style={styles.searchIcon} />
        </View>

        <View style={styles.filtersContainer}>
          <View style={styles.sliderSection}>
            <View style={styles.sliderLabelContainer}>
              <Text style={styles.sliderLabel}>Preço máximo</Text>
              <Text style={styles.sliderValueText}>R$ 0 - {priceValue}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1000}
              step={10}
              value={priceValue}
              onValueChange={setPriceValue}
              minimumTrackTintColor={appColors.checkboxChecked}
              maximumTrackTintColor={appColors.searchBorder}
              thumbTintColor={appColors.checkboxChecked}
            />
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={appColors.checkboxChecked} />
            <Text style={styles.loadingText}>Carregando produtos...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={appColors.errorText} />
            <Text style={styles.errorText}>Erro: {error}</Text>
            <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : displayedProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={appColors.searchIcon} />
            <Text style={styles.emptyListText}>
              {searchText.trim() ? `Nenhum produto encontrado para "${searchText}"` : "Nenhum produto encontrado."}
            </Text>
          </View>
        ) : (
          <FlatList
            data={displayedProducts}
            renderItem={renderProductItem}
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
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Login')}> { /* Exemplo: navegar para o perfil ou login */}
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
  filtersContainer: {
    marginHorizontal: appSpacing.medium,
    marginBottom: appSpacing.large
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: appSpacing.medium
  },
  checkboxLabel: {
    marginLeft: appSpacing.small,
    fontSize: appTypography.bodySize,
    fontFamily: appTypography.fontRegular,
    color: appColors.checkboxLabelText
  },
  sliderSection: {
    marginTop: appSpacing.small
  },
  sliderLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: appSpacing.xsmall
  },
  sliderLabel: {
    fontSize: appTypography.bodySize,
    fontFamily: appTypography.fontBold,
    color: appColors.sliderLabelText
  },
  sliderValueText: {
    fontSize: appTypography.bodySize,
    fontFamily: appTypography.fontRegular,
    color: appColors.sliderValueText
  },
  slider: {
    width: '100%',
    height: 40
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
  productPrice: {
    fontSize: appTypography.productPriceSize - 1,
    fontFamily: appTypography.fontRegular,
    color: appColors.productPriceText,
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

export default SearchProductScreen;

