/**
 * App Entry Point - FSD Architecture
 * Orchestrates all features and pages with global notifications
 */
import React from 'react';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nextProvider } from 'react-i18next';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Reanimated, { Easing, FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { QueryClientProvider } from '@tanstack/react-query';
import { useUnit } from 'effector-react';
import {
  LoginPage,
  TokensListPage,
  PriceChartPage,
  NotificationsShowcasePage,
} from '../pages';
import { ToastContainer } from '../features/notifications/ui/ToastContainer';
import { createQueryClient } from '../api/queryClient';
import i18n from '../shared/i18n';
import { $isAuthenticated, loginSuccess, logout } from '../features/auth';

// Enable optimized screens for React Navigation
enableScreens(true);

const Stack = createNativeStackNavigator();
const queryClient = createQueryClient();

export function App(): React.JSX.Element {
  const isAuthenticated = useUnit($isAuthenticated);

  const handleLoginSuccess = (token: string) => {
    loginSuccess(token);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nextProvider i18n={i18n}>
        <Reanimated.View style={{ flex: 1 }}>
          <SafeAreaProvider>
            <QueryClientProvider client={queryClient}>
            <NavigationContainer>
              <Stack.Navigator
                screenOptions={{
                  headerShown: false,
                }}
              >
                {!isAuthenticated ? (
                  <Stack.Group screenOptions={{ headerShown: false }}>
                    <Stack.Screen
                      name="Login"
                      options={{ title: 'Login', headerShown: false }}
                    >
                      {() => <LoginPage onLoginSuccess={handleLoginSuccess} />}
                    </Stack.Screen>
                  </Stack.Group>
                ) : (
                  <Stack.Group>
                    <Stack.Screen
                      name="TokensList"
                      component={TokensListPage}
                      options={{
                        title: 'Crypto Tokens',
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="NotificationsDemo"
                      component={NotificationsShowcasePage}
                      options={{
                        title: 'Notifications & Demo',
                        headerShown: true,
                        headerBackTitle: 'Back',
                        headerStyle: {
                          backgroundColor: '#FFFFFF',
                        },
                        headerTitleStyle: {
                          fontWeight: '700',
                          fontSize: 18,
                        },
                      }}
                    />
                    <Stack.Screen
                      name="PriceChart"
                      component={PriceChartPage}
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
            <ToastContainer />
          </QueryClientProvider>
        </SafeAreaProvider>
      </Reanimated.View>
      </I18nextProvider>
    </GestureHandlerRootView>
  );
}
