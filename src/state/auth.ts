import { createEvent, createStore } from 'effector';

export interface AuthState {
  isAuthenticated: boolean;
  authToken: string | null;
  user: {
    id: string;
    email: string;
  } | null;
}

// Events
export const loginSuccess = createEvent<string>('loginSuccess');
export const logout = createEvent('logout');
export const restoreToken = createEvent<string>('restoreToken');

// Store
export const $authState = createStore<AuthState>({
  isAuthenticated: false,
  authToken: null,
  user: null,
})
  .on(loginSuccess, (state, token) => {
    const userId = `user_${Date.now()}`;
    const email = 'demo@example.com';
    return {
      isAuthenticated: true,
      authToken: token,
      user: {
        id: userId,
        email,
      },
    };
  })
  .on(logout, () => ({
    isAuthenticated: false,
    authToken: null,
    user: null,
  }))
  .on(restoreToken, (state, token) => ({
    isAuthenticated: true,
    authToken: token,
    user: state.user || { id: 'unknown', email: 'demo@example.com' },
  }));

// Derived stores
export const $isAuthenticated = $authState.map((state) => state.isAuthenticated);
export const $authToken = $authState.map((state) => state.authToken);
export const $user = $authState.map((state) => state.user);
