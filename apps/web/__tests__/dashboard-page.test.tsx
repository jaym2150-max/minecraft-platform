import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardPage from '../app/(dashboard)/dashboard/page';
import type { DashboardStats, DashboardProject } from '@/hooks/use-dashboard';

function renderWithQueryClient(ui: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

// ── Mock next/navigation (used by DashboardLayout) ──

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

// ── Mock next/link ──

vi.mock('next/link', () => ({
  default: ({ children, href, className, ...props }: any) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}));

// ── Mock Navbar / Footer ──

vi.mock('@/components/navbar', () => ({ Navbar: () => <nav data-testid="navbar" /> }));
vi.mock('@/components/footer', () => ({ Footer: () => <footer data-testid="footer" /> }));

// ── Mock DashboardLayout to avoid children duplication (tested separately) ──

vi.mock('@/components/dashboard-layout', () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// ── Mock StatCard (reduce noise — we test StatCard separately) ──

vi.mock('@/components/stat-card', () => ({
  StatCard: ({ label, value }: { label: string; value: string }) => (
    <div data-testid={`stat-${label.replace(/\s+/g, '-').toLowerCase()}`}>
      {label}: {value}
    </div>
  ),
}));

// ── Mock Recharts (avoids SVG rendering issues in jsdom) ──

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="recharts-responsive">{children}</div>
  ),
  AreaChart: ({ children }: any) => <div data-testid="recharts-areachart">{children}</div>,
  Area: () => <div data-testid="recharts-area" />,
  XAxis: () => <div data-testid="recharts-xaxis" />,
  YAxis: () => <div data-testid="recharts-yaxis" />,
  CartesianGrid: () => <div data-testid="recharts-grid" />,
  Tooltip: () => <div data-testid="recharts-tooltip" />,
}));

// ── Test data helpers ──

const defaultStats: DashboardStats = {
  totalProjects: 3,
  totalDownloads: 15000,
  totalViews: 45000,
  publishedCount: 2,
  draftCount: 1,
};

function makeProject(id: string, overrides?: Partial<DashboardProject>): DashboardProject {
  return {
    id,
    name: `Project ${id}`,
    slug: `project-${id}`,
    category: '',
    loader: '',
    status: 'Published',
    downloads: 5000,
    mcVersion: '',
    updated: '2d ago',
    ...overrides,
  };
}

// ── Hook mock ──

let mockLoading = false;
let mockError: string | null = null;
let mockProjects: DashboardProject[] = [];
let mockStats: DashboardStats = {
  totalProjects: 0,
  totalDownloads: 0,
  totalViews: 0,
  publishedCount: 0,
  draftCount: 0,
};
const mockRefetch = vi.fn();

vi.mock('@/hooks/use-dashboard', () => ({
  useDashboardProjects: () => ({
    projects: mockProjects,
    stats: mockStats,
    loading: mockLoading,
    error: mockError,
    refetch: mockRefetch,
  }),
  useUserAnalytics: () => ({ data: null, isLoading: false }),
  useProjectAnalytics: () => ({ data: null, isLoading: false }),
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoading = false;
    mockError = null;
    mockProjects = [];
    mockStats = { ...defaultStats };
    mockRefetch.mockReset();
  });

  // ── Loading state ──

  it('renders a loading skeleton while data is being fetched', () => {
    mockLoading = true;
    const { container } = renderWithQueryClient(<DashboardPage />);
    // The skeleton uses animate-pulse
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
    // Header should still appear
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    // But stat cards should not appear yet
    expect(screen.queryByTestId(/^stat-/)).not.toBeInTheDocument();
  });

  // ── Error state ──

  it('renders an error card with the error message and a retry button', () => {
    mockError = 'Failed to load projects';
    renderWithQueryClient(<DashboardPage />);
    expect(screen.getByText('Failed to load projects')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('calls refetch when the retry button is clicked', async () => {
    mockError = 'Something went wrong';
    renderWithQueryClient(<DashboardPage />);
    await userEvent.click(screen.getByText('Retry'));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  // ── Empty state ──

  it('shows an empty state when there are no projects', () => {
    mockProjects = [];
    mockStats = {
      totalProjects: 0,
      totalDownloads: 0,
      totalViews: 0,
      publishedCount: 0,
      draftCount: 0,
    };
    renderWithQueryClient(<DashboardPage />);
    expect(screen.getByText('No projects yet')).toBeInTheDocument();
    expect(screen.getByText('Create your first mod project to get started')).toBeInTheDocument();
    expect(screen.getByText('Upload a Mod')).toBeInTheDocument();
  });

  // ── Stats derivation ──

  it('displays stat cards with derived values from the hook', () => {
    renderWithQueryClient(<DashboardPage />);
    expect(screen.getByText('Total Projects: 3')).toBeInTheDocument();
    expect(screen.getByText('Total Downloads: 15.0K')).toBeInTheDocument();
    expect(screen.getByText('Total Views: 45.0K')).toBeInTheDocument();
    expect(screen.getByText('Active Projects: 2')).toBeInTheDocument();
  });

  it('formats small download/view counts without K suffix', () => {
    mockStats = {
      totalProjects: 1,
      totalDownloads: 500,
      totalViews: 800,
      publishedCount: 1,
      draftCount: 0,
    };
    renderWithQueryClient(<DashboardPage />);
    expect(screen.getByText('Total Downloads: 500')).toBeInTheDocument();
    expect(screen.getByText('Total Views: 800')).toBeInTheDocument();
  });

  // ── Projects table ──

  it('renders a table of recent projects when projects exist', () => {
    mockProjects = [
      makeProject('1', { name: 'Optifine', downloads: 12000, status: 'Published' }),
      makeProject('2', { name: 'JEI', downloads: 8000, status: 'Draft' }),
    ];
    renderWithQueryClient(<DashboardPage />);
    expect(screen.getByText('Optifine')).toBeInTheDocument();
    expect(screen.getByText('JEI')).toBeInTheDocument();
    // The table headers
    expect(screen.getByText('Project')).toBeInTheDocument();
    expect(screen.getByText('Downloads')).toBeInTheDocument();
  });

  it('limits the projects table to 5 items', () => {
    mockProjects = Array.from({ length: 10 }, (_, i) =>
      makeProject(String(i + 1), { name: `Project ${i + 1}` }),
    );
    renderWithQueryClient(<DashboardPage />);
    // Only the first 5 should appear in the table
    expect(screen.getByText('Project 1')).toBeInTheDocument();
    expect(screen.getByText('Project 5')).toBeInTheDocument();
    expect(screen.queryByText('Project 6')).not.toBeInTheDocument();
  });

  // ── Activity feed ──

  it('shows the activity feed with a real-data empty state when there is no user activity', async () => {
    mockProjects = [makeProject('1')];
    renderWithQueryClient(<DashboardPage />);
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('No recent activity yet.')).toBeInTheDocument();
    });
  });

  // ── Chart renders ──

  it('renders the downloads chart', () => {
    renderWithQueryClient(<DashboardPage />);
    expect(screen.getByText('Downloads Overview')).toBeInTheDocument();
  });

  // ── Header actions ──

  it('includes navigation buttons (View Analytics, Upload Mod)', () => {
    renderWithQueryClient(<DashboardPage />);
    expect(screen.getByText('View Analytics')).toBeInTheDocument();
    expect(screen.getByText('Upload Mod')).toBeInTheDocument();
  });
});
