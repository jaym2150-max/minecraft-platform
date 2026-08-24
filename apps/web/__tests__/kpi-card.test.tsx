import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Eye } from 'lucide-react';
import { KpiCard } from '@/components/kpi-card';

describe('KpiCard', () => {
  const defaultProps = {
    label: 'Total Views',
    value: '48.2K',
    icon: Eye,
    change: '+8.2%',
    changeType: 'up' as const,
  };

  it('renders the label, value, and change text', () => {
    render(<KpiCard {...defaultProps} />);
    expect(screen.getByText('Total Views')).toBeInTheDocument();
    expect(screen.getByText('48.2K')).toBeInTheDocument();
    expect(screen.getByText('+8.2%')).toBeInTheDocument();
  });

  it('shows TrendingUp icon when changeType is "up"', () => {
    render(<KpiCard {...defaultProps} changeType="up" />);
    const changeEl = screen.getByText('+8.2%');
    expect(changeEl.className).toContain('text-emerald-500');
  });

  it('shows TrendingDown icon when changeType is "down"', () => {
    render(<KpiCard {...defaultProps} changeType="down" change="-3.1%" />);
    const changeEl = screen.getByText('-3.1%');
    expect(changeEl.className).toContain('text-red-500');
  });

  it('has a testid attribute for easy querying', () => {
    render(<KpiCard {...defaultProps} />);
    expect(screen.getByTestId('kpi-card')).toBeInTheDocument();
  });

  it('renders the icon in the header section', () => {
    const { container } = render(<KpiCard {...defaultProps} />);
    const iconContainer = container.querySelector('.bg-primary\\/10');
    expect(iconContainer).toBeInTheDocument();
  });
});
