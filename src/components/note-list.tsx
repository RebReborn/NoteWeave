"use client";

import { Trash2, Pin, Pinned } from "lucide-react";
import type { Note } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

type NoteListProps = {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin?: (id: string) => void;
  loading?: boolean;
};

export function NoteList({
  notes,
  activeNoteId,
  onSelectNote,
  onDeleteNote,
  onTogglePin,
  loading = false,
}: NoteListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
        <p className="text-sm text-muted-foreground">
          No notes found
        </p>
        <p className="text-xs text-muted-foreground">
          Create a new note to get started
        </p>
      </div>
    );
  }

  // Sort notes with pinned notes first
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <ul className="space-y-1">
      {sortedNotes.map((note) => (
        <li key={note.id} className="group relative">
          <button
            onClick={() => onSelectNote(note.id)}
            className={cn(
              "w-full text-left p-3 rounded-md hover:bg-accent/50 transition-colors block",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              activeNoteId === note.id && "bg-accent",
              note.pinned && "border-l-4 border-l-primary"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate">
                    {note.title || "Untitled Note"}
                  </h3>
                  {note.pinned && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Pinned className="h-4 w-4 flex-shrink-0 text-primary" />
                      </TooltipTrigger>
                      <TooltipContent>Pinned note</TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate mt-1">
                  {note.content?.substring(0, 100) || "No content"}
                </p>
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.tags.slice(0, 3).map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary"
                        className="truncate max-w-[80px]"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {note.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{note.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
              </div>
            </div>
          </button>

          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100">
            {onTogglePin && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="iconSm"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePin(note.id);
                    }}
                  >
                    {note.pinned ? (
                      <Pinned className="h-4 w-4" />
                    ) : (
                      <Pin className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {note.pinned ? "Unpin note" : "Pin note"}
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="iconSm"
                  className="h-6 w-6 text-destructive/70 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNote(note.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete note</TooltipContent>
            </Tooltip>
          </div>
        </li>
      ))}
    </ul>
  );
}