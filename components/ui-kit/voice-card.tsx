"use client";

import { Play, Pause, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface VoiceCardProps {
  id: string;
  name: string;
  description?: string;
  category?: string;
  accent?: string;
  age?: string;
  gender?: string;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onPreview?: (id: string) => void;
  className?: string;
}

export function VoiceCard({
  id,
  name,
  description,
  category,
  accent,
  age,
  gender,
  isSelected = false,
  onSelect,
  onPreview,
  className,
}: VoiceCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePreview = () => {
    setIsPlaying(!isPlaying);
    onPreview?.(id);
  };

  return (
    <div
      className={cn(
        "surface p-6 space-y-4 transition-all hover:shadow-md cursor-pointer",
        isSelected && "ring-2 ring-primary border-primary",
        className
      )}
      onClick={() => onSelect?.(id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-title text-foreground mb-1.5 truncate">{name}</h3>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
        </div>
        {isSelected && (
          <div className="ml-3 shrink-0">
            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
              <Check className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Metadata */}
      {(category || accent || age || gender) && (
        <div className="flex flex-wrap gap-2">
          {category && (
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
          )}
          {gender && (
            <Badge variant="outline" className="text-xs">
              {gender}
            </Badge>
          )}
          {age && (
            <Badge variant="outline" className="text-xs">
              {age}
            </Badge>
          )}
          {accent && (
            <Badge variant="outline" className="text-xs">
              {accent}
            </Badge>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-2"
          onClick={(e) => {
            e.stopPropagation();
            handlePreview();
          }}
        >
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Preview
            </>
          )}
        </Button>
        {onSelect && (
          <Button
            variant={isSelected ? "default" : "secondary"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(id);
            }}
          >
            {isSelected ? "Selected" : "Select"}
          </Button>
        )}
      </div>
    </div>
  );
}
