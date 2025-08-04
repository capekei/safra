import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function ArticlePreview() {
  const [location, navigate] = useLocation();
  const [previewData, setPreviewData] = useState<any>(null);

  useEffect(() => {
    // Get preview data from URL query params
    const params = new URLSearchParams(window.location.search);
    const data = params.get("data");
    
    if (data) {
      try {
        const parsed = JSON.parse(decodeURIComponent(data));
        setPreviewData(parsed);
      } catch (error) {
        console.error("Error parsing preview data:", error);
        navigate("/admin/articles");
      }
    } else {
      navigate("/admin/articles");
    }
  }, [navigate]);

  if (!previewData) {
    return <div>Cargando vista previa...</div>;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Preview Banner */}
        <div className="bg-yellow-100 border-b border-yellow-300">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <p className="text-sm font-medium text-yellow-800">
              🔍 Vista previa del artículo - Este es un borrador no publicado
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.close()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Cerrar Vista Previa
            </Button>
          </div>
        </div>

        <article className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Featured Image */}
          {previewData.featuredImage && (
            <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
              <img
                src={previewData.featuredImage}
                alt={previewData.title}
                className="w-full h-[400px] object-cover"
              />
            </div>
          )}

          {/* Article Header */}
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {previewData.title}
            </h1>
            {previewData.excerpt && (
              <p className="text-xl text-gray-600 leading-relaxed">
                {previewData.excerpt}
              </p>
            )}
          </header>

          {/* Article Meta */}
          <div className="flex items-center gap-6 text-sm text-gray-500 mb-8 pb-8 border-b">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{previewData.author?.name || "Autor"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(previewData.publishedAt || new Date()), "d 'de' MMMM, yyyy", { locale: es })}
              </span>
            </div>
          </div>

          {/* Video Embed */}
          {previewData.videoUrl && (
            <div className="mb-8">
              <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
                {previewData.videoUrl.includes("youtube.com") || previewData.videoUrl.includes("youtu.be") ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${previewData.videoUrl.split("v=")[1]?.split("&")[0] || previewData.videoUrl.split("/").pop()}`}
                    className="w-full h-full"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={previewData.videoUrl}
                    controls
                    className="w-full h-full"
                  />
                )}
              </div>
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <div 
              dangerouslySetInnerHTML={{ __html: previewData.content }}
              className="text-gray-800 leading-relaxed [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mb-3 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mb-2 [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4 [&>blockquote]:border-l-4 [&>blockquote]:border-gray-300 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-gray-600 [&>blockquote]:mb-4 [&>img]:rounded-lg [&>img]:my-4 [&>table]:border-collapse [&>table]:w-full [&>table]:mb-4 [&>table_th]:border [&>table_th]:p-2 [&>table_th]:bg-gray-100 [&>table_td]:border [&>table_td]:p-2"
            />
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}