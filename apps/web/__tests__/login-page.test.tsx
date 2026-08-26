import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../app/(auth)/auth/login/page';

// ── Mocks ──

const mockPush = vi.fn();
const mockLogin = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@mcp/auth', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// ── Helpers ──

/** Fill fields via userEvent, then submit the form via fireEvent.submit.
 *  We use fireEvent.submit because userEvent.click on the button has a React
 *  state batching quirk when user.type was called on multiple fields. */
async function fillAndSubmit(email: string, password: string) {
  const user = userEvent.setup();
  if (email) {
    await user.type(screen.getByLabelText('Email'), email);
  }
  if (password) {
    await user.type(screen.getByLabelText('Password'), password);
  }
  fireEvent.submit(screen.getByLabelText('Email').closest('form')!);
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ──

  it('renders the login form with all elements', () => {
    render(<LoginPage />);

    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your account to continue')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
  });

  it('renders the logo with link to home', () => {
    render(<LoginPage />);
    const logo = screen.getByText('Minecraft Platform');
    expect(logo.closest('a')).toHaveAttribute('href', '/');
  });

  // ── Client-side validation ──

  it('shows "Email is required" when email is empty', async () => {
    render(<LoginPage />);
    await fillAndSubmit('', 'somepassword');
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('shows "Invalid email address" for malformed email', async () => {
    render(<LoginPage />);
    await fillAndSubmit('notanemail', 'somepassword');
    expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('shows "Password is required" when password is empty', async () => {
    render(<LoginPage />);
    await fillAndSubmit('test@example.com', '');
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('shows both errors when both fields are empty', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('clears field-level error when user starts typing', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    // Trigger validation error first
    await fillAndSubmit('', 'somepassword');
    expect(screen.getByText('Email is required')).toBeInTheDocument();

    // Start typing in the email field
    await user.type(screen.getByLabelText('Email'), 'a');
    expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
  });

  // ── Successful login ──

  it('calls login and redirects on successful submission', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    render(<LoginPage />);

    await fillAndSubmit('test@example.com', 'correctpassword');

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'correctpassword',
      });
    });

    const { toast } = await import('sonner');
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Welcome back! You have been signed in.');
    });
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  // ── Login error ──

  it('shows an error toast and form error when login fails', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid email or password'));
    render(<LoginPage />);

    await fillAndSubmit('test@example.com', 'wrong');

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });

    const { toast } = await import('sonner');
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid email or password');
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('uses a fallback error message when error is not an Error instance', async () => {
    mockLogin.mockRejectedValueOnce('Something went wrong');
    render(<LoginPage />);

    await fillAndSubmit('test@example.com', 'wrong');

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });

  // ── Loading state ──

  it('disables inputs and shows spinner while submitting', async () => {
    mockLogin.mockReturnValue(new Promise(() => {}));

    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByText('Signing in...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    expect(screen.getByLabelText('Email')).toBeDisabled();
    expect(screen.getByLabelText('Password')).toBeDisabled();
  });

  // ── Password visibility toggle ──

  it('toggles password field type when eye icon is clicked', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: /show password/i }));
    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(screen.getByRole('button', { name: /hide password/i }));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
