"use client";

import * as React from "react";
import { Plus, Loader2, Search, Menu } from "lucide-react";
import { redirect } from "next/navigation";

import { useNotes } from "@/hooks/use-notes";
import { useAuth } from "@/hooks/use-auth";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { NoteList } from "@/components/note-list";
import { NoteEditor } from "@/components/note-editor";
import { NoNoteSelected } from "@/components/no-note-selected";
import { Skeleton } from "@/components/ui/skeleton";
import { UserNav } from "@/components/user-nav";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const {
    notes,
    loading: notesLoading,
    addNote,
    updateNote,
    deleteNote,
    toggleNotePin,
  } = useNotes(user);

  const [activeNoteId, setActiveNoteId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    if (!authLoading && !user) {
      redirect("/login");
    }
  }, [user, authLoading]);

  React.useEffect(() => {
    if (!notesLoading && notes.length > 0 && !notes.some((n) => n.id === activeNoteId)) {
      setActiveNoteId(notes[0].id);
    }
    if (!notesLoading && notes.length === 0) {
      setActiveNoteId(null);
    }
  }, [notes, activeNoteId, notesLoading]);

  const filteredNotes = React.useMemo(() => {
    if (!searchQuery) return notes;
    return notes.filter(note => 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [notes, searchQuery]);

  const activeNote = React.useMemo(
    () => notes.find((note) => note.id === activeNoteId),
    [notes, activeNoteId]
  );

  const handleAddNote = async () => {
    if (!user) return;
    try {
      const newNote = await addNote();
      setActiveNoteId(newNote.id);
      setIsMobileSidebarOpen(false); // Close sidebar on mobile after adding
    } catch (error) {
      // Error is handled in useNotes hook with a toast
    }
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    // If deleting the active note, select the next available note
    if (id === activeNoteId) {
      const remainingNotes = notes.filter(note => note.id !== id);
      setActiveNoteId(remainingNotes.length > 0 ? remainingNotes[0].id : null);
    }
  };
  
  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider onOpenChange={setIsMobileSidebarOpen}>
      <Sidebar 
        side="left" 
        collapsible="icon" 
        className="border-r"
        open={isMobileSidebarOpen}
      >
        <SidebarHeader>
          <div className="flex h-10 items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Logo className="size-6 text-primary" />
              <span className="font-headline text-lg font-bold">NoteWeave</span>
            </div>
            <SidebarTrigger />
          </div>
          <div className="flex w-full items-center justify-between p-2 pt-0">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleAddNote}
              disabled={notesLoading}
            >
              <Plus className="mr-2 size-4" />
              New Note
            </Button>
          </div>
          <div className="px-2 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2 pt-0">
          {notesLoading ? (
            <div className="space-y-1">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <NoteList
              notes={filteredNotes}
              activeNoteId={activeNoteId}
              onSelectNote={(id) => {
                setActiveNoteId(id);
                setIsMobileSidebarOpen(false); // Close sidebar on mobile after selection
              }}
              onDeleteNote={handleDeleteNote}
              onTogglePin={toggleNotePin}
            />
          )}
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="max-h-svh overflow-y-auto">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 md:hidden">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileSidebarOpen(true)}
                >
                  <Menu className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open sidebar</TooltipContent>
            </Tooltip>
            <span className="font-headline text-lg font-bold md:hidden">NoteWeave</span>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleAddNote}
                  disabled={notesLoading || authLoading}
                  className={cn(notesLoading && "opacity-50")}
                >
                  <Plus />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New note</TooltipContent>
            </Tooltip>
            <ThemeToggle />
            <UserNav />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          {notesLoading && !activeNote ? (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading your notes...</p>
            </div>
          ) : activeNote ? (
            <NoteEditor
              key={activeNote.id}
              note={activeNote}
              updateNote={updateNote}
              className="max-w-4xl mx-auto" // Better readability for long content
            />
          ) : (
            <NoNoteSelected 
              onNewNote={handleAddNote} 
              className="max-w-2xl mx-auto" 
            />
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
