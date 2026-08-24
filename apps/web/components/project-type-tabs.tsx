'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ProjectType } from '@mcp/types';

export interface ProjectTypeTab {
  value: ProjectType | null;
  label: string;
}

const TABS: ProjectTypeTab[] = [
  { value: null, label: 'All' },
  { value: ProjectType.MOD, label: 'Mods' },
  { value: ProjectType.MODPACK, label: 'Modpacks' },
  { value: ProjectType.RESOURCE_PACK, label: 'Resource Packs' },
  { value: ProjectType.DATA_PACK, label: 'Data Packs' },
  { value: ProjectType.SHADER, label: 'Shaders' },
  { value: ProjectType.PLUGIN, label: 'Plugins' },
];

export interface ProjectTypeTabsProps {
  selected: string[];
  onSelect: (value: ProjectType | null) => void;
  counts?: Record<string, number>;
  className?: string;
}

export function ProjectTypeTabs({ selected, onSelect, counts, className }: ProjectTypeTabsProps) {
  // Exclusive: only first selected matters for active state (tabs are single-select)
  const active = selected.length === 1 ? selected[0] : selected.length === 0 ? null : selected[0];

  return (
    <div className={cn('sticky top-16 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80', className)}>
      <div className="container">
        <div
          className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2 -mb-px scroll-smooth snap-x"
          role="tablist"
          aria-label="Project type"
        >
          {TABS.map((tab) => {
            const isActive =
              (tab.value === null && selected.length === 0) || active === tab.value;
            const count = tab.value ? counts?.[tab.value] : undefined;
            return (
              <button
                key={tab.label}
                role="tab"
                aria-selected={isActive}
                aria-pressed={isActive}
                onClick={() => onSelect(tab.value)}
                className={cn(
                  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors border',
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background hover:bg-muted border-transparent hover:border-border text-muted-foreground hover:text-foreground',
                )}
              >
                {tab.label}
                {typeof count === 'number' && (
                  <span
                    className={cn(
                      'ml-1 rounded-full px-1.5 py-0.5 text-[11px] leading-none',
                      isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {count.toLocaleString()}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ProjectTypeTabs;
