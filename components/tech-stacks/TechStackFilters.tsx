'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Grid, List, X } from 'lucide-react';
import { CompanyCategory, ViewMode, ArchitectureType } from '@/data/tech-stacks/types';
import { categories } from '@/data/tech-stacks/categories';
import { getAllTechnologies } from '@/data/tech-stacks/companies';

interface TechStackFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: CompanyCategory | 'all';
  onCategoryChange: (category: CompanyCategory | 'all') => void;
  selectedTechnology?: string;
  onTechnologyChange?: (tech: string | undefined) => void;
  selectedArchitecture?: ArchitectureType;
  onArchitectureChange?: (arch: ArchitectureType | undefined) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalCount: number;
  filteredCount: number;
}

export function TechStackFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedTechnology,
  onTechnologyChange,
  selectedArchitecture,
  onArchitectureChange,
  viewMode,
  onViewModeChange,
  totalCount,
  filteredCount,
}: TechStackFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Get all unique technologies for filter dropdown
  const allTechnologies = useMemo(() => getAllTechnologies(), []);

  const architectureTypes: ArchitectureType[] = [
    'microservices',
    'monolith',
    'serverless',
    'event-driven',
    'hybrid',
  ];

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== 'all' ||
    selectedTechnology ||
    selectedArchitecture;

  const clearAllFilters = () => {
    onSearchChange('');
    onCategoryChange('all');
    onTechnologyChange?.(undefined);
    onArchitectureChange?.(undefined);
  };

  return (
    <div className="space-y-4">
      {/* Main Search and Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies, technologies, or use cases..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Filter */}
        <Select
          value={selectedCategory}
          onValueChange={(value) => onCategoryChange(value as CompanyCategory | 'all')}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Companies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Companies ({totalCount})</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.slug} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View Mode Toggle */}
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="px-3"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="px-3"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      {(onTechnologyChange || onArchitectureChange) && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-muted-foreground"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear all
            </Button>
          )}
        </div>
      )}

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="flex flex-col sm:flex-row gap-3 p-4 bg-muted/50 rounded-lg">
          {/* Technology Filter */}
          {onTechnologyChange && (
            <Select
              value={selectedTechnology || 'all'}
              onValueChange={(value) =>
                onTechnologyChange(value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by Technology" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Technologies</SelectItem>
                {allTechnologies.map((tech) => (
                  <SelectItem key={tech} value={tech}>
                    {tech}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Architecture Type Filter */}
          {onArchitectureChange && (
            <Select
              value={selectedArchitecture || 'all'}
              onValueChange={(value) =>
                onArchitectureChange(value === 'all' ? undefined : (value as ArchitectureType))
              }
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Architecture Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Architecture Types</SelectItem>
                {architectureTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredCount} of {totalCount} companies
        {hasActiveFilters && ' (filtered)'}
      </div>
    </div>
  );
}
