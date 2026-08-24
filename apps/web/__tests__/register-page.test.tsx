import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterPage from '../app/(auth)/auth/register/page';

// ── Mocks ──

const mockPush = vi.fn();
const mockRegister = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('@mcp/auth', () => ({
  useAuth: () => ({ register: mockRegister }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// ── Helpers ──

async function fillAndSubmit(fields: {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}) {
  const user = userEvent.setup();

  if (fields.username !== undefined && fields.username !== '') {
    await user.type(screen.getByLabelText('Username'), fields.username);
  }
  if (fields.email !== undefined && fields.email !== '') {
    await user.type(screen.getByLabelText('Email'), fields.email);
  }
  if (fields.password !== undefined && fields.password !== '') {
    await user.type(screen.getByLabelText('Password', { exact: true }), fields.password);
  }
  if (fields.confirmPassword !== undefined && fields.confirmPassword !== '') {
    await user.type(screen.getByLabelText('Confirm Password'), fields.confirmPassword);
  }

  // Submit the form directly — userEvent.click on the submit button has a
  // React state batching quirk when user.type was called on multiple fields.
  fireEvent.submit(screen.getByLabelText('Username').closest('form')!);
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ──

  it('renders the registration form with all elements', () => {
    render(<RegisterPage />);

    expect(screen.getByText('Create an account')).toBeInTheDocument();
    expect(screen.getByText('Join the Minecraft Platform community')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password', { exact: true })).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });

  it('shows password requirements list after typing in password field', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    // Password rules are conditionally rendered only when form.password has a value
    await user.type(screen.getByLabelText('Password', { exact: true }), 'x');

    expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
    expect(screen.getByText('One uppercase letter')).toBeInTheDocument();
    expect(screen.getByText('One lowercase letter')).toBeInTheDocument();
    expect(screen.getByText('One number')).toBeInTheDocument();
  });

  it('renders a link to Terms of Service and Privacy Policy', () => {
    render(<RegisterPage />);
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  // ── Username validation ──

  it('shows error when username is empty', async () => {
    render(<RegisterPage />);
    await fillAndSubmit({ username: '', email: 'test@example.com', password: 'Password1', confirmPassword: 'Password1' });
    expect(screen.getByText('Username is required')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows error when username is too short', async () => {
    render(<RegisterPage />);
    await fillAndSubmit({ username: 'ab', email: 'test@example.com', password: 'Password1', confirmPassword: 'Password1' });
    expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows error when username has invalid characters', async () => {
    render(<RegisterPage />);
    await fillAndSubmit({ username: 'user name!', email: 'test@example.com', password: 'Password1', confirmPassword: 'Password1' });
    expect(screen.getByText('Letters, numbers, and underscores only')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  // ── Email validation ──

  it('shows error when email is empty', async () => {
    render(<RegisterPage />);
    await fillAndSubmit({ username: 'johndoe', email: '', password: 'Password1', confirmPassword: 'Password1' });
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows error for invalid email', async () => {
    render(<RegisterPage />);
    await fillAndSubmit({ username: 'johndoe', email: 'notanemail', password: 'Password1', confirmPassword: 'Password1' });
    expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  // ── Password validation ──

  it('shows error when password is empty', async () => {
    render(<RegisterPage />);
    await fillAndSubmit({ username: 'johndoe', email: 'test@example.com', password: '', confirmPassword: '' });
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows error when password is too short', async () => {
    render(<RegisterPage />);
    await fillAndSubmit({ username: 'johndoe', email: 'test@example.com', password: 'Short1A', confirmPassword: 'Short1A' });
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows error when password lacks uppercase letter', async () => {
    render(<RegisterPage />);
    await fillAndSubmit({ username: 'johndoe', email: 'test@example.com', password: 'password1', confirmPassword: 'password1' });
    expect(screen.getByText('Must contain an uppercase letter')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows error when password lacks lowercase letter', async () => {
    render(<RegisterPage />);
    await fillAndSubmit({ username: 'johndoe', email: 'test@example.com', password: 'PASSWORD1', confirmPassword: 'PASSWORD1' });
    expect(screen.getByText('Must contain a lowercase letter')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows error when password lacks a number', async () => {
    render(<RegisterPage />);
    await fillAndSubmit({ username: 'johndoe', email: 'test@example.com', password: 'PasswordA', confirmPassword: 'PasswordA' });
    expect(screen.getByText('Must contain a number')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  // ── Confirm password validation ──

  it('shows error when confirm password is empty', async () => {
    render(<RegisterPage />);
    await fillAndSubmit({ username: 'johndoe', email: 'test@example.com', password: 'Password1', confirmPassword: '' });
    expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows error when passwords do not match', async () => {
    render(<RegisterPage />);
    await fillAndSubmit({ username: 'johndoe', email: 'test@example.com', password: 'Password1', confirmPassword: 'Different1' });
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  // ── Successful registration ──

  it('calls register and redirects on successful submission', async () => {
    mockRegister.mockResolvedValueOnce(undefined);
    render(<RegisterPage />);

    await fillAndSubmit({
      username: 'johndoe',
      email: 'john@example.com',
      password: 'SecurePass1',
      confirmPassword: 'SecurePass1',
    });

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        username: 'johndoe',
        email: 'john@example.com',
        password: 'SecurePass1',
      });
    });

    const { toast } = await import('sonner');
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  // ── Registration error ──

  it('shows error when registration fails', async () => {
    mockRegister.mockRejectedValueOnce(new Error('Username already taken'));
    render(<RegisterPage />);

    await fillAndSubmit({
      username: 'johndoe',
      email: 'john@example.com',
      password: 'SecurePass1',
      confirmPassword: 'SecurePass1',
    });

    await waitFor(() => {
      expect(screen.getByText('Username already taken')).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('uses fallback message when error is not an Error instance', async () => {
    mockRegister.mockRejectedValueOnce('Unknown');
    render(<RegisterPage />);

    await fillAndSubmit({
      username: 'johndoe',
      email: 'john@example.com',
      password: 'SecurePass1',
      confirmPassword: 'SecurePass1',
    });

    await waitFor(() => {
      expect(screen.getByText('Registration failed. Please try again.')).toBeInTheDocument();
    });
  });

  // ── Loading state ──

  it('disables inputs and shows spinner while submitting', async () => {
    mockRegister.mockReturnValue(new Promise(() => {}));

    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByLabelText('Username'), 'johndoe');
    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    await user.type(screen.getByLabelText('Password', { exact: true }), 'SecurePass1');
    await user.type(screen.getByLabelText('Confirm Password'), 'SecurePass1');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(screen.getByText('Creating account...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
    expect(screen.getByLabelText('Username')).toBeDisabled();
    expect(screen.getByLabelText('Email')).toBeDisabled();
    expect(screen.getByLabelText('Password', { exact: true })).toBeDisabled();
    expect(screen.getByLabelText('Confirm Password')).toBeDisabled();
  });

  // ── Password visibility toggles ──

  it('toggles password field visibility', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const passwordInput = screen.getByLabelText('Password', { exact: true });
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButtons = screen.getAllByRole('button', { name: '' });
    // First toggle button is for password
    await user.click(toggleButtons[0]);
    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(toggleButtons[0]);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('toggles confirm password field visibility', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const confirmInput = screen.getByLabelText('Confirm Password');
    expect(confirmInput).toHaveAttribute('type', 'password');

    const toggleButtons = screen.getAllByRole('button', { name: '' });
    // Second toggle button is for confirm password
    await user.click(toggleButtons[1]);
    expect(confirmInput).toHaveAttribute('type', 'text');

    await user.click(toggleButtons[1]);
    expect(confirmInput).toHaveAttribute('type', 'password');
  });

  // ── Password strength indicators ──

  it('shows checkmarks when password meets requirements', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByLabelText('Password', { exact: true }), 'SecurePass1');

    // All four rules should be visible with the passed styling class
    expect(screen.getByText('At least 8 characters').closest('div')?.className).toMatch(/text-emerald-600/);
    expect(screen.getByText('One uppercase letter').closest('div')?.className).toMatch(/text-emerald-600/);
    expect(screen.getByText('One lowercase letter').closest('div')?.className).toMatch(/text-emerald-600/);
    expect(screen.getByText('One number').closest('div')?.className).toMatch(/text-emerald-600/);
  });

  it('shows dimmed text for unmet password rules', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    // Type a password with special characters that fails ALL four rules
    // Rules: length >= 8, has uppercase, has lowercase, has number
    // "!!!!" has no letters/numbers and length 4 — fails all four
    await user.type(screen.getByLabelText('Password', { exact: true }), '!!!!');

    // All four rules should be visible with the muted styling
    expect(screen.getByText('At least 8 characters').closest('div')?.className).toMatch(/text-muted-foreground/);
    expect(screen.getByText('One uppercase letter').closest('div')?.className).toMatch(/text-muted-foreground/);
    expect(screen.getByText('One lowercase letter').closest('div')?.className).toMatch(/text-muted-foreground/);
    expect(screen.getByText('One number').closest('div')?.className).toMatch(/text-muted-foreground/);
  });
});
