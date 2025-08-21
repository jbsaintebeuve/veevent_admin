"use client";

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Highlight } from "@tiptap/extension-highlight";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/utils/utils";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Highlighter,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Code,
} from "lucide-react";
import { useCallback, useEffect } from "react";

interface NovelEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

export function NovelEditor({
  value = "",
  onChange,
  placeholder = "Commencez à écrire...",
  className,
  editable = true,
}: NovelEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-6",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-6",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: "border-l-4 border-gray-300 pl-4 italic text-gray-600",
          },
        },
        code: {
          HTMLAttributes: {
            class: "bg-gray-100 px-1 py-0.5 rounded text-sm font-mono",
          },
        },
      }),
      Underline,
      Highlight.configure({
        multicolor: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4",
          "prose-headings:font-bold prose-headings:text-gray-900",
          "prose-p:text-gray-700 prose-p:leading-relaxed",
          "prose-strong:text-gray-900 prose-strong:font-semibold",
          "prose-em:text-gray-700",
          "prose-code:text-red-600 prose-code:bg-gray-100",
          "prose-blockquote:text-gray-600 prose-blockquote:border-l-gray-300",
          "prose-ul:text-gray-700 prose-ol:text-gray-700",
          "prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
        ),
      },
    },
  });

  // Synchroniser le contenu quand la prop value change
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL du lien", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  // Fonction pour empêcher la soumission du formulaire
  const handleToolbarClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  if (!editor) {
    return (
      <div
        className={cn(
          "border rounded-lg bg-background animate-pulse",
          className
        )}
      >
        <div className="h-12 bg-muted/50 border-b"></div>
        <div className="h-48 p-4">
          <div className="h-4 bg-muted/50 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-muted/50 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border rounded-lg bg-background overflow-hidden",
        className
      )}
    >
      {/* Toolbar simplifiée */}
      <div className="border-b bg-muted/30 p-2">
        <div className="flex flex-wrap items-center gap-1">
          {/* Undo/Redo en premier */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) =>
              handleToolbarClick(e, () => editor.chain().focus().undo().run())
            }
            disabled={!editor.can().undo()}
            className="h-8 w-8"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) =>
              handleToolbarClick(e, () => editor.chain().focus().redo().run())
            }
            disabled={!editor.can().redo()}
            className="h-8 w-8"
          >
            <Redo className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-2" />

          {/* Titres */}
          <Button
            type="button"
            variant={
              editor.isActive("heading", { level: 3 }) ? "default" : "ghost"
            }
            size="sm"
            onClick={(e) =>
              handleToolbarClick(e, () =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              )
            }
            className="h-8 px-2"
          >
            H3
          </Button>
          <Button
            type="button"
            variant={
              editor.isActive("heading", { level: 4 }) ? "default" : "ghost"
            }
            size="sm"
            onClick={(e) =>
              handleToolbarClick(e, () =>
                editor.chain().focus().toggleHeading({ level: 4 }).run()
              )
            }
            className="h-8 px-2"
          >
            H4
          </Button>

          <Separator orientation="vertical" className="h-6 mx-2" />

          {/* Formatage de base */}
          <Toggle
            type="button"
            size="sm"
            pressed={editor.isActive("bold")}
            onPressedChange={(pressed) => {
              if (pressed) {
                editor.chain().focus().setBold().run();
              } else {
                editor.chain().focus().unsetBold().run();
              }
            }}
            className="h-8 w-8"
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle
            type="button"
            size="sm"
            pressed={editor.isActive("italic")}
            onPressedChange={(pressed) => {
              if (pressed) {
                editor.chain().focus().setItalic().run();
              } else {
                editor.chain().focus().unsetItalic().run();
              }
            }}
            className="h-8 w-8"
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle
            type="button"
            size="sm"
            pressed={editor.isActive("underline")}
            onPressedChange={(pressed) => {
              if (pressed) {
                editor.chain().focus().setUnderline().run();
              } else {
                editor.chain().focus().unsetUnderline().run();
              }
            }}
            className="h-8 w-8"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Toggle>
          <Toggle
            type="button"
            size="sm"
            pressed={editor.isActive("strike")}
            onPressedChange={(pressed) => {
              if (pressed) {
                editor.chain().focus().setStrike().run();
              } else {
                editor.chain().focus().unsetStrike().run();
              }
            }}
            className="h-8 w-8"
          >
            <Strikethrough className="h-4 w-4" />
          </Toggle>

          <Separator orientation="vertical" className="h-6 mx-2" />

          {/* Listes et citations */}
          <Toggle
            type="button"
            size="sm"
            pressed={editor.isActive("bulletList")}
            onPressedChange={(pressed) => {
              if (pressed) {
                editor.chain().focus().toggleBulletList().run();
              } else {
                editor.chain().focus().lift("listItem").run();
              }
            }}
            className="h-8 w-8"
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            type="button"
            size="sm"
            pressed={editor.isActive("orderedList")}
            onPressedChange={(pressed) => {
              if (pressed) {
                editor.chain().focus().toggleOrderedList().run();
              } else {
                editor.chain().focus().lift("listItem").run();
              }
            }}
            className="h-8 w-8"
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
          <Toggle
            type="button"
            size="sm"
            pressed={editor.isActive("blockquote")}
            onPressedChange={(pressed) => {
              if (pressed) {
                editor.chain().focus().setBlockquote().run();
              } else {
                editor.chain().focus().unsetBlockquote().run();
              }
            }}
            className="h-8 w-8"
          >
            <Quote className="h-4 w-4" />
          </Toggle>

          <Separator orientation="vertical" className="h-6 mx-2" />

          {/* Autres */}
          <Toggle
            type="button"
            size="sm"
            pressed={editor.isActive("code")}
            onPressedChange={(pressed) => {
              if (pressed) {
                editor.chain().focus().setCode().run();
              } else {
                editor.chain().focus().unsetCode().run();
              }
            }}
            className="h-8 w-8"
          >
            <Code className="h-4 w-4" />
          </Toggle>
          <Toggle
            type="button"
            size="sm"
            pressed={editor.isActive("highlight")}
            onPressedChange={(pressed) => {
              if (pressed) {
                editor.chain().focus().setHighlight().run();
              } else {
                editor.chain().focus().unsetHighlight().run();
              }
            }}
            className="h-8 w-8"
          >
            <Highlighter className="h-4 w-4" />
          </Toggle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => handleToolbarClick(e, setLink)}
            className="h-8 w-8"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bubble Menu - Menu contextuel */}
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{
            duration: 100,
            placement: "top-start",
          }}
          className="flex items-center gap-1 p-1 bg-background border rounded-lg shadow-xl z-50"
        >
          <Toggle
            size="sm"
            pressed={editor.isActive("bold")}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            className="h-8 w-8"
          >
            <Bold className="h-3 w-3" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("italic")}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            className="h-8 w-8"
          >
            <Italic className="h-3 w-3" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("underline")}
            onPressedChange={() =>
              editor.chain().focus().toggleUnderline().run()
            }
            className="h-8 w-8"
          >
            <UnderlineIcon className="h-3 w-3" />
          </Toggle>
          <Separator orientation="vertical" className="h-6 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => handleToolbarClick(e, setLink)}
            className="h-8 w-8"
          >
            <LinkIcon className="h-3 w-3" />
          </Button>
        </BubbleMenu>
      )}

      {/* Zone d'édition */}
      <div className="relative">
        <EditorContent editor={editor} className="outline-none" />
      </div>
    </div>
  );
}
