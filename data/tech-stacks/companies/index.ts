// Company Tech Stacks - Company Data Aggregator
// This file exports all company data and provides utility functions

import { netflix } from './netflix';
import { uber } from './uber';
import { google } from './google';
import { stripe } from './stripe';
import { amazon } from './amazon';
import { slack } from './slack';
import { instagram } from './instagram';
import { linkedin } from './linkedin';
import { spotify } from './spotify';
import { whatsapp } from './whatsapp';
import { airbnb } from './airbnb';
import { twitter } from './twitter';
import { meta } from './meta';
import { shopify } from './shopify';
import { discord } from './discord';
import { figma } from './figma';
import { dropbox } from './dropbox';
import { cloudflare } from './cloudflare';
import { paypal } from './paypal';

import { Company, CompanyCategory, SearchFilters, TechLayer } from '../types';

// All companies array
export const companies: Company[] = [
  netflix,
  uber,
  google,
  stripe,
  amazon,
  slack,
  instagram,
  linkedin,
  spotify,
  whatsapp,
  airbnb,
  twitter,
  meta,
  shopify,
  discord,
  figma,
  dropbox,
  cloudflare,
  paypal,
];

// Map for O(1) lookup by slug
export const companiesMap: Record<string, Company> = companies.reduce(
  (acc, company) => ({
    ...acc,
    [company.slug]: company,
  }),
  {} as Record<string, Company>
);

// Get a company by its slug
export const getCompanyBySlug = (slug: string): Company | undefined =>
  companiesMap[slug];

// Get all companies in a specific category
export const getCompaniesByCategory = (category: CompanyCategory): Company[] =>
  companies.filter((c) => c.category === category);

// Get all unique technologies across all companies
export const getAllTechnologies = (): string[] => {
  const techSet = new Set<string>();
  companies.forEach((company) => {
    (Object.values(company.techStack) as TechLayer[][]).forEach((layer) => {
      layer.forEach((tech: TechLayer) => techSet.add(tech.name));
    });
  });
  return Array.from(techSet).sort();
};

// Get all primary technologies
export const getPrimaryTechnologies = (): string[] => {
  const techSet = new Set<string>();
  companies.forEach((company) => {
    (Object.values(company.techStack) as TechLayer[][]).forEach((layer) => {
      layer.filter((t: TechLayer) => t.isPrimary).forEach((tech: TechLayer) => techSet.add(tech.name));
    });
  });
  return Array.from(techSet).sort();
};

// Search and filter companies
export const searchCompanies = (filters: SearchFilters): Company[] => {
  let results = [...companies];

  // Filter by search query
  if (filters.query && filters.query.trim()) {
    const query = filters.query.toLowerCase().trim();
    results = results.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.tags.some((t) => t.toLowerCase().includes(query)) ||
        Object.values(c.techStack)
          .flat()
          .some((t) => t.name.toLowerCase().includes(query))
    );
  }

  // Filter by category
  if (filters.category && filters.category !== 'all') {
    results = results.filter((c) => c.category === filters.category);
  }

  // Filter by specific technology
  if (filters.technology) {
    const tech = filters.technology.toLowerCase();
    results = results.filter((c) =>
      Object.values(c.techStack)
        .flat()
        .some((t) => t.name.toLowerCase() === tech)
    );
  }

  // Filter by architecture type
  if (filters.architectureType) {
    results = results.filter((c) => c.architecture.type === filters.architectureType);
  }

  return results;
};

// Get companies sorted by different criteria
export const getSortedCompanies = (
  companiesList: Company[],
  sortBy: 'name-asc' | 'name-desc' | 'category' | 'popularity' | 'recently-updated' = 'name-asc'
): Company[] => {
  const sorted = [...companiesList];

  switch (sortBy) {
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'category':
      return sorted.sort((a, b) => a.category.localeCompare(b.category));
    case 'recently-updated':
      return sorted.sort((a, b) =>
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      );
    case 'popularity':
    default:
      return sorted; // Could implement based on user ratings later
  }
};

// Get related companies (same category or shared technologies)
export const getRelatedCompanies = (company: Company, limit: number = 3): Company[] => {
  const otherCompanies = companies.filter((c) => c.slug !== company.slug);

  // Score companies by similarity
  const scored = otherCompanies.map((c) => {
    let score = 0;

    // Same category
    if (c.category === company.category) score += 10;

    // Shared technologies
    const companyTechs = new Set(
      Object.values(company.techStack)
        .flat()
        .map((t) => t.name.toLowerCase())
    );
    const otherTechs = Object.values(c.techStack)
      .flat()
      .map((t) => t.name.toLowerCase());

    otherTechs.forEach((tech) => {
      if (companyTechs.has(tech)) score += 1;
    });

    // Same architecture type
    if (c.architecture.type === company.architecture.type) score += 3;

    return { company: c, score };
  });

  // Sort by score and return top N
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.company);
};

// Export individual companies for direct imports
export {
  netflix,
  uber,
  google,
  stripe,
  amazon,
  slack,
  instagram,
  linkedin,
  spotify,
  whatsapp,
  airbnb,
  twitter,
  meta,
  shopify,
  discord,
  figma,
  dropbox,
  cloudflare,
  paypal,
};
