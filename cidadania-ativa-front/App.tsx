import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ImageSourcePropType } from 'react-native';

import EventDetailsScreen from './screens/EventDetailsScreen';
import EventRegistrationScreen from './screens/EventRegistrationScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import ProductDetailsScreen from './screens/ProductDetailsScreen';
import ProductRegistrationScreen from './screens/ProductRegistrationScreen';
import RegisterScreen from './screens/RegisterScreen';
import SearchEventScreen from './screens/SearchEventScreen';
import SearchProductScreen from './screens/SearchProductScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  SearchProduct: undefined;
  SearchEvent: undefined;
  ProductDetails: {
    productId: string;
    name: string;
    price: string;
    image: ImageSourcePropType;
    description: string;
  };
  EventDetails: {
    productId: string;
    name: string;
    price: string;
    image: ImageSourcePropType;
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
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="SearchProduct" component={SearchProductScreen} />
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
        <Stack.Screen name="EventRegistration" component={EventRegistrationScreen} />
        <Stack.Screen name="ProductRegistration" component={ProductRegistrationScreen} />
        <Stack.Screen name="SearchEvent" component={SearchEventScreen} />
        <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


