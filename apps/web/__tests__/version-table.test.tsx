import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VersionTable } from '@/components/version-table';
import type { VersionDisplay } from '@/hooks/use-project';

const NOW = '2026-05-21T12:00:00.000Z';

function makeVersion(overrides: Partial<VersionDisplay> = {}): VersionDisplay {
  return {
    id: 'v1',
    version: '1.0.0',
    loader: 'Fabric',
    loaderColor: 'bg-blue-500/10 text-blue-600',
    minecraft: '1.20.4',
    updated: '1d ago',
    updatedAt: NOW,
    downloads: '5.0K',
    downloadsRaw: 5000,
    status: 'approved',
    fileUrl: 'https://files.test/v1.jar',
    fileSize: 1024,
    ...overrides,
  };
}

describe('VersionTable', () => {
  it('renders the table with data-testid', () => {
    render(<VersionTable versions={[makeVersion()]} />);
    expect(screen.getByTestId('version-table')).toBeInTheDocument();
  });

  it('shows empty state when no versions', () => {
    render(<VersionTable versions={[]} />);
    expect(screen.getByText(/No versions published yet/i)).toBeInTheDocument();
  });

  it('renders loader column headers', () => {
    render(<VersionTable versions={[makeVersion()]} />);
    expect(screen.getByText('FORGE')).toBeInTheDocument();
  });

  it('renders version row with MC version', () => {
    render(<VersionTable versions={[makeVersion({ version: '2.5.1' })]} />);
    expect(screen.getByText(/v2\.5\.1/)).toBeInTheDocument();
    expect(screen.getByText(/MC 1\.20\.4/)).toBeInTheDocument();
  });

  it('renders a Download button for the matching loader cell', () => {
    render(<VersionTable versions={[makeVersion({ loader: 'Fabric' })]} />);
    const buttons = screen.getAllByRole('button', { name: /Download/i });
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders dashes for unsupported loader cells', () => {
    render(<VersionTable versions={[makeVersion({ loader: 'Fabric' })]} />);
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThan(0);
  });

  it('calls onDownload when Download button clicked', () => {
    const onDownload = vi.fn();
    render(<VersionTable versions={[makeVersion({ id: 'v_click' })]} onDownload={onDownload} />);
    const button = screen.getAllByRole('button', { name: /Download/i })[0];
    fireEvent.click(button);
    expect(onDownload).toHaveBeenCalled();
    const calledWith = onDownload.mock.calls[0][0];
    expect(calledWith.id).toBe('v_click');
  });

  it('groups versions by version + mc, taking first occurrence', () => {
    const v1 = makeVersion({ id: 'a', version: '1.0.0', loader: 'Fabric' });
    const v2 = makeVersion({ id: 'b', version: '1.0.0', loader: 'Fabric', minecraft: '1.20.4' });
    render(<VersionTable versions={[v1, v2]} />);
    const row = screen.getByText(/v1\.0\.0/);
    expect(row).toBeInTheDocument();
  });

  it('disables download button for the downloading version', () => {
    render(<VersionTable versions={[makeVersion({ id: 'busy' })]} downloadingId="busy" />);
    const button = screen.getAllByRole('button', { name: /Download/i })[0] as HTMLButtonElement;
    expect(button).toBeDisabled();
  });
});
