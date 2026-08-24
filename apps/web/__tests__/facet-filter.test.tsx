import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FacetFilter, type FacetOption } from '@/components/facet-filter';

const OPTIONS: FacetOption[] = [
  { value: 'mod', label: 'Mod', count: 120 },
  { value: 'modpack', label: 'Modpack', count: 30 },
  { value: 'shader', label: 'Shader', count: 12 },
];

describe('FacetFilter', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the title', () => {
    render(<FacetFilter title="Categories" options={OPTIONS} selected={[]} onChange={() => {}} />);
    expect(screen.getByText('Categories')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<FacetFilter title="Categories" options={OPTIONS} selected={[]} onChange={() => {}} />);
    expect(screen.getByLabelText('Mod')).toBeInTheDocument();
    expect(screen.getByLabelText('Modpack')).toBeInTheDocument();
    expect(screen.getByLabelText('Shader')).toBeInTheDocument();
  });

  it('renders counts when provided', () => {
    render(<FacetFilter title="Categories" options={OPTIONS} selected={[]} onChange={() => {}} />);
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('marks selected checkboxes as checked', () => {
    render(<FacetFilter title="Categories" options={OPTIONS} selected={['mod']} onChange={() => {}} />);
    const checkbox = screen.getByLabelText('Mod') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('toggles selection through checkbox change', () => {
    const onChange = vi.fn();
    render(<FacetFilter title="Categories" options={OPTIONS} selected={[]} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Mod'));
    expect(onChange).toHaveBeenCalledWith(['mod']);
  });

  it('deselects when clicking an already-selected option', () => {
    const onChange = vi.fn();
    render(<FacetFilter title="Categories" options={OPTIONS} selected={['mod']} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Mod'));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('shows selected count badge when items are selected', () => {
    render(<FacetFilter title="Categories" options={OPTIONS} selected={['mod', 'modpack']} onChange={() => {}} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('toggles open/close state via header click', () => {
    render(<FacetFilter title="Categories" options={OPTIONS} selected={[]} onChange={() => {}} defaultOpen />);
    expect(screen.getByLabelText('Mod')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Categories'));
    expect(screen.queryByLabelText('Mod')).not.toBeInTheDocument();
  });

  it('renders empty message when no options', () => {
    render(<FacetFilter title="Categories" options={[]} selected={[]} onChange={() => {}} emptyMessage="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('calls onChange with empty array on Clear', () => {
    const onChange = vi.fn();
    render(<FacetFilter title="Categories" options={OPTIONS} selected={['mod']} onChange={onChange} />);
    fireEvent.click(screen.getByText('Clear'));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
