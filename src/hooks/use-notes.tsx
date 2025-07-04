
"use client";

import * as React from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  CollectionReference,
  DocumentData,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Note } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { User } from "firebase/auth";

const initialNotes: Omit<Note, "id" | "createdAt" | "updatedAt">[] = [
  {
    title: "Welcome to NoteWeave!",
    content:
      "# Welcome to NoteWeave!\n\nThis is a sample note to help you get started. You can **edit** this note, create new ones, and organize your thoughts with tags.\n\n## Features\n* Markdown support\n* Live preview\n* Tagging system\n* AI-powered grammar check\n\nEnjoy weaving your thoughts!",
    tags: ["getting-started", "welcome"],
    pinned: true,
  },
  {
    title: "Meeting Notes",
    content:
      "## Project Alpha - Kick-off\n\n**Attendees:**\n- Alice\n- Bob\n- Charlie\n\n**Action items:**\n1. Finalize the project scope by Friday.\n2. Bob to create the initial repository.",
    tags: ["work", "project-alpha"],
    pinned: false,
  },
];

async function seedInitialNotes(
  notesCollectionRef: CollectionReference<DocumentData>
) {
  try {
    for (const note of initialNotes) {
      await addDoc(notesCollectionRef, {
        ...note,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error seeding initial notes: ", error);
  }
}

export function useNotes(user: User | null) {
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  const notesCollectionRef = React.useMemo(() => {
    if (!user) return null;
    return collection(db, "users", user.uid, "notes");
  }, [user]);

  React.useEffect(() => {
    if (!user || !notesCollectionRef) {
      setNotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(notesCollectionRef, orderBy("updatedAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      async (querySnapshot) => {
        if (querySnapshot.empty && !querySnapshot.metadata.fromCache) {
          await seedInitialNotes(notesCollectionRef);
        } else {
          const notesData = querySnapshot.docs.map((docSnapshot) => {
            const data = docSnapshot.data();
            return {
              id: docSnapshot.id,
              title: data.title,
              content: data.content,
              tags: data.tags,
              pinned: data.pinned || false,
              createdAt:
                (data.createdAt as Timestamp)?.toDate().toISOString() ||
                new Date().toISOString(),
              updatedAt:
                (data.updatedAt as Timestamp)?.toDate().toISOString() ||
                new Date().toISOString(),
            };
          });
          setNotes(notesData);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error getting notes: ", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load notes. Please try again later.",
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, notesCollectionRef, toast]);

  const addNote = async () => {
    if (!notesCollectionRef) throw new Error("User not authenticated");

    const newNoteStub = {
      title: "Untitled Note",
      content: "",
      tags: [],
      pinned: false,
    };

    try {
      const docRef = await addDoc(notesCollectionRef, {
        ...newNoteStub,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return {
        ...newNoteStub,
        id: docRef.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error adding note: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create a new note.",
      });
      throw error;
    }
  };

  const updateNote = async (id: string, updatedNote: Partial<Note>) => {
    if (!user) throw new Error("User not authenticated");
    const noteDoc = doc(db, "users", user.uid, "notes", id);
    const { id: noteId, createdAt, updatedAt, ...rest } = updatedNote;
    try {
      await updateDoc(noteDoc, {
        ...rest,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating note: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save note changes.",
      });
    }
  };

  const deleteNote = async (id: string) => {
    if (!user) throw new Error("User not authenticated");
    const noteDoc = doc(db, "users", user.uid, "notes", id);
    try {
      await deleteDoc(noteDoc);
    } catch (error) {
      console.error("Error deleting note: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the note.",
      });
    }
  };

  const toggleNotePin = async (id: string) => {
    if (!user) throw new Error("User not authenticated");
    const noteDocRef = doc(db, "users", user.uid, "notes", id);
    try {
      const noteSnapshot = await getDoc(noteDocRef);
      if (noteSnapshot.exists()) {
        const currentNote = noteSnapshot.data();
        await updateDoc(noteDocRef, {
          pinned: !currentNote.pinned,
        });
      }
    } catch (error) {
      console.error("Error toggling pin status: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update pin status.",
      });
    }
  };

  return { notes, loading, addNote, updateNote, deleteNote, toggleNotePin };
}
