import { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEditor, EditorContent } from '@tiptap/react';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Share2, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useState } from 'react';
import { detectPlatform } from '@/lib/tiptap-social-embed';
import { toast } from '@/hooks/use-toast';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder = 'Escribe aquí...' }: RichTextEditorProps) {
  const [showEmbedDialog, setShowEmbedDialog] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const handleEmbedSocialMedia = () => {
    if (!embedUrl) {
      toast({
        title: "Error",
        description: "Por favor ingresa una URL válida",
        variant: "destructive",
      });
      return;
    }

    const platform = detectPlatform(embedUrl);
    if (!platform) {
      toast({
        title: "Error",
        description: "URL no reconocida. Soportamos Twitter/X, Instagram y TikTok",
        variant: "destructive",
      });
      return;
    }

    console.log('Embedding platform:', platform, 'URL:', embedUrl);
    
    // Simple HTML insertion instead of using TipTap extension
    let embedHTML = '';
    
    if (platform === 'twitter') {
      const tweetMatch = embedUrl.match(/status\/(\d+)/);
      if (tweetMatch) {
        embedHTML = `<div class="social-embed twitter-embed">
          <blockquote class="twitter-tweet" data-dnt="true" data-theme="light">
            <a href="${embedUrl}">Loading tweet...</a>
          </blockquote>
        </div>`;
      }
    } else if (platform === 'instagram') {
      embedHTML = `<div class="social-embed instagram-embed">
        <blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="${embedUrl}" data-instgrm-version="14">
          <a href="${embedUrl}" target="_blank">View this post on Instagram</a>
        </blockquote>
      </div>`;
    } else if (platform === 'tiktok') {
      const videoMatch = embedUrl.match(/video\/(\d+)/);
      if (videoMatch) {
        const videoId = videoMatch[1];
        embedHTML = `<div class="social-embed tiktok-embed">
          <blockquote class="tiktok-embed" cite="${embedUrl}" data-video-id="${videoId}">
            <a href="${embedUrl}" target="_blank">View on TikTok</a>
          </blockquote>
        </div>`;
      }
    }

    if (embedHTML) {
      editor.chain().focus().insertContent(embedHTML).run();
      
      setShowEmbedDialog(false);
      setEmbedUrl('');
      
      toast({
        title: "Éxito",
        description: `${platform.charAt(0).toUpperCase() + platform.slice(1)} post agregado al artículo`,
      });
      
      console.log('Embed HTML inserted:', embedHTML);
    } else {
      toast({
        title: "Error",
        description: "No se pudo procesar la URL. Verifica el formato",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-gray-50 focus-within:bg-white transition-colors">
      <div className="border-b bg-white px-3 py-2 flex gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-8 w-8 p-0 ${editor.isActive('bold') ? 'bg-gray-100' : ''}`}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-8 w-8 p-0 ${editor.isActive('italic') ? 'bg-gray-100' : ''}`}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`h-8 w-8 p-0 ${editor.isActive('underline') ? 'bg-gray-100' : ''}`}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`h-8 w-8 p-0 ${editor.isActive('bulletList') ? 'bg-gray-100' : ''}`}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`h-8 w-8 p-0 ${editor.isActive('orderedList') ? 'bg-gray-100' : ''}`}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowEmbedDialog(true)}
          className="h-8 px-2 flex items-center gap-1"
          title="Insertar post de redes sociales"
        >
          <Share2 className="h-4 w-4" />
          <span className="text-xs">Embed</span>
        </Button>
      </div>
      <EditorContent 
        editor={editor} 
        className="prose prose-sm max-w-none p-4 min-h-[300px] [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[280px] [&_.social-embed]:my-4 [&_.social-embed]:mx-auto [&_.social-embed]:max-w-[550px]"
      />
      
      {/* Social Media Embed Dialog */}
      <Dialog open={showEmbedDialog} onOpenChange={setShowEmbedDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Insertar Post de Redes Sociales</DialogTitle>
            <DialogDescription>
              Pega la URL del post de Twitter/X, Instagram o TikTok
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input
              value={embedUrl}
              onChange={(e) => setEmbedUrl(e.target.value)}
              placeholder="https://twitter.com/usuario/status/123..."
              className="w-full"
            />
            <div className="text-sm text-gray-600 space-y-2">
              <p className="font-medium">Formatos soportados:</p>
              <div className="bg-gray-50 p-3 rounded-md">
                <ul className="list-none space-y-1 text-xs">
                  <li>🐦 <strong>Twitter/X:</strong> twitter.com/usuario/status/123... o x.com/usuario/status/123...</li>
                  <li>📷 <strong>Instagram:</strong> instagram.com/p/ABC123...</li>
                  <li>🎵 <strong>TikTok:</strong> tiktok.com/@usuario/video/123...</li>
                </ul>
              </div>
              <p className="text-xs text-gray-500">Copia y pega la URL completa del post que quieres insertar</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEmbedDialog(false);
                  setEmbedUrl('');
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleEmbedSocialMedia}>
                Insertar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}