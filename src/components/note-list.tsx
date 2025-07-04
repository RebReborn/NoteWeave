"use client";

import { Trash2 } from "lucide-react";
import type { Note } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type NoteListProps = {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
};

export function NoteList({
  notes,
  activeNoteId,
  onSelectNote,
  onDeleteNote,
}: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-center">
        <p className="text-sm text-muted-foreground">No notes yet. <br/> Create one to get started!</p>
      </div>
    );
  }

  return (
    <ul className="space-y-1">
      {notes.map((note) => (
        <li key={note.id} className="group relative">
          <button
            onClick={() => onSelectNote(note.id)}
            className={cn(
              "w-full text-left p-2 rounded-md hover:bg-sidebar-accent block",
              activeNoteId === note.id && "bg-sidebar-accent"
            )}
          >
            <h3 className="font-headline font-semibold truncate pr-8">
              {note.title || "Untitled Note"}
            </h3>

            <p className="text-sm text-muted-foreground truncate">
              {note.content?.substring(0, 50) || "No content"}
            </p>
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {note.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
            onClick={() => onDeleteNote(note.id)}
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </li>
      ))}
    </ul>
  );
}
