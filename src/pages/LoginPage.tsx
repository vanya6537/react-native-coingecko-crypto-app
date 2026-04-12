/**
 * Pages - Login Page
 * Composes Auth feature
 */
import React from 'react';
import { LoginScreen as AuthLoginScreen } from '../features/auth';

interface LoginPageProps {
  onLoginSuccess: (token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  return <AuthLoginScreen onLoginSuccess={onLoginSuccess} />;
};
