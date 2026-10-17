import { useCallback, useState } from 'react';

import { validateSignUp } from '../utils/validateSignUp';
import type { SignUpErrors, SignUpField, SignUpForm } from '../utils/validateSignUp';

const INITIAL_FORM: SignUpForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  userType: 'regular',
  acceptedTerms: false,
};

export function useSignUpForm() {
  const [form, setForm] = useState<SignUpForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<SignUpErrors>({});

  const setField = useCallback(<K extends SignUpField>(field: K, value: SignUpForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // clear the error as soon as the user fixes the field
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }, []);

  // returns true when the form can be submitted
  const validate = useCallback(() => {
    const nextErrors = validateSignUp(form);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [form]);

  return { form, errors, setField, validate };
}
