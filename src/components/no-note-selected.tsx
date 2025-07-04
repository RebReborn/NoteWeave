import { Plus, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type NoNoteSelectedProps = {
  onNewNote: () => void;
  className?: string;
};

export function NoNoteSelected({ onNewNote, className }: NoNoteSelectedProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted bg-background/50 p-8 text-center",
        "hover:bg-accent/20 transition-colors duration-200",
        className
      )}
    >
      <div className="mb-6 rounded-full bg-primary/10 p-4">
        <NotebookPen className="size-10 text-primary" />
      </div>
      
      <h2 className="text-2xl font-semibold tracking-tight">
        No Note Selected
      </h2>
      
      <p className="mt-2 max-w-md text-muted-foreground">
        Select an existing note from the sidebar or create a new one to begin writing.
      </p>
      
      <Button 
        className="mt-6 group"
        onClick={onNewNote}
        size="lg"
      >
        <Plus className="mr-2 size-4 transition-transform group-hover:rotate-90" />
        Create New Note
      </Button>

      <p className="mt-4 text-xs text-muted-foreground">
        Pro tip: Press ⌘+N to create a new note quickly
      </p>
    </motion.div>
  );
}