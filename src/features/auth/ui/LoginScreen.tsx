/**
 * Auth Feature - UI Component: LoginScreen
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  FadeInDown,
  SlideInUp,
  SlideInDown,
  FadeIn,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  Layout,
  FadeInLeft,
  FadeInRight,
} from 'react-native-reanimated';
import { LanguageToggler } from '../../../shared/ui/LanguageToggler';

interface LoginScreenProps {
  onLoginSuccess: (token: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Animation state for login button
  const loginButtonScale = useSharedValue(1);
  const loginButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: loginButtonScale.value }],
  }));

  const handleLoginPressIn = () => {
    if (!loading) {
      loginButtonScale.value = withSpring(0.95, { damping: 8 });
    }
  };

  const handleLoginPressOut = () => {
    loginButtonScale.value = withSpring(1, { damping: 8 });
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('common.error'), t('auth.missingCredentials'));
      return;
    }

    setLoading(true);
    
    // Simulate API call with delay
    setTimeout(() => {
      // Mock authentication - any email/password combination works
      const mockToken = `token_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      setLoading(false);
      onLoginSuccess(mockToken);
    }, 1500);
  };

  const handleDemoLogin = () => {
    setEmail('demo@example.com');
    setPassword('password123');
    setTimeout(() => handleLogin(), 100);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.languageContainer}>
          <LanguageToggler compact={true} />
        </View>
        <Animated.View
          style={styles.content}
          entering={FadeInDown.duration(500).delay(100)}
          layout={Layout.springify()}
        >
          {/* Header */}
          <Animated.View
            style={styles.header}
            entering={FadeInDown.duration(400).delay(150)}
          >
            <Text style={styles.title}>{t('home.logo')} {t('home.title')}</Text>
            <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
          </Animated.View>

          {/* Form */}
          <Animated.View
            style={styles.form}
            // entering={SlideInUp.duration(400).delay(250)}
            layout={Layout.springify()}
          >
            <Animated.View
              style={styles.inputContainer}
              entering={FadeInDown.duration(400).delay(300)}
            >
              <Text style={styles.label}>{t('auth.email')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('auth.enterEmail')}
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />
            </Animated.View>

            <Animated.View
              style={styles.inputContainer}
              entering={FadeInLeft.duration(400).delay(350)}
            >
              <Text style={styles.label}>{t('auth.password')}</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder={t('auth.enterPassword')}
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Login Button */}
            <Animated.View
              style={[
                styles.loginButtonWrapper,
                loginButtonAnimatedStyle,
              ]}
              entering={FadeInRight.duration(400).delay(350)}
            >
              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                onPressIn={handleLoginPressIn}
                onPressOut={handleLoginPressOut}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.loginButtonText}>{t('auth.signIn')}</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Demo Login */}
            <Animated.View
              entering={FadeInLeft.duration(400).delay(350)}
            >
              <TouchableOpacity
                style={styles.demoButton}
                onPress={handleDemoLogin}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.demoButtonText}>{t('auth.tryDemo')}</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          {/* Footer */}
          <Animated.View
            style={styles.footer}
            entering={FadeIn.duration(400).delay(500)}
          >
            <Text style={styles.footerText}>{t('auth.demoCredentials')}</Text>
            <Text style={styles.footerText}>{t('auth.demoHint')}</Text>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  languageContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#212121',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    gap: 16,
  },
  loginButtonWrapper: {
    overflow: 'hidden',
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
    color: '#000',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
    height: 52,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  eyeButton: {
    padding: 8,
  },
  eyeIcon: {
    fontSize: 20,
  },
  loginButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  demoButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  demoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  footer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});
