import { Button } from "@/components/ui/button";
import { 
  Facebook, 
  Linkedin, 
  Send,
  Link2,
  MessageCircle,
  Share2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SocialShareProps {
  title: string;
  excerpt: string;
  url: string;
  className?: string;
}

export function SocialShare({ title, excerpt, url, className }: SocialShareProps) {
  const { toast } = useToast();

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "¡Enlace copiado!",
        description: "El enlace ha sido copiado al portapapeles.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace.",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: excerpt,
          url,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    }
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <span className="text-sm font-medium text-gray-600 mr-2">Compartir:</span>
      
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
        onClick={() => handleShare('twitter')}
        title="Compartir en X"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
        </svg>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="rounded-full hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
        onClick={() => handleShare('facebook')}
        title="Compartir en Facebook"
      >
        <Facebook className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="rounded-full hover:bg-blue-600/10 hover:text-blue-600 transition-colors"
        onClick={() => handleShare('linkedin')}
        title="Compartir en LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="rounded-full hover:bg-green-500/10 hover:text-green-500 transition-colors"
        onClick={() => handleShare('whatsapp')}
        title="Compartir en WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="rounded-full hover:bg-blue-400/10 hover:text-blue-400 transition-colors"
        onClick={() => handleShare('telegram')}
        title="Compartir en Telegram"
      >
        <Send className="h-4 w-4" />
      </Button>

      <div className="h-4 w-px bg-gray-300 mx-2" />

      <Button
        variant="ghost"
        size="icon"
        className="rounded-full hover:bg-gray-500/10 hover:text-gray-600 transition-colors"
        onClick={handleCopyLink}
        title="Copiar enlace"
      >
        <Link2 className="h-4 w-4" />
      </Button>

      {'share' in navigator && (
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-gray-500/10 hover:text-gray-600 transition-colors md:hidden"
          onClick={handleNativeShare}
          title="Compartir"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}