import type { SignUpData } from '../types/account';

export type SignUpForm = SignUpData & { acceptedTerms: boolean };
export type SignUpField = keyof SignUpForm;
// values are translation keys, so errors show in the active language
export type SignUpErrors = Partial<Record<SignUpField, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 8;

export function validateSignUp(form: SignUpForm): SignUpErrors {
  const errors: SignUpErrors = {};

  if (!form.firstName.trim()) errors.firstName = 'errors.firstNameRequired';
  if (!form.lastName.trim()) errors.lastName = 'errors.lastNameRequired';

  if (!form.email.trim()) errors.email = 'errors.emailRequired';
  else if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'errors.emailInvalid';

  if (!form.password) errors.password = 'errors.passwordRequired';
  else if (form.password.length < MIN_PASSWORD_LENGTH) errors.password = 'errors.passwordTooShort';

  if (!form.acceptedTerms) errors.acceptedTerms = 'errors.termsRequired';

  return errors;
}
