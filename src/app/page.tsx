
"use client";

import * as React from "react";
import { Plus, Loader2 } from "lucide-react";
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
import { Logo } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { NoteList } from "@/components/note-list";
import { NoteEditor } from "@/components/note-editor";
import { NoNoteSelected } from "@/components/no-note-selected";
import { Skeleton } from "@/components/ui/skeleton";
import { UserNav } from "@/components/user-nav";


export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const {
    notes,
    loading: notesLoading,
    addNote,
    updateNote,
    deleteNote,
  } = useNotes(user);

  const [activeNoteId, setActiveNoteId] = React.useState<string | null>(null);

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

  const activeNote = React.useMemo(
    () => notes.find((note) => note.id === activeNoteId),
    [notes, activeNoteId]
  );

  const handleAddNote = async () => {
    if (!user) return;
    try {
      const newNote = await addNote();
      setActiveNoteId(newNote.id);
    } catch (error) {
      // Error is handled in useNotes hook with a toast
    }
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
  };
  
  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon" className="border-r">
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
              notes={notes}
              activeNoteId={activeNoteId}
              onSelectNote={setActiveNoteId}
              onDeleteNote={handleDeleteNote}
            />
          )}
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="max-h-svh overflow-y-auto">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-end gap-2 border-b bg-background/80 px-4 backdrop-blur-sm">
           <div className="block md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleAddNote}
                disabled={notesLoading || authLoading}
              >
                <Plus />
              </Button>
           </div>
           <div className="hidden md:block">
              <ThemeToggle />
           </div>
           <UserNav />
        </header>

        <main className="flex-1 p-4 md:p-6">
          {notesLoading && !activeNote ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : activeNote ? (
            <NoteEditor
              key={activeNote.id}
              note={activeNote}
              updateNote={updateNote}
            />
          ) : (
            <NoNoteSelected onNewNote={handleAddNote} />
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
