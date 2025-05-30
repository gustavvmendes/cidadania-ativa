// screens/SearchProductScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList, // Usaremos FlatList para renderizar os itens, mas não como scroller principal da tela
  Image,
  Platform,
  SafeAreaView,
  ScrollView, // ScrollView principal para todo o conteúdo da tela
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { RootStackParamList } from '../App';

// --- DEFINIÇÕES DE ESTILO LOCAIS (CORES, TIPOGRAFIA, ETC.) ---
const appColors = { /* ... Suas cores ... */ screenBackground: '#FFFFFF', logoContainerBackground: '#EBF5FF', titleText: '#333333', subtitleText: '#555555', searchText: '#333333', searchPlaceholder: '#A0A0A0', searchBorder: '#E0E0E0', searchIcon: '#808080', checkboxChecked: '#3498DB', checkboxUnchecked: '#808080', checkboxLabelText: '#333333', sliderLabelText: '#333333', sliderValueText: '#555555', sliderTrackMax: '#E0E0E0', cardBackground: '#FFFFFF', cardBorder: '#E0E0E0', productNameText: '#333333', productPriceText: '#3498DB', bottomNavBackground: '#FFFFFF', bottomNavBorder: '#E0E0E0', bottomNavIcon: '#808080', black: '#000000', white: '#FFFFFF' };
const appTypography = { /* ... Sua tipografia ... */ fontRegular: Platform.OS === 'ios' ? 'System' : 'sans-serif', fontBold: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium', titleSize: 26, subtitleSize: 16, bodySize: 16, captionSize: 12, inputSize: 16, productNameSize: 16, productPriceSize: 16 };
const appSpacing = { /* ... Seus espaçamentos ... */ xsmall: 4, small: 8, medium: 16, large: 24, xlarge: 30 };
const appBorderRadius = { /* ... Seus borderRadius ... */ small: 6, medium: 12, large: 16, searchBar: 25, productCard: 12, logoContainer: 25 };
// --- FIM DAS DEFINIÇÕES DE ESTILO LOCAIS ---

const { width } = Dimensions.get('window');

interface Product { /* ... Sua interface Product ... */ id: string; name: string; price: string; image: any; description: string; }
const MOCK_PRODUCTS: Product[] = [ /* ... Seus MOCK_PRODUCTS com description ... */  { id: '1', name: 'Brócolis Orgânico', price: 'R$ 3,99 Und', image: require('../assets/images/brocolis.png'), description: 'Brócolis fresco e orgânico...' }, { id: '2', name: 'Berinjela Selecionada', price: 'R$ 5,99 Und', image: require('../assets/images/brocolis.png'), description: 'Berinjelas selecionadas...' }, { id: '3', name: 'Cenoura Baby', price: 'R$ 2,50 Pct', image: require('../assets/images/brocolis.png'), description: 'Cenouras baby, adocicadas e crocantes.' }];
interface CheckboxItemProps { /* ... */ label: string; checked: boolean; onPress: () => void; }
interface ProductCardProps { /* ... */ item: Product; onPress: (product: Product) => void; }

type SearchProductScreenProps = NativeStackScreenProps<RootStackParamList, 'SearchProduct'>;

const CheckboxItem: React.FC<CheckboxItemProps> = ({ label, checked, onPress }) => ( <TouchableOpacity style={styles.checkboxContainer} onPress={onPress} activeOpacity={0.7}><Ionicons name={checked ? 'checkbox-sharp' : 'square-outline'} size={24} color={checked ? appColors.checkboxChecked : appColors.checkboxUnchecked} /><Text style={styles.checkboxLabel}>{label}</Text></TouchableOpacity> );
const ProductCard: React.FC<ProductCardProps> = ({ item, onPress }) => ( <TouchableOpacity onPress={() => onPress(item)} activeOpacity={0.8} style={styles.productCard}><Image source={item.image} style={styles.productImage} resizeMode="contain" /><Text style={styles.productName}>{item.name}</Text><Text style={styles.productPrice}>{item.price}</Text></TouchableOpacity> );

const SearchProductScreen: React.FC<SearchProductScreenProps> = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [noPesticides, setNoPesticides] = useState(true);
  const [cereal, setCereal] = useState(true);
  const [nonPerishable, setNonPerishable] = useState(true);
  const [priceValue, setPriceValue] = useState(100);

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetails', { productId: product.id, name: product.name, price: product.price, image: product.image, description: product.description });
  };

  const displayedProducts = useMemo(() => {
    if (!searchText.trim()) {
      return MOCK_PRODUCTS;
    }
    const lowercasedSearchText = searchText.toLowerCase();
    return MOCK_PRODUCTS.filter(product =>
      product.name.toLowerCase().includes(lowercasedSearchText)
    );
  }, [searchText]);

  // Componente para renderizar cada item na FlatList
  const renderProductItem = ({ item }: { item: Product }) => (
    <ProductCard item={item} onPress={handleProductPress} />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={appColors.screenBackground} />
      <ScrollView // <<< ScrollView principal para toda a tela (exceto bottomNav)
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Todo o conteúdo do cabeçalho e filtros vai aqui DENTRO da ScrollView */}
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/logo-cidadania-ativa.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>

        <Text style={styles.title}>Busque o que procura</Text>
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
          <CheckboxItem label="Sem Agrotóxicos" checked={noPesticides} onPress={() => setNoPesticides(!noPesticides)} />
          <CheckboxItem label="Cereal" checked={cereal} onPress={() => setCereal(!cereal)} />
          <CheckboxItem label="Não perecível" checked={nonPerishable} onPress={() => setNonPerishable(!nonPerishable)} />

          <View style={styles.sliderSection}>
            <View style={styles.sliderLabelContainer}>
              <Text style={styles.sliderLabel}>Valor</Text>
              <Text style={styles.sliderValueText}>R$0-{Math.round(priceValue)}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={priceValue}
              onValueChange={setPriceValue}
              minimumTrackTintColor={appColors.checkboxChecked}
              maximumTrackTintColor={appColors.searchBorder}
              thumbTintColor={appColors.checkboxChecked}
            />
          </View>
        </View>

        {(searchText.trim() && displayedProducts.length > 0) && (
           <Text style={styles.resultsTitle}>Resultados para "{searchText}"</Text>
        )}

        {/* FlatList para os produtos, renderizando todos os itens */}
        {displayedProducts.length === 0 ? (
          <Text style={styles.emptyListText}>
            {searchText.trim() ? `Nenhum produto encontrado para "${searchText}"` : "Nenhum produto na lista."}
          </Text>
        ) : (
          <FlatList
            data={displayedProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            // IMPORTANTE: Desabilitar a rolagem da FlatList interna
            scrollEnabled={false}
            // contentContainerStyle para padding se a FlatList tivesse muitos itens e rolasse
            // mas como scrollEnabled={false}, ela renderizará tudo e a ScrollView pai rolará.
            // O padding para os cards em si deve estar no styles.productCard ou em um container.
            style={styles.productListWrapper} // Para aplicar margens/paddings ao redor da lista inteira
          />
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => console.log("Home pressed")}>
          <Ionicons name="home-outline" size={28} color={appColors.bottomNavIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => console.log("Profile pressed")}>
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
  scrollView: { // Estilo para a ScrollView principal
    flex: 1,
  },
  scrollContentContainer: { // Estilo para o conteúdo da ScrollView principal
    paddingBottom: appSpacing.large, // Espaço no final, antes da bottomNav (que é fixa)
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? appSpacing.medium : appSpacing.small,
    paddingHorizontal: appSpacing.medium,
  },
  logoContainer: { /* ...mesmo de antes... */ width: 100, height: 100, backgroundColor: appColors.logoContainerBackground, borderRadius: appBorderRadius.logoContainer, justifyContent: 'center', alignItems: 'center', padding: appSpacing.small, marginBottom: appSpacing.small, shadowColor: appColors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  logoImage: { /* ...mesmo de antes... */ width: '80%', height: '80%' },
  title: { /* ...mesmo de antes... */ fontSize: appTypography.titleSize, fontFamily: appTypography.fontBold, color: appColors.titleText, textAlign: 'center', marginBottom: appSpacing.xsmall, paddingHorizontal: appSpacing.medium },
  subtitle: { /* ...mesmo de antes... */ fontSize: appTypography.subtitleSize, fontFamily: appTypography.fontRegular, color: appColors.subtitleText, textAlign: 'center', marginBottom: appSpacing.medium, paddingHorizontal: appSpacing.medium },
  searchContainer: { /* ...mesmo de antes... */ flexDirection: 'row', alignItems: 'center', backgroundColor: appColors.cardBackground, borderRadius: appBorderRadius.searchBar, marginHorizontal: appSpacing.medium, paddingHorizontal: appSpacing.medium, borderColor: appColors.searchBorder, borderWidth: 1, marginBottom: appSpacing.large, height: 50 },
  searchInput: { /* ...mesmo de antes... */ flex: 1, fontSize: appTypography.inputSize, fontFamily: appTypography.fontRegular, color: appColors.searchText, height: '100%' },
  searchIcon: { /* ...mesmo de antes... */ marginLeft: appSpacing.small },
  filtersContainer: { /* ...mesmo de antes... */ marginHorizontal: appSpacing.medium, marginBottom: appSpacing.large },
  checkboxContainer: { /* ...mesmo de antes... */ flexDirection: 'row', alignItems: 'center', marginBottom: appSpacing.medium },
  checkboxLabel: { /* ...mesmo de antes... */ marginLeft: appSpacing.small, fontSize: appTypography.bodySize, fontFamily: appTypography.fontRegular, color: appColors.checkboxLabelText },
  sliderSection: { /* ...mesmo de antes... */ marginTop: appSpacing.small },
  sliderLabelContainer: { /* ...mesmo de antes... */ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: appSpacing.xsmall },
  sliderLabel: { /* ...mesmo de antes... */ fontSize: appTypography.bodySize, fontFamily: appTypography.fontBold, color: appColors.sliderLabelText },
  sliderValueText: { /* ...mesmo de antes... */ fontSize: appTypography.bodySize, fontFamily: appTypography.fontRegular, color: appColors.sliderValueText },
  slider: { /* ...mesmo de antes... */ width: '100%', height: 40 },
  resultsTitle: { /* ...mesmo de antes... */ fontSize: appTypography.subtitleSize, fontFamily: appTypography.fontBold, color: appColors.titleText, marginHorizontal: appSpacing.medium, marginBottom: appSpacing.medium },
  productListWrapper: { // Estilo para o container da FlatList, para adicionar margens/paddings se necessário
    // Por exemplo, se quiser que a lista não cole nas bordas laterais do ScrollView:
    // marginHorizontal: appSpacing.medium,
  },
  productCard: {
    backgroundColor: appColors.cardBackground,
    borderRadius: appBorderRadius.productCard,
    padding: appSpacing.medium,
    marginBottom: appSpacing.medium,
    // Se productListWrapper não tiver marginHorizontal, adicione aqui:
    marginHorizontal: appSpacing.medium, 
    borderColor: appColors.cardBorder,
    borderWidth: 1,
    shadowColor: appColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: { /* ...mesmo de antes... */ width: '100%', height: 150, borderRadius: appBorderRadius.small, marginBottom: appSpacing.small },
  productName: { /* ...mesmo de antes... */ fontSize: appTypography.productNameSize, fontFamily: appTypography.fontBold, color: appColors.productNameText, marginBottom: appSpacing.xsmall },
  productPrice: { /* ...mesmo de antes... */ fontSize: appTypography.productPriceSize, fontFamily: appTypography.fontRegular, color: appColors.productPriceText },
  emptyListText: {
    textAlign: 'center',
    marginTop: appSpacing.large,
    fontSize: appTypography.bodySize,
    color: appColors.subtitleText,
    paddingHorizontal: appSpacing.medium,
    marginBottom: appSpacing.large, // Espaço extra se for o último item na ScrollView
  },
  bottomNav: { /* ...mesmo de antes... */ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: 70, backgroundColor: appColors.bottomNavBackground, borderTopWidth: 1, borderTopColor: appColors.bottomNavBorder },
  navButton: { /* ...mesmo de antes... */ flex: 1, alignItems: 'center', paddingVertical: appSpacing.medium },
});

export default SearchProductScreen;