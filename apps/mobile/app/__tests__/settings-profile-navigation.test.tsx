/* eslint-disable import/first */

const mockPush = jest.fn();
const mockUseAuth = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/src/auth', () => ({
  useAuth: () => mockUseAuth(),
}));

import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import ProfileRoute from '../profile';
import SettingsRoute from '../settings';

type MockUseAuthValue = {
  clearAuthError: jest.Mock;
  disabledReason: string | null;
  isConfigured: boolean;
  lastError: string | null;
  session: null;
  signInWithPassword: jest.Mock;
  signOut: jest.Mock;
  status: 'idle' | 'restoring' | 'ready';
  user: { email?: string | null; id: string } | null;
};

const createAuthValue = (overrides: Partial<MockUseAuthValue> = {}): MockUseAuthValue => ({
  clearAuthError: jest.fn(),
  disabledReason: null,
  isConfigured: true,
  lastError: null,
  session: null,
  signInWithPassword: jest.fn().mockResolvedValue({}),
  signOut: jest.fn().mockResolvedValue(undefined),
  status: 'ready',
  user: null,
  ...overrides,
});

describe('settings and profile routes', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockUseAuth.mockReset();
  });

  it('opens the profile route from settings', () => {
    render(<SettingsRoute />);

    fireEvent.press(screen.getByTestId('settings-profile-row'));

    expect(mockPush).toHaveBeenCalledWith('/profile');
  });

  it('renders logged-out profile state and submits email/password sign in', async () => {
    const authValue = createAuthValue();
    mockUseAuth.mockReturnValue(authValue);

    render(<ProfileRoute />);

    fireEvent.changeText(screen.getByTestId('profile-email-input'), ' user@example.test ');
    fireEvent.changeText(screen.getByTestId('profile-password-input'), 'secret-pass');
    fireEvent.press(screen.getByTestId('profile-sign-in-button'));

    await waitFor(() => {
      expect(authValue.signInWithPassword).toHaveBeenCalledWith({
        email: 'user@example.test',
        password: 'secret-pass',
      });
    });
    expect(screen.getByTestId('profile-signed-out-card')).toBeTruthy();
  });

  it('blocks sign in when the email address is not valid', () => {
    const authValue = createAuthValue();
    mockUseAuth.mockReturnValue(authValue);

    render(<ProfileRoute />);

    fireEvent.changeText(screen.getByTestId('profile-email-input'), 'not-an-email');
    fireEvent.changeText(screen.getByTestId('profile-password-input'), 'secret-pass');
    fireEvent.press(screen.getByTestId('profile-sign-in-button'));

    expect(authValue.signInWithPassword).not.toHaveBeenCalled();
    expect(screen.getByText('Enter a valid email address.')).toBeTruthy();
  });

  it('surfaces inline auth failure feedback near the sign-in form and clears stale errors on input', () => {
    const authValue = createAuthValue({
      lastError: 'Invalid login credentials',
    });
    mockUseAuth.mockReturnValue(authValue);

    render(<ProfileRoute />);

    expect(screen.getByTestId('profile-inline-error')).toBeTruthy();
    expect(screen.getByText('Invalid login credentials')).toBeTruthy();

    fireEvent.changeText(screen.getByTestId('profile-email-input'), 'next@example.test');

    expect(authValue.clearAuthError).toHaveBeenCalledTimes(1);
  });

  it('renders logged-in profile state with account email and sign-out action', async () => {
    const authValue = createAuthValue({
      user: {
        id: 'user-1',
        email: 'member@example.test',
      },
    });
    mockUseAuth.mockReturnValue(authValue);

    render(<ProfileRoute />);

    expect(screen.getByTestId('profile-signed-in-card')).toBeTruthy();
    expect(screen.getByText('member@example.test')).toBeTruthy();
    expect(screen.getByTestId('profile-management-placeholder')).toBeTruthy();

    fireEvent.press(screen.getByTestId('profile-sign-out-button'));

    await waitFor(() => {
      expect(authValue.signOut).toHaveBeenCalledTimes(1);
    });
  });
});
