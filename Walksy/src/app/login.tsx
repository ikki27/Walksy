import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing, typography } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/apiClient';

type LoginErrors = { email?: string; password?: string };

// same look as "Create account": orange title, rounded fields, button at the bottom
export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<LoginErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  const validate = () => {
    const next: LoginErrors = {};
    if (!email.trim()) next.email = t('errors.emailRequired');
    if (!password) next.password = t('errors.passwordRequired');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleLogin = async () => {
    if (submitting || !validate()) return;

    setSubmitting(true);
    setServerError(null);
    try {
      await login(email.trim(), password);
      // replace: after logging in, "back" shouldn't return to the login screen
      router.replace('/home');
    } catch (error) {
      const code = error instanceof ApiError ? error.code : 'unknown';
      setServerError(code === 'invalid_credentials' || code === 'network' ? code : 'unknown');
    } finally {
      setSubmitting(false);
    }
  };

  const serverErrorText =
    serverError === 'invalid_credentials'
      ? t('auth.errors.invalidCredentials')
      : serverError === 'network'
        ? t('auth.errors.network')
        : serverError
          ? t('auth.errors.unknown')
          : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{t('auth.loginTitle')}</Text>
          <Text style={styles.subtitle}>{t('auth.loginSubtitle')}</Text>

          <FormField
            label={t('createAccount.email')}
            placeholder={t('createAccount.emailPlaceholder')}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <FormField
            ref={passwordRef}
            label={t('createAccount.password')}
            placeholder="*************"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            error={errors.password}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={handleLogin}
          />

          {serverErrorText && (
            <Text style={styles.error} accessibilityRole="alert">
              {serverErrorText}
            </Text>
          )}

          <Pressable
            accessibilityRole="link"
            onPress={() => router.replace('/create-account')}
            style={styles.switchAuth}
            hitSlop={8}
          >
            <Text style={styles.switchAuthText}>
              {t('auth.noAccount')} <Text style={styles.switchAuthLink}>{t('auth.createOne')}</Text>
            </Text>
          </Pressable>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton label={t('auth.logIn')} onPress={handleLogin} />
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
            <Text style={styles.backText}>{t('createAccount.back')}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.md },
  title: { ...typography.subTitleFirst, color: colors.brand },
  subtitle: {
    ...typography.subTitleSecondary,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  error: { ...typography.body, color: colors.error, marginTop: spacing.xs },
  switchAuth: { alignSelf: 'center', marginTop: spacing.xl, paddingVertical: spacing.sm },
  switchAuthText: { ...typography.body, color: colors.textSecondary },
  switchAuthLink: { color: colors.brand, fontWeight: '700' },
  footer: { paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  backButton: { alignSelf: 'center', paddingVertical: spacing.sm, marginTop: spacing.xs },
  backText: { ...typography.body, color: colors.textSecondary },
});
