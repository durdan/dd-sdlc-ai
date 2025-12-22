import { CategoryMeta, CompanyCategory } from './types';

export const categories: CategoryMeta[] = [
  {
    slug: 'streaming',
    name: 'Streaming & Media',
    icon: 'Play',
    color: 'red',
    description: 'Video and audio streaming platforms',
  },
  {
    slug: 'fintech',
    name: 'FinTech & Payments',
    icon: 'CreditCard',
    color: 'green',
    description: 'Financial technology and payment processing',
  },
  {
    slug: 'e-commerce',
    name: 'E-Commerce',
    icon: 'ShoppingCart',
    color: 'orange',
    description: 'Online retail and marketplaces',
  },
  {
    slug: 'social-media',
    name: 'Social Media',
    icon: 'Users',
    color: 'blue',
    description: 'Social networking platforms',
  },
  {
    slug: 'transportation',
    name: 'Transportation & Travel',
    icon: 'Car',
    color: 'purple',
    description: 'Ride-sharing, travel, and logistics',
  },
  {
    slug: 'saas',
    name: 'SaaS & Productivity',
    icon: 'Cloud',
    color: 'cyan',
    description: 'Software as a Service platforms',
  },
  {
    slug: 'cloud-infrastructure',
    name: 'Cloud & Infrastructure',
    icon: 'Server',
    color: 'gray',
    description: 'Cloud computing providers and infrastructure',
  },
  {
    slug: 'developer-tools',
    name: 'Developer Tools',
    icon: 'Code',
    color: 'indigo',
    description: 'Development platforms and tools',
  },
  {
    slug: 'ai-ml',
    name: 'AI & Machine Learning',
    icon: 'Brain',
    color: 'pink',
    description: 'Artificial intelligence platforms',
  },
  {
    slug: 'enterprise',
    name: 'Enterprise Software',
    icon: 'Building',
    color: 'slate',
    description: 'Enterprise software companies',
  },
  {
    slug: 'communication',
    name: 'Communication',
    icon: 'MessageCircle',
    color: 'teal',
    description: 'Messaging and communication platforms',
  },
  {
    slug: 'gaming',
    name: 'Gaming',
    icon: 'Gamepad2',
    color: 'violet',
    description: 'Gaming platforms and services',
  },
  {
    slug: 'healthcare',
    name: 'Healthcare & Life Sciences',
    icon: 'Heart',
    color: 'rose',
    description: 'Healthcare technology platforms',
  },
  {
    slug: 'education',
    name: 'Education & Learning',
    icon: 'GraduationCap',
    color: 'amber',
    description: 'Educational technology platforms',
  },
];

export const categoryMap: Record<CompanyCategory, CategoryMeta> = categories.reduce(
  (acc, category) => ({
    ...acc,
    [category.slug]: category,
  }),
  {} as Record<CompanyCategory, CategoryMeta>
);

export const getCategoryBySlug = (slug: CompanyCategory): CategoryMeta | undefined =>
  categoryMap[slug];

export const getCategoryColor = (category: CompanyCategory): string => {
  const colorMap: Record<string, string> = {
    red: 'bg-red-100 text-red-800 border-red-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    cyan: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
    indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    pink: 'bg-pink-100 text-pink-800 border-pink-200',
    slate: 'bg-slate-100 text-slate-800 border-slate-200',
    teal: 'bg-teal-100 text-teal-800 border-teal-200',
    violet: 'bg-violet-100 text-violet-800 border-violet-200',
    rose: 'bg-rose-100 text-rose-800 border-rose-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
  };

  const meta = categoryMap[category];
  return meta ? colorMap[meta.color] || colorMap.gray : colorMap.gray;
};
