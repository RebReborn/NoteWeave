"use client";

import * as React from "react";
import {
  Download,
  Loader2,
  FileText,
  FileCode,
  Printer,
  Sparkles,
  Tag,
} from "lucide-react";
import { improveGrammar } from "@/ai/flows/improve-grammar";
import { useToast } from "@/hooks/use-toast";
import type { Note } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { parseMarkdown } from "@/lib/markdown";

type NoteEditorProps = {
  note: Note;
  updateNote: (id: string, updatedNote: Partial<Note>) => void;
};

export function NoteEditor({ note, updateNote }: NoteEditorProps) {
  const [title, setTitle] = React.useState(note.title);
  const [content, setContent] = React.useState(note.content);
  const [tags, setTags] = React.useState(note.tags.join(", "));
  const [isImproving, setIsImproving] = React.useState(false);
  const { toast } = useToast();

  const previewContent = React.useMemo(() => parseMarkdown(content), [content]);

  React.useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags.join(", "));
  }, [note]);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      const updatedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);
      if (
        title !== note.title ||
        content !== note.content ||
        JSON.stringify(updatedTags) !== JSON.stringify(note.tags)
      ) {
        updateNote(note.id, {
          title,
          content,
          tags: updatedTags,
          updatedAt: new Date().toISOString(),
        });
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [title, content, tags, note, updateNote]);

  const handleImproveGrammar = async () => {
    setIsImproving(true);
    try {
      const result = await improveGrammar({ text: content });
      setContent(result.improvedText);
      toast({
        title: "Content Improved",
        description: "Your note has been updated with AI suggestions.",
      });
    } catch (error) {
      console.error("Failed to improve grammar:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to improve grammar. Please try again.",
      });
    } finally {
      setIsImproving(false);
    }
  };

  const handleExport = (format: "md" | "txt" | "pdf") => {
    const safeTitle = title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    if (format === "pdf") {
      window.print();
      return;
    }

    const blob = new Blob([content], {
      type: format === "md" ? "text/markdown" : "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeTitle || "untitled"}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className="font-headline text-2xl font-bold h-auto p-0 border-none focus-visible:ring-0 shadow-none"
        />
        <div className="flex items-center gap-2">
          <Button
            onClick={handleImproveGrammar}
            disabled={isImproving || !content}
            variant="outline"
            size="sm"
          >
            {isImproving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Improve
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport("md")}>
                <FileCode className="mr-2 h-4 w-4" /> Markdown (.md)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("txt")}>
                <FileText className="mr-2 h-4 w-4" /> Plain Text (.txt)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                <Printer className="mr-2 h-4 w-4" /> PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="relative">
        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Add tags, comma separated..."
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[60vh]">
        <Card>
          <CardContent className="p-0">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start weaving your thoughts..."
              className="h-full w-full resize-none border-0 p-4 focus-visible:ring-0"
            />
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="p-4 h-full overflow-y-auto">
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: previewContent }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
