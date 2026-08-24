import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Download } from 'lucide-react';
import { StatCard } from '@/components/stat-card';

describe('StatCard', () => {
  const defaultProps = {
    label: 'Total Downloads',
    value: '12.5K',
    icon: Download,
    change: '+12% this week',
    changeType: 'up' as const,
  };

  it('renders the label, value, and change text', () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.getByText('Total Downloads')).toBeInTheDocument();
    expect(screen.getByText('12.5K')).toBeInTheDocument();
    expect(screen.getByText('+12% this week')).toBeInTheDocument();
  });

  it('shows a trending-up icon when changeType is "up"', () => {
    const { container } = render(<StatCard {...defaultProps} changeType="up" />);
    const emeraldText = container.querySelector('.text-emerald-500');
    expect(emeraldText).toBeInTheDocument();
  });

  it('shows neutral styling when changeType is "neutral"', () => {
    render(<StatCard {...defaultProps} changeType="neutral" change="No change" />);
    const changeEl = screen.getByText('No change');
    expect(changeEl.className).toContain('text-muted-foreground');
  });

  it('shows red styling when changeType is "down"', () => {
    render(<StatCard {...defaultProps} changeType="down" change="-5% this week" />);
    const changeEl = screen.getByText('-5% this week');
    expect(changeEl.className).toContain('text-red-500');
  });

  it('has a testid attribute for easy querying', () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.getByTestId('stat-card')).toBeInTheDocument();
  });

  it('renders the icon in the header', () => {
    const { container } = render(<StatCard {...defaultProps} />);
    const iconContainer = container.querySelector('.bg-primary\\/10');
    expect(iconContainer).toBeInTheDocument();
  });
});
