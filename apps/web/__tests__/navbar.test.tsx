import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Navbar } from '@/components/navbar';

vi.mock('@mcp/auth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/components/search-bar', () => ({
  SearchBar: () => <div data-testid="search-bar" />,
}));

vi.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <button data-testid="theme-toggle" />,
}));

const mockUseAuth = vi.fn();

describe('Navbar auth gate (H-F7)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a neutral skeleton in place of Sign In / avatar while auth is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      logout: vi.fn(),
    });
    render(<Navbar />);
    const skeleton = screen.getByTestId('navbar-auth-loading');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    // The flash we are guarding against: neither Sign In nor the avatar dropdown
    // should render while /auth/me is still resolving.
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    expect(screen.queryByText('Get Started')).not.toBeInTheDocument();
  });

  it('renders Sign In / Get Started when auth resolves to logged-out', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      logout: vi.fn(),
    });
    render(<Navbar />);
    // Skeleton must be gone once isLoading flips to false.
    expect(screen.queryByTestId('navbar-auth-loading')).not.toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('renders the avatar dropdown when auth resolves to logged-in', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', username: 'alice', email: 'a@b.c', role: 'USER' },
      isAuthenticated: true,
      isLoading: false,
      logout: vi.fn(),
    });
    render(<Navbar />);
    expect(screen.queryByTestId('navbar-auth-loading')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
  });
});
