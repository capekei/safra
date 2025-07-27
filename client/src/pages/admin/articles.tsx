import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MultiSelect } from "@/components/ui/multi-select";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ImageDropzone } from "@/components/admin/image-dropzone";
import { VideoDropzone } from "@/components/admin/video-dropzone";
import { useApiClient } from "@/lib/api";

interface Author {
  id: number;
  name: string;
  email: string;
  bio?: string;
}

interface ArticleData {
  article: {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage: string | null;
    videoUrl: string | null;
    published: boolean;
    isFeatured: boolean;
    isBreaking: boolean;
    views: number;
    createdAt: string;
    updatedAt: string;
    authorId: number;
    provinceId?: string;
  };
  author: Author | null;
  category: { id: number; name: string; slug: string } | null;
  images?: { id: number; url: string }[];
  videos?: { id: number; url: string }[];
}

export default function AdminArticlesMinimalist() {
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleData | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const { toast } = useToast();
  const api = useApiClient();

  const [formData, setFormData] = useState<any>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    videoUrl: "",
    categoryId: "",
    categoryIds: [] as string[],
    published: false,
    isFeatured: false,
    isBreaking: false,
    authorId: "",
    provinceId: "",
  });

  useEffect(() => {
    fetchArticles();
    fetchAuthors();
  }, [searchTerm, selectedCategory, selectedStatus]);

  const fetchArticles = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (selectedStatus !== "all") params.append("status", selectedStatus);

      const data = await api.get(`/admin/articles?${params.toString()}`);
      setArticles(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los artículos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthors = async () => {
    try {
      const data = await api.get("/admin/authors");
      setAuthors(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los autores",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (article: ArticleData) => {
    setEditingArticle(article);
    setFormData({
      title: article.article.title,
      excerpt: article.article.excerpt,
      content: article.article.content,
      featuredImage: article.article.featuredImage || "",
      videoUrl: article.article.videoUrl || "",
      categoryIds: article.category ? [article.category.id.toString()] : [],
      published: article.article.published,
      isFeatured: article.article.isFeatured,
      isBreaking: article.article.isBreaking,
      authorId: article.article.authorId.toString(),
      provinceId: article.article.provinceId || "",
    });
    setImageFiles([]);
    setVideoFiles([]);
    setShowEditDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este artículo?")) {
      try {
        await api.delete(`/admin/articles/${id}`);
        toast({
          title: "Artículo eliminado",
          description: "El artículo ha sido eliminado exitosamente.",
        });
        fetchArticles();
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el artículo",
          variant: "destructive",
        });
      }
    }
  };

  const togglePublished = async (article: ArticleData) => {
    try {
      await api.put(`/admin/articles/${article.article.id}/publish`, {
        published: !article.article.published,
      });

      toast({
        title: `Artículo ${!article.article.published ? "publicado" : "despublicado"}`,
      });
      fetchArticles(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del artículo",
        variant: "destructive",
      });
    }
  };

  const handleSaveArticle = async () => {
    if (!formData.title || !formData.content) {
      toast({
        title: "Error de validación",
        description: "El título y el contenido son obligatorios.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const articleFormData = new FormData();

    // Append all form data fields dynamically
    Object.keys(formData).forEach((key) => {
      const value = formData[key];
      if (key === "categoryIds" && Array.isArray(value)) {
        value.forEach((id: string) => {
          articleFormData.append("categoryIds[]", id);
        });
      } else if (value !== null && value !== undefined) {
        articleFormData.append(key, value);
      }
    });

    // Append files
    imageFiles.forEach((file) => {
      articleFormData.append("images", file);
    });
    videoFiles.forEach((file) => {
      articleFormData.append("videos", file);
    });

    try {
      let response;
      if (editingArticle) {
        response = await api.put(
          `/admin/articles/${editingArticle.article.id}`,
          articleFormData
        );
      } else {
        response = await api.post("/admin/articles", articleFormData);
      }

      toast({
        title: "Éxito",
        description: `Artículo ${editingArticle ? "actualizado" : "creado"} correctamente.`,
      });

      setShowEditDialog(false);
      setEditingArticle(null);
      fetchArticles(); // Refresh the list
    } catch (error: any) {
      toast({
        title: "Error al guardar",
        description: error.message || "No se pudo guardar el artículo. Intente de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-light">Artículos</h1>
          <Button
            onClick={() => {
              setEditingArticle(null);
              setFormData({
                title: "",
                excerpt: "",
                content: "",
                featuredImage: "",
                videoUrl: "",
                categoryIds: [],
                published: false,
                isFeatured: false,
                isBreaking: false,
                authorId: "",
                provinceId: "",
              });
              setImageFiles([]);
              setVideoFiles([]);
              setShowEditDialog(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo Artículo
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <Input
            placeholder="Buscar artículos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              <SelectItem value="1">Nacional</SelectItem>
              <SelectItem value="2">Internacional</SelectItem>
              <SelectItem value="3">Economía</SelectItem>
              <SelectItem value="4">Deportes</SelectItem>
              <SelectItem value="5">Entretenimiento</SelectItem>
              <SelectItem value="6">Turismo</SelectItem>
              <SelectItem value="7">Tecnología</SelectItem>
              <SelectItem value="8">Cultura</SelectItem>
              <SelectItem value="9">Opinión</SelectItem>
              <SelectItem value="10">Salud</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="published">Publicados</SelectItem>
              <SelectItem value="draft">Borradores</SelectItem>
              <SelectItem value="featured">Destacados</SelectItem>
              <SelectItem value="breaking">Última Hora</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Articles Table */}
        <div className="bg-white border rounded-lg">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Cargando artículos...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No se encontraron artículos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estado</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Autor</TableHead>
                    <TableHead>Vistas</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((item) => (
                    <TableRow key={item.article.id}>
                      <TableCell>
                        <button
                          onClick={() => togglePublished(item)}
                          className={`p-1 rounded ${
                            item.article.published
                              ? "text-green-600 hover:bg-green-100"
                              : "text-gray-400 hover:bg-gray-100"
                          }`}
                        >
                          {item.article.published ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <XCircle className="h-5 w-5" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.article.title}</p>
                          <div className="flex gap-2 mt-1">
                            {item.article.isFeatured && (
                              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                Destacado
                              </span>
                            )}
                            {item.article.isBreaking && (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                Última Hora
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.category?.name || "-"}</TableCell>
                      <TableCell>{item.author?.name || "-"}</TableCell>
                      <TableCell>{item.article.views.toLocaleString()}</TableCell>
                      <TableCell>
                        {format(
                          new Date(item.article.createdAt),
                          "dd MMM yyyy",
                          { locale: es }
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              const previewUrl = `/articulo/${item.article.slug}`;
                              window.open(previewUrl, '_blank');
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(item.article.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Edit Dialog - Minimalist Design */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="text-lg font-medium">
                {editingArticle ? "Editar Artículo" : "Nuevo Artículo"}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Escribe el título del artículo"
                  className="bg-gray-50 border-gray-200 focus:bg-white"
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium mb-1">Resumen</label>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Breve resumen del artículo"
                  rows={2}
                  className="bg-gray-50 border-gray-200 focus:bg-white"
                />
              </div>

              {/* Author and Region */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Autor</label>
                  <Select 
                    value={formData.authorId} 
                    onValueChange={(value) => setFormData({ ...formData, authorId: value })}
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Selecciona un autor" />
                    </SelectTrigger>
                    <SelectContent>
                      {authors.map((author) => (
                        <SelectItem key={author.id} value={author.id.toString()}>
                          {author.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Región</label>
                  <Select 
                    value={formData.provinceId} 
                    onValueChange={(value) => setFormData({ ...formData, provinceId: value })}
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Selecciona región" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Distrito Nacional</SelectItem>
                      <SelectItem value="2">Azua</SelectItem>
                      <SelectItem value="3">Baoruco</SelectItem>
                      <SelectItem value="4">Barahona</SelectItem>
                      <SelectItem value="5">Dajabón</SelectItem>
                      <SelectItem value="6">Duarte</SelectItem>
                      <SelectItem value="7">El Seibo</SelectItem>
                      <SelectItem value="8">Elías Piña</SelectItem>
                      <SelectItem value="9">Espaillat</SelectItem>
                      <SelectItem value="10">Hato Mayor</SelectItem>
                      <SelectItem value="11">Hermanas Mirabal</SelectItem>
                      <SelectItem value="12">Independencia</SelectItem>
                      <SelectItem value="13">La Altagracia</SelectItem>
                      <SelectItem value="14">La Romana</SelectItem>
                      <SelectItem value="15">La Vega</SelectItem>
                      <SelectItem value="16">María Trinidad Sánchez</SelectItem>
                      <SelectItem value="17">Monseñor Nouel</SelectItem>
                      <SelectItem value="18">Monte Cristi</SelectItem>
                      <SelectItem value="19">Monte Plata</SelectItem>
                      <SelectItem value="20">Pedernales</SelectItem>
                      <SelectItem value="21">Peravia</SelectItem>
                      <SelectItem value="22">Puerto Plata</SelectItem>
                      <SelectItem value="23">Samaná</SelectItem>
                      <SelectItem value="24">San Cristóbal</SelectItem>
                      <SelectItem value="25">San José de Ocoa</SelectItem>
                      <SelectItem value="26">San Juan</SelectItem>
                      <SelectItem value="27">San Pedro de Macorís</SelectItem>
                      <SelectItem value="28">Sánchez Ramírez</SelectItem>
                      <SelectItem value="29">Santiago</SelectItem>
                      <SelectItem value="30">Santiago Rodríguez</SelectItem>
                      <SelectItem value="31">Santo Domingo</SelectItem>
                      <SelectItem value="32">Valverde</SelectItem>
                      <SelectItem value="33">Internacional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium mb-1">Categorías</label>
                <MultiSelect
                  options={[
                    { value: "1", label: "Nacional" },
                    { value: "2", label: "Internacional" },
                    { value: "3", label: "Economía" },
                    { value: "4", label: "Deportes" },
                    { value: "5", label: "Entretenimiento" },
                    { value: "6", label: "Turismo" },
                    { value: "7", label: "Tecnología" },
                    { value: "8", label: "Cultura" },
                    { value: "9", label: "Opinión" },
                    { value: "10", label: "Salud" },
                  ]}
                  value={formData.categoryIds}
                  onChange={(values: string[]) =>
                    setFormData({ ...formData, categoryIds: values })
                  }
                  placeholder="Selecciona una o más categorías"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium mb-1">Contenido</label>
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="Escribe el contenido del artículo..."
                />
              </div>

              {/* Media URLs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">URL de Imagen</label>
                  <Input
                    value={formData.featuredImage}
                    onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="bg-gray-50 border-gray-200 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">URL de Video</label>
                  <Input
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                    className="bg-gray-50 border-gray-200 focus:bg-white"
                  />
                </div>
              </div>

              {/* File Uploads */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Subir Imágenes</label>
                  <ImageDropzone
                    images={imageFiles}
                    setImages={setImageFiles}
                    existingImages={[]}
                    onRemoveExisting={() => {}}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Subir Videos</label>
                  <VideoDropzone
                    videos={videoFiles}
                    setVideos={setVideoFiles}
                    existingVideos={[]}
                    onRemoveExisting={() => {}}
                  />
                </div>
              </div>

              {/* Publishing Options */}
              <div className="flex items-center space-x-6 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, isFeatured: checked as boolean })
                    }
                  />
                  <label htmlFor="featured" className="text-sm">
                    Artículo Destacado
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="breaking"
                    checked={formData.isBreaking}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, isBreaking: checked as boolean })
                    }
                  />
                  <label htmlFor="breaking" className="text-sm">
                    Última Hora
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, published: checked as boolean })
                    }
                  />
                  <label htmlFor="published" className="text-sm">
                    Publicar
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (formData.title && formData.content) {
                      const previewData = {
                        title: formData.title,
                        excerpt: formData.excerpt,
                        content: formData.content,
                        featuredImage: formData.featuredImage,
                        videoUrl: formData.videoUrl,
                        categoryIds: formData.categoryIds,
                        published: formData.published,
                        author: { name: "Autor de Prueba" },
                        publishedAt: new Date().toISOString(),
                      };
                      const previewUrl = `/articulo/preview?data=${encodeURIComponent(JSON.stringify(previewData))}`;
                      window.open(previewUrl, '_blank');
                    } else {
                      toast({
                        title: "Error",
                        description: "Por favor completa el título y contenido para previsualizar",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="gap-1"
                >
                  <Eye className="h-4 w-4" />
                  Vista Previa
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEditDialog(false);
                      setEditingArticle(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSaveArticle}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {editingArticle ? "Actualizar" : "Publicar"}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}