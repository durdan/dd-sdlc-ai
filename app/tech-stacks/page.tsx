'use client';

import { useState, useMemo } from 'react';
import { TechStackCard } from '@/components/tech-stacks/TechStackCard';
import { TechStackFilters } from '@/components/tech-stacks/TechStackFilters';
import {
  companies,
  searchCompanies,
  getSortedCompanies,
} from '@/data/tech-stacks/companies';
import {
  CompanyCategory,
  ViewMode,
  ArchitectureType,
} from '@/data/tech-stacks/types';

export default function TechStacksPage() {
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CompanyCategory | 'all'>('all');
  const [selectedTechnology, setSelectedTechnology] = useState<string | undefined>();
  const [selectedArchitecture, setSelectedArchitecture] = useState<ArchitectureType | undefined>();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Favorites state (in-memory for now, will integrate with Supabase later)
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Filter and sort companies
  const filteredCompanies = useMemo(() => {
    const filtered = searchCompanies({
      query: searchQuery,
      category: selectedCategory,
      technology: selectedTechnology,
      architectureType: selectedArchitecture,
    });
    return getSortedCompanies(filtered, 'name-asc');
  }, [searchQuery, selectedCategory, selectedTechnology, selectedArchitecture]);

  const toggleFavorite = (slug: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(slug)) {
        newFavorites.delete(slug);
      } else {
        newFavorites.add(slug);
      }
      return newFavorites;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Company Tech Stacks</h1>
          <p className="text-muted-foreground max-w-2xl">
            Explore architecture diagrams and tech stacks from major companies like Netflix,
            Uber, Instagram, and Google. Learn how top engineering teams build scalable
            systems.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Filters */}
        <TechStackFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedTechnology={selectedTechnology}
          onTechnologyChange={setSelectedTechnology}
          selectedArchitecture={selectedArchitecture}
          onArchitectureChange={setSelectedArchitecture}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalCount={companies.length}
          filteredCount={filteredCompanies.length}
        />

        {/* Company Grid/List */}
        <div className="mt-6">
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No companies found matching your filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedTechnology(undefined);
                  setSelectedArchitecture(undefined);
                }}
                className="text-primary hover:underline mt-2"
              >
                Clear all filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company) => (
                <TechStackCard
                  key={company.slug}
                  company={company}
                  viewMode="grid"
                  isFavorited={favorites.has(company.slug)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCompanies.map((company) => (
                <TechStackCard
                  key={company.slug}
                  company={company}
                  viewMode="list"
                  isFavorited={favorites.has(company.slug)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
