import type { ProfileUpdate, SignUpData, User } from '../types/account';
import { apiRequest } from './apiClient';

export type Session = { token: string; user: User };

export function register(data: SignUpData & { language: string; termsAccepted: boolean }) {
  return apiRequest<Session>('/auth/register', { method: 'POST', body: data });
}

export function login(email: string, password: string) {
  return apiRequest<Session>('/auth/login', { method: 'POST', body: { email, password } });
}

export function fetchMe() {
  return apiRequest<User>('/users/me');
}

export function updateProfile(update: ProfileUpdate) {
  return apiRequest<User>('/users/me', { method: 'PATCH', body: update });
}
