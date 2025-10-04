import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { useFonts, Orbitron_700Bold, Montserrat_400Regular } from '@expo-google-fonts/dev';
import { View, Text } from 'react-native';

export default function App() {
  let [fontsLoaded] = useFonts({
    Orbitron_700Bold,
    Montserrat_400Regular,
  });

  if (!fontsLoaded) {
    // A simple loader until fonts are ready
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
