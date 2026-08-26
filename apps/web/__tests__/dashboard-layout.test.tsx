import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { DashboardLayout } from '@/components/dashboard-layout';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock child components
vi.mock('@/components/navbar', () => ({
  Navbar: () => <nav data-testid="navbar">Navbar</nav>,
}));

vi.mock('@/components/footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

// Auth state is controlled per-test so we can assert the hydration gate.
const mockUseAuth = vi.fn();
vi.mock('@mcp/auth', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('DashboardLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: null, isAuthenticated: false, isLoading: false });
  });

  it('renders a loading skeleton and hides children while auth is verifying (H-F7)', () => {
    mockUseAuth.mockReturnValue({ user: null, isAuthenticated: false, isLoading: true });
    render(
      <DashboardLayout>
        <h1>Dashboard Overview</h1>
      </DashboardLayout>,
    );
    expect(screen.getByTestId('auth-loading')).toBeInTheDocument();
    // The public sidebar + page content must NOT render during the verify
    // round-trip — otherwise signed-in admins briefly see the public
    // sidebar and pages like /dashboard/billing could observe
    // isAuthenticated=false long enough to redirect to /auth/login.
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
    expect(screen.queryByText('Dashboard Overview')).not.toBeInTheDocument();
    // Navbar + Footer remain so the layout shell doesn't jump.
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders Navbar and Footer', () => {
    render(
      <DashboardLayout>
        <div>Page Content</div>
      </DashboardLayout>,
    );
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <DashboardLayout>
        <h1>Dashboard Overview</h1>
      </DashboardLayout>,
    );
    // The main element contains the children; getByRole('main') gives us the desktop one
    const main = screen.getByRole('main');
    expect(within(main).getByText('Dashboard Overview')).toBeInTheDocument();
  });

  it('renders all sidebar navigation links', () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>,
    );
    const sidebar = document.querySelector('aside');
    expect(sidebar).toBeInTheDocument();
    expect(within(sidebar!).getByText('Overview')).toBeInTheDocument();
    expect(within(sidebar!).getByText('Analytics')).toBeInTheDocument();
    expect(within(sidebar!).getByText('Projects')).toBeInTheDocument();
    expect(within(sidebar!).getByText('Uploads')).toBeInTheDocument();
  });

  it('renders sidebar utility links (Settings, Help & FAQ)', () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>,
    );
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText(/Help & FAQ/i)).toBeInTheDocument();
  });

  it('has correct links pointing to dashboard pages', () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>,
    );
    const sidebar = document.querySelector('aside');
    expect(sidebar).toBeInTheDocument();

    const overviewLink = within(sidebar!).getByText('Overview').closest('a');
    expect(overviewLink).toHaveAttribute('href', '/dashboard');

    const analyticsLink = within(sidebar!).getByText('Analytics').closest('a');
    expect(analyticsLink).toHaveAttribute('href', '/dashboard/analytics');
  });

  it('has the correct page structure with sidebar and main content', () => {
    const { container } = render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>,
    );
    // Should have an <aside> for the sidebar
    expect(container.querySelector('aside')).toBeInTheDocument();
    // Should have a <main> element for content
    expect(container.querySelector('main')).toBeInTheDocument();
  });
});
