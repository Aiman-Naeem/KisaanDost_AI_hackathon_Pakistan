import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ListingsScreen from '../screens/ListingsScreen';
import ListingDetailScreen from '../screens/ListingDetailScreen';
import AddListingScreen from '../screens/AddListingScreen';
import { MarketplaceStackParamList } from '../screens/ListingsScreen';

const Stack = createNativeStackNavigator<MarketplaceStackParamList>();

export default function MarketplaceNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#2e7d32' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen
        name="ListingsScreen"
        component={ListingsScreen}
        options={{ title: 'Marketplace' }}
      />
      <Stack.Screen
        name="ListingDetailScreen"
        component={ListingDetailScreen}
        options={{ title: 'Listing Details' }}
      />
      <Stack.Screen
        name="AddListingScreen"
        component={AddListingScreen}
        options={{ title: 'Add Listing' }}
      />
    </Stack.Navigator>
  );
}
