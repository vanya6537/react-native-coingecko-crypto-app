import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { TokensListScreen, TokenDetailScreen } from '@screens/index';
import { fetchTokens } from '@state/index';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

export default function App(): React.JSX.Element {
  useEffect(() => {
    // Load initial tokens on app start
    fetchTokens({ page: 1 });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: '#FFFFFF' },
            }}
          >
            <Stack.Screen
              name="TokensList"
              component={TokensListScreen}
              options={{
                title: 'Crypto Tokens',
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
          </Stack.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
