import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Heading from "@tiptap/extension-heading";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Minus,
  Table as TableIcon,
  Type,
  Palette,
  FileImage,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [showImagePopover, setShowImagePopover] = useState(false);
  const [textColor, setTextColor] = useState("#000000");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-4",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Placeholder.configure({
        placeholder: placeholder || "Escribe el contenido del artículo...",
      }),
      Typography,
      Color,
      TextStyle,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl("");
      setShowLinkPopover(false);
    }
  };

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
      setShowImagePopover(false);
    }
  };

  const MenuButton = ({ onClick, isActive, children, title }: any) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "h-8 w-8 p-0",
        isActive && "bg-gray-200 dark:bg-gray-700"
      )}
      title={title}
    >
      {children}
    </Button>
  );

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b bg-gray-50 dark:bg-gray-800 p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r pr-2">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="Negrita (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="Cursiva (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            title="Subrayado (Ctrl+U)"
          >
            <UnderlineIcon className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive("code")}
            title="Código"
          >
            <Code className="h-4 w-4" />
          </MenuButton>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 border-r pr-2">
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive("heading", { level: 1 })}
            title="Título 1"
          >
            <Heading1 className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive("heading", { level: 2 })}
            title="Título 2"
          >
            <Heading2 className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive("heading", { level: 3 })}
            title="Título 3"
          >
            <Heading3 className="h-4 w-4" />
          </MenuButton>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r pr-2">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            title="Lista con viñetas"
          >
            <List className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            title="Lista numerada"
          >
            <ListOrdered className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            title="Cita"
          >
            <Quote className="h-4 w-4" />
          </MenuButton>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 border-r pr-2">
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editor.isActive({ textAlign: "left" })}
            title="Alinear izquierda"
          >
            <AlignLeft className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={editor.isActive({ textAlign: "center" })}
            title="Centrar"
          >
            <AlignCenter className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={editor.isActive({ textAlign: "right" })}
            title="Alinear derecha"
          >
            <AlignRight className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            isActive={editor.isActive({ textAlign: "justify" })}
            title="Justificar"
          >
            <AlignJustify className="h-4 w-4" />
          </MenuButton>
        </div>

        {/* Color */}
        <div className="flex items-center gap-1 border-r pr-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" className="h-8 px-2 gap-1" title="Color de texto">
                <Palette className="h-4 w-4" />
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: textColor }}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="space-y-2">
                <p className="text-sm font-medium">Color de texto</p>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => {
                      setTextColor(e.target.value);
                      editor.chain().focus().setColor(e.target.value).run();
                    }}
                    className="h-8 w-full"
                  />
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#808080", "#FFA500", "#800080", "#FFC0CB", "#A52A2A"].map((color) => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setTextColor(color);
                        editor.chain().focus().setColor(color).run();
                      }}
                    />
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Links and Images */}
        <div className="flex items-center gap-1 border-r pr-2">
          <Popover open={showLinkPopover} onOpenChange={setShowLinkPopover}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0",
                  editor.isActive("link") && "bg-gray-200 dark:bg-gray-700"
                )}
                title="Insertar enlace"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <p className="text-sm font-medium">Insertar enlace</p>
                <Input
                  placeholder="https://ejemplo.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addLink();
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={addLink}>
                    Insertar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      editor.chain().focus().unsetLink().run();
                      setShowLinkPopover(false);
                    }}
                  >
                    Eliminar enlace
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover open={showImagePopover} onOpenChange={setShowImagePopover}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Insertar imagen"
              >
                <FileImage className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <p className="text-sm font-medium">Insertar imagen</p>
                <Input
                  placeholder="https://ejemplo.com/imagen.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addImage();
                    }
                  }}
                />
                <Button size="sm" onClick={addImage}>
                  Insertar
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Table */}
        <div className="flex items-center gap-1 border-r pr-2">
          <MenuButton
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            title="Insertar tabla"
          >
            <TableIcon className="h-4 w-4" />
          </MenuButton>
        </div>

        {/* Separator */}
        <div className="flex items-center gap-1 border-r pr-2">
          <MenuButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Línea horizontal"
          >
            <Minus className="h-4 w-4" />
          </MenuButton>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Deshacer (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Rehacer (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </MenuButton>
        </div>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-[400px] focus:outline-none"
      />
    </div>
  );
}