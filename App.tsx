// App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Adicionado NativeStackScreenProps para uso futuro se necessário
import React from 'react';
import { ImageSourcePropType } from 'react-native'; // Importado para tipar a imagem de forma mais precisa

import EventRegistrationScreen from './screens/EventRegistrationScreen';
import LoginScreen from './screens/LoginScreen';
import ProductDetailsScreen from './screens/ProductDetailsScreen';
import ProductRegistrationScreen from './screens/ProductRegistrationScreen';
import RegisterScreen from './screens/RegisterScreen';
import SearchProductScreen from './screens/SearchProductScreen';

// Defina os nomes de rota e parâmetros
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  SearchProduct: undefined;
  ProductDetails: { // <<< PARÂMETROS ADICIONADOS AQUI
    productId: string;
    name: string;
    price: string;
    image: ImageSourcePropType; // Usando ImageSourcePropType para a imagem
    description: string;
  };
  EventRegistration: undefined;
  ProductRegistration: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="ProductRegistration" // Mantido conforme seu original
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="SearchProduct" component={SearchProductScreen} />
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
        <Stack.Screen name="EventRegistration" component={EventRegistrationScreen} />
        <Stack.Screen name="ProductRegistration" component={ProductRegistrationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}