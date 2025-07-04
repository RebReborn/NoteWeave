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

type NoteEditorProps = {
  note: Note;
  updateNote: (id: string, updatedNote: Partial<Note>) => void;
  className?: string;
};

const EditorToolbar = ({ onInsert }: { onInsert: (syntax: string) => void }) => {
  const tools = [
    { icon: Bold, syntax: "****", tooltip: "Bold" },
    { icon: Italic, syntax: "**", tooltip: "Italic" },
    { icon: Code, syntax: "``", tooltip: "Code" },
    { icon: Link, syntax: "[]()", tooltip: "Link" },
    { icon: Quote, syntax: "> ", tooltip: "Blockquote" },
    { icon: Heading2, syntax: "## ", tooltip: "Heading" },
    { icon: List, syntax: "* ", tooltip: "List" },
  ];

  return (
    <div className="border-b bg-card p-1 flex items-center gap-1 flex-wrap rounded-t-md">
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
          <TooltipContent>
            <p>{tool.tooltip}</p>
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
  const { toast } = useToast();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

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

  const handleInsert = (syntax: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let insertion = "";
    let cursorOffset = 0;

    if (syntax === '****' || syntax === '**' || syntax === '``') {
        const marker = syntax.substring(0, syntax.length / 2);
        insertion = `${marker}${selectedText}${marker}`;
        cursorOffset = start + marker.length + selectedText.length;
    } else if (syntax === '[]()') {
        insertion = `[${selectedText || ''}]()`;
        cursorOffset = start + (selectedText ? selectedText.length : 0) + 3;
    } else { // prefix
        insertion = `${syntax}${selectedText}`;
        cursorOffset = start + syntax.length + selectedText.length;
    }

    const newContent = content.substring(0, start) + insertion + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = cursorOffset;
    }, 0);
  };

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
            <EditorToolbar onInsert={handleInsert} />
            <CardContent className="p-0 flex-1">
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your note here..."
                className="h-full w-full resize-none border-0 rounded-t-none p-4 focus-visible:ring-0 min-h-[50vh]"
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
