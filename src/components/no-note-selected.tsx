import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type NoNoteSelectedProps = {
  onNewNote: () => void;
};

export function NoNoteSelected({ onNewNote }: NoNoteSelectedProps) {
  return (
    <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed bg-card">
      <div className="text-center">
        <h2 className="font-headline text-2xl font-semibold tracking-tight">
          No Note Selected
        </h2>
        <p className="mt-2 text-muted-foreground">
          Select a note from the sidebar or create a new one to get started.
        </p>
        <Button className="mt-6" onClick={onNewNote}>
          <Plus className="mr-2 size-4" />
          Create New Note
        </Button>
      </div>
    </div>
  );
}
