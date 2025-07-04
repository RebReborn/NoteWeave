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
  ChevronDown,
  Check,
  Bold,
  Italic,
  Code,
  Link,
  Quote,
  Heading2,
  List,
  ListOrdered,
  Image,
  Table,
  SeparatorHorizontal,
  Undo,
  Redo,
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
import { parseMarkdown } from "@/lib/markdown";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useHotkeys } from "@/hooks/use-hotkeys";
import TurndownService from "turndown";

type NoteEditorProps = {
  note: Note;
  updateNote: (id: string, updatedNote: Partial<Note>) => void;
  className?: string;
};

const EditorToolbar = ({ 
  onInsert,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}: { 
  onInsert: (syntax: string, cursorOffset?: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}) => {
  const tools = [
    { icon: Bold, syntax: "**$1**", shortcut: "Ctrl+B", tooltip: "Bold" },
    { icon: Italic, syntax: "*$1*", shortcut: "Ctrl+I", tooltip: "Italic" },
    { icon: Code, syntax: "`$1`", shortcut: "Ctrl+`", tooltip: "Inline Code" },
    { icon: Link, syntax: "[$1]($2)", shortcut: "Ctrl+K", tooltip: "Link" },
    { icon: Image, syntax: "![$1]($2)", shortcut: "Ctrl+Shift+I", tooltip: "Image" },
    { icon: Quote, syntax: "> $1", shortcut: "Ctrl+Shift+Q", tooltip: "Blockquote" },
    { icon: Heading2, syntax: "## $1", shortcut: "Ctrl+Shift+H", tooltip: "Heading" },
    { icon: List, syntax: "- $1", shortcut: "Ctrl+Shift+U", tooltip: "Bullet List" },
    { icon: ListOrdered, syntax: "1. $1", shortcut: "Ctrl+Shift+O", tooltip: "Numbered List" },
    { icon: Table, syntax: "| Header |\n|--------|\n| Cell   |", shortcut: "Ctrl+Shift+T", tooltip: "Table" },
    { icon: SeparatorHorizontal, syntax: "---\n", shortcut: "Ctrl+Shift+S", tooltip: "Horizontal Rule" },
  ];

  return (
    <div className="border-b bg-card p-1 flex items-center gap-1 flex-wrap rounded-t-md">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Undo (Ctrl+Z)</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onRedo}
            disabled={!canRedo}
            aria-label="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Redo (Ctrl+Y)</p>
        </TooltipContent>
      </Tooltip>

      <div className="h-6 w-px bg-border mx-1" />

      {tools.map((tool, index) => (
        <Tooltip key={index}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onInsert(tool.syntax)}
              aria-label={tool.tooltip}
            >
              <tool.icon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{tool.tooltip}</p>
            <p className="text-xs text-muted-foreground">{tool.shortcut}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};

export function NoteEditor({ note, updateNote, className }: NoteEditorProps) {
  const [title, setTitle] = React.useState(note.title);
  const [content, setContent] = React.useState(note.content);
  const [tags, setTags] = React.useState(note.tags.join(", "));
  const [isImproving, setIsImproving] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"edit" | "preview">("edit");
  const [history, setHistory] = React.useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = React.useState(-1);
  const { toast } = useToast();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const turndownServiceRef = React.useRef<TurndownService | null>(null);

  React.useEffect(() => {
    turndownServiceRef.current = new TurndownService();
  }, []);

  const previewContent = React.useMemo(() => parseMarkdown(content), [content]);

  // Initialize history
  React.useEffect(() => {
    if (content) {
      setHistory([content]);
      setHistoryIndex(0);
    }
  }, []);

  // Save to history when content changes
  const saveToHistory = (newContent: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newContent);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = () => {
    if (canUndo) {
      const prevContent = history[historyIndex - 1];
      setContent(prevContent);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      const nextContent = history[historyIndex + 1];
      setContent(nextContent);
      setHistoryIndex(historyIndex + 1);
    }
  };

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

  const handleInsert = (syntax: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);

    // Handle special syntax patterns
    let newContent = "";
    let newCursorPos = start;

    if (syntax.includes("$1")) {
      // Replace $1 with selected text
      newContent = beforeText + syntax.replace(/\$1/g, selectedText) + afterText;
      
      // Set cursor position after first $1 if no selection
      if (!selectedText) {
        const firstMarker = syntax.indexOf("$1");
        newCursorPos = start + firstMarker;
      } else {
        newCursorPos = start + syntax.replace(/\$1/g, selectedText).length;
      }
    } else {
      // Simple insertion
      newContent = beforeText + syntax + selectedText + afterText;
      newCursorPos = start + syntax.length;
    }

    setContent(newContent);
    saveToHistory(newContent);

    // Focus and position cursor
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = newCursorPos;
      }
    }, 0);
  };

  // Keyboard shortcuts
  useHotkeys([
    { keys: ["ctrl", "z"], callback: handleUndo },
    { keys: ["ctrl", "y"], callback: handleRedo },
    { keys: ["ctrl", "b"], callback: () => handleInsert("**$1**") },
    { keys: ["ctrl", "i"], callback: () => handleInsert("*$1*") },
    { keys: ["ctrl", "k"], callback: () => handleInsert("[$1]($2)") },
  ]);

  const handleImproveGrammar = async () => {
    setIsImproving(true);
    try {
      const result = await improveGrammar({ text: content });
      const improvedText = result.improvedText;
      setContent(improvedText);
      saveToHistory(improvedText);
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

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (!turndownServiceRef.current) return;

    const pastedHtml = event.clipboardData.getData("text/html");

    if (pastedHtml) {
      event.preventDefault();
      const markdown = turndownServiceRef.current.turndown(pastedHtml);

      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const beforeText = content.substring(0, start);
      const afterText = content.substring(end);

      const newContent = beforeText + markdown + afterText;
      setContent(newContent);
      saveToHistory(newContent);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd =
            start + markdown.length;
        }
      }, 0);
    }
  };

  return (
    <div className={cn("flex flex-col gap-4 h-full", className)}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            className="font-headline text-2xl font-bold h-auto px-0 border-none focus-visible:ring-0 shadow-none flex-1"
          />
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleImproveGrammar}
                  disabled={isImproving || !content}
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                >
                  {isImproving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span className="sr-only md:not-sr-only">Improve</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Improve grammar with AI</TooltipContent>
            </Tooltip>
            
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      <span className="sr-only md:not-sr-only">Export</span>
                      <ChevronDown className="h-3 w-3 opacity-50 hidden md:block" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Export options</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("md")}>
                  <FileCode className="mr-2 h-4 w-4" />
                  Markdown (.md)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("txt")}>
                  <FileText className="mr-2 h-4 w-4" />
                  Plain Text (.txt)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                  <Printer className="mr-2 h-4 w-4" />
                  PDF
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
            placeholder="Add tags (comma separated)"
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={activeTab === "edit" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("edit")}
          className="gap-2"
        >
          {activeTab === "edit" && <Check className="h-4 w-4" />}
          Edit
        </Button>
        <Button
          variant={activeTab === "preview" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("preview")}
          className="gap-2"
        >
          {activeTab === "preview" && <Check className="h-4 w-4" />}
          Preview
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === "edit" ? (
          <Card className="h-full flex flex-col">
            <EditorToolbar 
              onInsert={handleInsert} 
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={canUndo}
              canRedo={canRedo}
            />
            <CardContent className="p-0 flex-1">
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  saveToHistory(e.target.value);
                }}
                onPaste={handlePaste}
                placeholder="Start writing your note here..."
                className="h-full w-full resize-none border-0 rounded-t-none p-4 focus-visible:ring-0 min-h-[50vh] font-mono text-sm"
                spellCheck="false"
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full overflow-hidden">
            <CardContent className="p-4 h-full overflow-y-auto prose prose-sm dark:prose-invert max-w-none">
              {content ? (
                <div dangerouslySetInnerHTML={{ __html: previewContent }} />
              ) : (
                <div className="text-muted-foreground flex items-center justify-center h-full">
                  Nothing to preview yet...
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {note.updatedAt && (
        <div className="text-xs text-muted-foreground text-right">
          Last updated: {new Date(note.updatedAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}
