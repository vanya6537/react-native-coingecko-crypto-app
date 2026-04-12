/**
 * Auth Feature - Types
 */
export interface AuthState {
  isAuthenticated: boolean;
  authToken: string | null;
  user: {
    id: string;
    email: string;
  } | null;
}
