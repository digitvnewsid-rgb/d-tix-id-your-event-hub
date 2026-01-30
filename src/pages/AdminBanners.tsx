import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Image, GripVertical, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PromoBanner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  position: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

interface BannerFormData {
  title: string;
  subtitle: string;
  link_url: string;
  position: "top" | "middle";
  is_active: boolean;
  display_order: number;
}

const AdminBanners = () => {
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<PromoBanner | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<BannerFormData>({
    title: "",
    subtitle: "",
    link_url: "",
    position: "top",
    is_active: true,
    display_order: 0,
  });

  const isAdmin = roles.some((r) => r.role === "organizer" || r.role === "creator");

  // Fetch all banners (including inactive for admin)
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promo_banners")
        .select("*")
        .order("position")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as PromoBanner[];
    },
    enabled: isAdmin,
  });

  // Upload image mutation
  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("banners")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("banners")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  // Create banner mutation
  const createMutation = useMutation({
    mutationFn: async (data: { formData: BannerFormData; imageFile: File }) => {
      const imageUrl = await uploadImage(data.imageFile);
      
      const { error } = await supabase.from("promo_banners").insert({
        title: data.formData.title,
        subtitle: data.formData.subtitle || null,
        image_url: imageUrl,
        link_url: data.formData.link_url || null,
        position: data.formData.position,
        is_active: data.formData.is_active,
        display_order: data.formData.display_order,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["promo-banners"] });
      toast.success("Banner berhasil ditambahkan!");
      resetForm();
    },
    onError: (error) => {
      toast.error("Gagal menambahkan banner: " + error.message);
    },
  });

  // Update banner mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; formData: BannerFormData; imageFile?: File }) => {
      let imageUrl = editingBanner?.image_url;

      if (data.imageFile) {
        imageUrl = await uploadImage(data.imageFile);
      }

      const { error } = await supabase
        .from("promo_banners")
        .update({
          title: data.formData.title,
          subtitle: data.formData.subtitle || null,
          image_url: imageUrl,
          link_url: data.formData.link_url || null,
          position: data.formData.position,
          is_active: data.formData.is_active,
          display_order: data.formData.display_order,
        })
        .eq("id", data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["promo-banners"] });
      toast.success("Banner berhasil diperbarui!");
      resetForm();
    },
    onError: (error) => {
      toast.error("Gagal memperbarui banner: " + error.message);
    },
  });

  // Delete banner mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("promo_banners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["promo-banners"] });
      toast.success("Banner berhasil dihapus!");
    },
    onError: (error) => {
      toast.error("Gagal menghapus banner: " + error.message);
    },
  });

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("promo_banners")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["promo-banners"] });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      link_url: "",
      position: "top",
      is_active: true,
      display_order: 0,
    });
    setSelectedImage(null);
    setPreviewUrl(null);
    setEditingBanner(null);
    setIsDialogOpen(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      if (editingBanner) {
        await updateMutation.mutateAsync({
          id: editingBanner.id,
          formData,
          imageFile: selectedImage || undefined,
        });
      } else {
        if (!selectedImage) {
          toast.error("Silakan pilih gambar banner");
          return;
        }
        await createMutation.mutateAsync({ formData, imageFile: selectedImage });
      }
    } finally {
      setUploading(false);
    }
  };

  const openEditDialog = (banner: PromoBanner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      link_url: banner.link_url || "",
      position: banner.position as "top" | "middle",
      is_active: banner.is_active,
      display_order: banner.display_order,
    });
    setPreviewUrl(banner.image_url);
    setIsDialogOpen(true);
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Akses Ditolak</h1>
            <p className="text-muted-foreground">
              Anda tidak memiliki izin untuk mengakses halaman ini.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const topBanners = banners.filter((b) => b.position === "top");
  const middleBanners = banners.filter((b) => b.position === "middle");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Kelola Banner Promosi</h1>
            <p className="text-muted-foreground">
              Upload dan atur banner promosi untuk homepage
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Banner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingBanner ? "Edit Banner" : "Tambah Banner Baru"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Judul Banner</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Promo Akhir Tahun"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="subtitle">Subtitle (Opsional)</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) =>
                      setFormData({ ...formData, subtitle: e.target.value })
                    }
                    placeholder="Diskon hingga 50%"
                  />
                </div>

                <div>
                  <Label htmlFor="image">Gambar Banner</Label>
                  <div className="mt-2">
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                    )}
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      required={!editingBanner}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Ukuran rekomendasi: 1200x280px
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="link_url">Link URL (Opsional)</Label>
                  <Input
                    id="link_url"
                    type="url"
                    value={formData.link_url}
                    onChange={(e) =>
                      setFormData({ ...formData, link_url: e.target.value })
                    }
                    placeholder="https://example.com/promo"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="position">Posisi</Label>
                    <Select
                      value={formData.position}
                      onValueChange={(value: "top" | "middle") =>
                        setFormData({ ...formData, position: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">Atas (Di bawah Hero)</SelectItem>
                        <SelectItem value="middle">
                          Tengah (Di atas Creator)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="display_order">Urutan</Label>
                    <Input
                      id="display_order"
                      type="number"
                      min={0}
                      value={formData.display_order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          display_order: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={uploading || createMutation.isPending || updateMutation.isPending}
                >
                  {uploading ? "Mengupload..." : editingBanner ? "Simpan Perubahan" : "Tambah Banner"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Banners */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Banner Atas (Di bawah Hero)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topBanners.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Belum ada banner. Klik "Tambah Banner" untuk membuat.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {topBanners.map((banner) => (
                      <BannerItem
                        key={banner.id}
                        banner={banner}
                        onEdit={openEditDialog}
                        onDelete={(id) => deleteMutation.mutate(id)}
                        onToggleActive={(id, is_active) =>
                          toggleActiveMutation.mutate({ id, is_active })
                        }
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Middle Banners */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Banner Tengah (Di atas Creator)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {middleBanners.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Belum ada banner. Klik "Tambah Banner" untuk membuat.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {middleBanners.map((banner) => (
                      <BannerItem
                        key={banner.id}
                        banner={banner}
                        onEdit={openEditDialog}
                        onDelete={(id) => deleteMutation.mutate(id)}
                        onToggleActive={(id, is_active) =>
                          toggleActiveMutation.mutate({ id, is_active })
                        }
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

// Banner Item Component
const BannerItem = ({
  banner,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  banner: PromoBanner;
  onEdit: (banner: PromoBanner) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, is_active: boolean) => void;
}) => {
  return (
    <div
      className={`flex items-center gap-4 p-3 rounded-lg border ${
        banner.is_active ? "bg-card" : "bg-muted/50 opacity-60"
      }`}
    >
      <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
      <img
        src={banner.image_url}
        alt={banner.title}
        className="w-32 h-16 object-cover rounded"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{banner.title}</h4>
        {banner.subtitle && (
          <p className="text-sm text-muted-foreground truncate">{banner.subtitle}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Urutan: {banner.display_order}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleActive(banner.id, !banner.is_active)}
        >
          {banner.is_active ? (
            <Eye className="w-4 h-4 text-green-500" />
          ) : (
            <EyeOff className="w-4 h-4 text-muted-foreground" />
          )}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onEdit(banner)}>
          <Edit className="w-4 h-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Banner?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini tidak dapat dibatalkan. Banner akan dihapus permanen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(banner.id)}>
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AdminBanners;
