import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useStore } from 'effector-react';
import { 
  LoginScreen, 
  TokensListScreen, 
  TokenDetailScreen, 
  PriceChartScreen 
} from './screens/index';
import { $isAuthenticated, loginSuccess, logout } from './state/index';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

export default function App(): React.JSX.Element {
  const isAuthenticated = useStore($isAuthenticated);

  const handleLoginSuccess = (token: string) => {
    loginSuccess(token);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animationEnabled: true,
            }}
          >
            {!isAuthenticated ? (
              // Auth Stack
              <Stack.Group
                screenOptions={{
                  headerShown: false,
                  animationEnabled: false,
                }}
              >
                <Stack.Screen
                  name="Login"
                  options={{
                    title: 'Login',
                    headerShown: false,
                  }}
                >
                  {() => (
                    <LoginScreen onLoginSuccess={handleLoginSuccess} />
                  )}
                </Stack.Screen>
              </Stack.Group>
            ) : (
              // App Stack
              <Stack.Group>
                <Stack.Screen
                  name="TokensList"
                  component={TokensListScreen}
                  options={{
                    title: 'Crypto Tokens',
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="TokenDetail"
                  component={TokenDetailScreen}
                  options={({ route }: any) => ({
                    title: route.params?.tokenId || 'Token Detail',
                    headerShown: true,
                    headerBackTitle: 'Back',
                    headerStyle: {
                      backgroundColor: '#FFFFFF',
                    },
                    headerTitleStyle: {
                      fontWeight: '700',
                      fontSize: 18,
                    },
                  })}
                />
                <Stack.Screen
                  name="PriceChart"
                  component={PriceChartScreen}
                  options={({ route }: any) => ({
                    title: route.params?.tokenName || 'Price Chart',
                    headerShown: true,
                    headerBackTitle: 'Back',
                    headerStyle: {
                      backgroundColor: '#FFFFFF',
                    },
                    headerTitleStyle: {
                      fontWeight: '700',
                      fontSize: 18,
                    },
                  })}
                />
              </Stack.Group>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
