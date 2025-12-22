'use client';

import { HtmlArchitectureDiagram, DiagramLayer } from '@/data/tech-stacks/types';
import { cn } from '@/lib/utils';
import { ArrowDown, Globe, Shield, Server, Database, Zap, Users } from 'lucide-react';

interface TechStackArchitectureDiagramProps {
  diagram: HtmlArchitectureDiagram;
  className?: string;
}

// Icon mapping for diagram items
const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Globe,
  Shield,
  Server,
  Database,
  Zap,
  Users,
};

// Position order for sorting layers
const positionOrder: Record<string, number> = {
  top: 0,
  middle: 1,
  bottom: 2,
};

export function TechStackArchitectureDiagram({
  diagram,
  className,
}: TechStackArchitectureDiagramProps) {
  // Sort layers by position
  const sortedLayers = [...diagram.layers].sort(
    (a, b) => positionOrder[a.position] - positionOrder[b.position]
  );

  return (
    <div className={cn('w-full', className)}>
      {/* Diagram Title */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">{diagram.title}</h3>
        {diagram.subtitle && (
          <p className="text-sm text-muted-foreground">{diagram.subtitle}</p>
        )}
      </div>

      {/* Architecture Layers */}
      <div className="space-y-3">
        {sortedLayers.map((layer, layerIndex) => (
          <div key={layer.id}>
            {/* Layer Container */}
            <div
              className={cn(
                'rounded-lg p-4 border-2 border-dashed transition-all',
                layer.color
              )}
            >
              {/* Layer Name */}
              <h4 className="font-medium text-sm mb-3 text-center text-gray-700">
                {layer.name}
              </h4>

              {/* Layer Items */}
              <div className="flex flex-wrap gap-3 justify-center">
                {layer.items.map((item) => {
                  const IconComponent = item.icon ? iconMap[item.icon] : null;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 min-w-[120px] max-w-[180px] text-center hover:shadow-md transition-shadow"
                    >
                      {/* Icon */}
                      {IconComponent && (
                        <div className="flex justify-center mb-1">
                          <IconComponent className="h-4 w-4 text-gray-500" />
                        </div>
                      )}

                      {/* Item Name */}
                      <div className="font-medium text-sm">{item.name}</div>

                      {/* Tech Stack Tags */}
                      {item.techStack && item.techStack.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {item.techStack.join(', ')}
                        </div>
                      )}

                      {/* Description */}
                      {item.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Connection Arrow (except for last layer) */}
            {layerIndex < sortedLayers.length - 1 && (
              <div className="flex justify-center py-2">
                <ArrowDown className="h-5 w-5 text-gray-400" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Connection Labels */}
      {diagram.connections.length > 0 && (
        <div className="mt-4 flex justify-center gap-4 text-xs text-muted-foreground">
          {diagram.connections
            .filter((conn) => conn.label)
            .map((conn, idx) => (
              <span key={idx} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                {conn.label}
              </span>
            ))}
        </div>
      )}
    </div>
  );
}

// Compact version for cards
export function TechStackArchitectureDiagramCompact({
  diagram,
  className,
}: TechStackArchitectureDiagramProps) {
  const sortedLayers = [...diagram.layers]
    .sort((a, b) => positionOrder[a.position] - positionOrder[b.position])
    .slice(0, 3); // Only show top 3 layers

  return (
    <div className={cn('w-full', className)}>
      <div className="space-y-2">
        {sortedLayers.map((layer, layerIndex) => (
          <div key={layer.id}>
            <div
              className={cn(
                'rounded p-2 border text-center text-xs font-medium',
                layer.color
              )}
            >
              {layer.name}
            </div>
            {layerIndex < sortedLayers.length - 1 && (
              <div className="flex justify-center py-0.5">
                <ArrowDown className="h-3 w-3 text-gray-300" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
