import { useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Checkbox } from '../components/Checkbox';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import { SelectField } from '../components/SelectField';
import { colors, spacing, typography } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { USER_TYPES } from '../data/userTypes';
import { useSignUpForm } from '../hooks/useSignUpForm';
import { ApiError } from '../services/apiClient';

export default function CreateAccountScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { register } = useAuth();
  const { form, errors, setField, validate } = useSignUpForm();
  const [submitting, setSubmitting] = useState(false);
  // problems only the server can find (email taken, no connection)
  const [serverError, setServerError] = useState<string | null>(null);

  // "Next" on the keyboard jumps to the following field
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const userTypeOptions = useMemo(
    () => USER_TYPES.map((type) => ({ value: type.value, label: t(type.labelKey) })),
    [t],
  );

  // errors are stored as translation keys
  const errorText = (key?: string) => (key ? t(key) : undefined);

  const handleContinue = async () => {
    if (submitting || !validate()) return;

    setSubmitting(true);
    setServerError(null);
    try {
      const { acceptedTerms: _accepted, ...data } = form;
      await register(data, i18n.language);
      router.replace('/personalize');
    } catch (error) {
      const code = error instanceof ApiError ? error.code : 'unknown';
      setServerError(code === 'email_taken' || code === 'network' ? code : 'unknown');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{t('createAccount.title')}</Text>
          <Text style={styles.subtitle}>{t('createAccount.subtitle')}</Text>

          <FormField
            label={t('createAccount.firstName')}
            placeholder={t('createAccount.firstNamePlaceholder')}
            value={form.firstName}
            onChangeText={(text) => setField('firstName', text)}
            error={errorText(errors.firstName)}
            autoComplete="given-name"
            textContentType="givenName"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => lastNameRef.current?.focus()}
          />
          <FormField
            ref={lastNameRef}
            label={t('createAccount.lastName')}
            placeholder={t('createAccount.lastNamePlaceholder')}
            value={form.lastName}
            onChangeText={(text) => setField('lastName', text)}
            error={errorText(errors.lastName)}
            autoComplete="family-name"
            textContentType="familyName"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => emailRef.current?.focus()}
          />
          <FormField
            ref={emailRef}
            label={t('createAccount.email')}
            placeholder={t('createAccount.emailPlaceholder')}
            value={form.email}
            onChangeText={(text) => {
              setField('email', text);
              if (serverError === 'email_taken') setServerError(null);
            }}
            error={errorText(errors.email) ?? (serverError === 'email_taken' ? t('auth.errors.emailTaken') : undefined)}
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
            value={form.password}
            onChangeText={(text) => setField('password', text)}
            error={errorText(errors.password)}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="done"
          />
          <SelectField
            label={t('createAccount.userType')}
            value={form.userType}
            options={userTypeOptions}
            onChange={(value) => setField('userType', value)}
          />

          <View style={styles.consent}>
            <Checkbox
              checked={form.acceptedTerms}
              onChange={(checked) => setField('acceptedTerms', checked)}
              label={t('createAccount.terms')}
              error={errorText(errors.acceptedTerms)}
            />
          </View>

          <Pressable
            accessibilityRole="link"
            onPress={() => router.push('/login')}
            style={styles.switchAuth}
            hitSlop={8}
          >
            <Text style={styles.switchAuthText}>
              {t('auth.haveAccount')} <Text style={styles.switchAuthLink}>{t('auth.logIn')}</Text>
            </Text>
          </Pressable>
        </ScrollView>

        <View style={styles.footer}>
          {serverError && serverError !== 'email_taken' && (
            <Text style={styles.error} accessibilityRole="alert">
              {t(serverError === 'network' ? 'auth.errors.network' : 'auth.errors.unknown')}
            </Text>
          )}
          <PrimaryButton label={t('createAccount.continue')} onPress={handleContinue} />
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={8}
          >
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
  consent: { marginTop: spacing.lg + 4 },
  switchAuth: { alignSelf: 'center', marginTop: spacing.xl, paddingVertical: spacing.sm },
  switchAuthText: { ...typography.body, color: colors.textSecondary },
  switchAuthLink: { color: colors.brand, fontWeight: '700' },
  footer: { paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  error: { ...typography.body, color: colors.error, textAlign: 'center', marginBottom: spacing.sm },
  backButton: { alignSelf: 'center', paddingVertical: spacing.sm, marginTop: spacing.xs },
  backText: { ...typography.body, color: colors.textSecondary },
});
