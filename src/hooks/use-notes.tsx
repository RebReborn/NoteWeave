"use client";

import * as React from "react";
import type { Note } from "@/lib/types";

const initialNotes: Note[] = [
  {
    id: "1",
    title: "Welcome to NoteWeave!",
    content:
      "# Welcome to NoteWeave!\n\nThis is a sample note to help you get started. You can **edit** this note, create new ones, and organize your thoughts with tags.\n\n## Features\n* Markdown support\n* Live preview\n* Tagging system\n* AI-powered grammar check\n\nEnjoy weaving your thoughts!",
    tags: ["getting-started", "welcome"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Meeting Notes",
    content: "## Project Alpha - Kick-off\n\n**Attendees:**\n- Alice\n- Bob\n- Charlie\n\n**Action items:**\n1. Finalize the project scope by Friday.\n2. Bob to create the initial repository.",
    tags: ["work", "project-alpha"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];


export function useNotes() {
  const [notes, setNotes] = React.useState<Note[]>([]);
  
  React.useEffect(() => {
    try {
      const storedNotes = localStorage.getItem("notes");
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      } else {
        setNotes(initialNotes);
      }
    } catch (error) {
      console.error("Failed to load notes from localStorage", error);
      setNotes(initialNotes);
    }
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem("notes", JSON.stringify(notes));
    } catch (error) {
       console.error("Failed to save notes to localStorage", error);
    }
  }, [notes]);

  const addNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Untitled Note",
      content: "",
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prevNotes) => [newNote, ...prevNotes]);
    return newNote;
  };

  const updateNote = (id: string, updatedNote: Partial<Note>) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, ...updatedNote } : note
      )
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
  };

  return { notes, addNote, updateNote, deleteNote };
}
