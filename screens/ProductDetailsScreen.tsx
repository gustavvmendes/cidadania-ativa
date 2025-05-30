// screens/ProductDetailsScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { RootStackParamList } from '../App';
import AppButton from '../src/components/AppButton';

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
};

const screenTypography = {
  fontRegular: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  fontBold: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  productNameSize: 20,
  productPriceSize: 16,
  descriptionTitleSize: 24,
  descriptionTextSize: 16,
  buyButtonTextSize: 18, // <<< Adicionado para o texto do botão comprar
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
  buyButton: 12, // <<< Adicionado para o botão comprar
};
// --- FIM DAS DEFINIÇÕES DE ESTILO LOCAIS ---

// Removido MOCK_PRODUCT, pois os dados virão dos parâmetros da rota
// const MOCK_PRODUCT = { ... };

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetails'>;

const ProductDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  // Extrai os dados do produto dos parâmetros da rota
  const product = route.params;

  // Fallback caso os parâmetros não sejam passados (idealmente, trate isso de forma mais robusta)
  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Produto não encontrado.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleBuyPress = () => {
    console.log(`Comprar ${product.name} pressionado! ID: ${product.productId}`);
    // Adicione sua lógica de compra aqui
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={screenColors.statusBar} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.imageContainer}>
          {/* `product.image` deve ser um número (resultado de require()) ou um objeto { uri: 'string' } */}
          <Image source={product.image} style={styles.productImage} resizeMode="contain" />
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.infoSection}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>{product.price}</Text>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionTitle}>Descrição</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buyButtonWrapper}>
        <AppButton
          title="Comprar! ➡"
          onPress={handleBuyPress}
          style={{
            backgroundColor: screenColors.buyButtonBackground,
            width: '100%',
            borderRadius: screenBorderRadius.buyButton, // Usando constante local
          }}
          textStyle={{
            color: screenColors.buyButtonText,
            textTransform: 'none',
            fontWeight: '600',
            fontSize: screenTypography.buyButtonTextSize, // Usando constante local
          }}
        />
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('SearchProduct')}>
          <Ionicons name="home-outline" size={28} color={screenColors.bottomNavIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => console.log('Profile pressed')}>
          <Ionicons name="person-outline" size={28} color={screenColors.bottomNavIcon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProductDetailsScreen;

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
  },
  descriptionSection: {
    marginBottom: screenSpacing.large,
  },
  descriptionTitle: {
    fontSize: screenTypography.descriptionTitleSize,
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
});