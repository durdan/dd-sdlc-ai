'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Users, Globe, Building2 } from 'lucide-react';
import { Company, ViewMode } from '@/data/tech-stacks/types';
import { getCategoryColor } from '@/data/tech-stacks/categories';
import { cn } from '@/lib/utils';

interface TechStackCardProps {
  company: Company;
  isFavorited?: boolean;
  onToggleFavorite?: (slug: string) => void;
  viewMode?: ViewMode;
  showActions?: boolean;
}

export function TechStackCard({
  company,
  isFavorited = false,
  onToggleFavorite,
  viewMode = 'grid',
  showActions = true,
}: TechStackCardProps) {
  // Get primary technologies (up to 5)
  const primaryTech = Object.values(company.techStack)
    .flat()
    .filter((t) => t.isPrimary)
    .slice(0, 5);

  // Get remaining tech count
  const totalTech = Object.values(company.techStack).flat().length;
  const remainingTech = totalTech - primaryTech.length;

  const categoryColorClass = getCategoryColor(company.category);

  // Format category name for display
  const categoryDisplay = company.category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  if (viewMode === 'list') {
    return (
      <Link href={`/tech-stacks/${company.slug}`} className="block">
        <Card className="hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50">
          <CardContent className="flex items-center gap-4 p-4">
            {/* Logo */}
            <div className="h-12 w-12 flex items-center justify-center bg-gray-100 rounded-lg flex-shrink-0">
              <Building2 className="h-6 w-6 text-gray-500" />
            </div>

            {/* Company Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{company.name}</h3>
              <p className="text-sm text-muted-foreground truncate">{company.description}</p>
            </div>

            {/* Category Badge */}
            <Badge className={cn('flex-shrink-0', categoryColorClass)}>{categoryDisplay}</Badge>

            {/* Tech Tags */}
            <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0">
              {primaryTech.slice(0, 3).map((tech) => (
                <Badge key={tech.name} variant="outline" className="text-xs">
                  {tech.name}
                </Badge>
              ))}
              {remainingTech > 0 && (
                <Badge variant="secondary" className="text-xs">
                  +{remainingTech} more
                </Badge>
              )}
            </div>

            {/* Actions */}
            {showActions && onToggleFavorite && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleFavorite(company.slug);
                  }}
                  className="h-8 w-8"
                >
                  <Heart
                    className={cn('h-4 w-4', isFavorited && 'fill-red-500 text-red-500')}
                  />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Grid view (default)
  return (
    <Link href={`/tech-stacks/${company.slug}`} className="block h-full">
      <Card className="hover:shadow-lg transition-shadow h-full flex flex-col cursor-pointer hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Logo placeholder */}
              <div className="h-10 w-10 flex items-center justify-center bg-gray-100 rounded-lg flex-shrink-0">
                <Building2 className="h-5 w-5 text-gray-500" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-lg truncate">
                  {company.name}
                </CardTitle>
                <Badge className={cn('mt-1', categoryColorClass)}>{categoryDisplay}</Badge>
              </div>
            </div>
            {showActions && onToggleFavorite && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleFavorite(company.slug);
                }}
                className="h-8 w-8 flex-shrink-0"
              >
                <Heart
                  className={cn('h-4 w-4', isFavorited && 'fill-red-500 text-red-500')}
                />
              </Button>
            )}
          </div>
          <CardDescription className="mt-2 line-clamp-2">{company.description}</CardDescription>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          {/* Company Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            {company.info.employees && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {company.info.employees}
              </span>
            )}
            {company.metrics.regionsServed && (
              <span className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" />
                {company.metrics.regionsServed} regions
              </span>
            )}
          </div>

          {/* Scale info */}
          {company.metrics.users && (
            <p className="text-sm font-medium text-primary mb-2">{company.metrics.users}</p>
          )}

          {/* Architecture Badge */}
          <Badge variant="outline" className="mb-3 w-fit">
            {company.architecture.type} &middot; {company.architecture.style}
          </Badge>

          {/* Tech Tags */}
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {primaryTech.map((tech) => (
              <Badge key={tech.name} variant="secondary" className="text-xs">
                {tech.name}
              </Badge>
            ))}
            {remainingTech > 0 && (
              <Badge variant="outline" className="text-xs">
                +{remainingTech} more
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
