import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  CalendarIcon,
  MapPin,
  ImageIcon,
  Ticket,
  Plus,
  Trash2,
  Loader2,
  Save,
  ArrowLeft,
} from "lucide-react";

const priceTierSchema = z.object({
  name: z.string().min(1, "Nama tier harus diisi"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Harga tidak boleh negatif"),
  quantity_total: z.coerce.number().min(1, "Kuota minimal 1"),
});

const eventFormSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter").max(200, "Judul maksimal 200 karakter"),
  slug: z.string().min(3, "Slug minimal 3 karakter").max(200, "Slug maksimal 200 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  category_id: z.string().min(1, "Kategori harus dipilih"),
  event_date: z.string().min(1, "Tanggal event harus diisi"),
  end_date: z.string().optional(),
  location: z.string().min(3, "Lokasi minimal 3 karakter"),
  venue_name: z.string().optional(),
  city: z.string().min(2, "Kota harus diisi"),
  cover_image: z.string().url("URL gambar tidak valid").optional().or(z.literal("")),
  is_published: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  price_tiers: z.array(priceTierSchema).min(1, "Minimal satu tier harga"),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories
  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      category_id: "",
      event_date: "",
      end_date: "",
      location: "",
      venue_name: "",
      city: "",
      cover_image: "",
      is_published: false,
      is_featured: false,
      price_tiers: [
        { name: "Regular", description: "Tiket regular", price: 0, quantity_total: 100 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "price_tiers",
  });

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (value: string) => {
    form.setValue("title", value);
    const currentSlug = form.getValues("slug");
    if (!currentSlug || currentSlug === generateSlug(form.getValues("title").slice(0, -1))) {
      form.setValue("slug", generateSlug(value));
    }
  };

  const createEventMutation = useMutation({
    mutationFn: async (values: EventFormValues) => {
      if (!user) throw new Error("User not authenticated");

      // Create event
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .insert({
          title: values.title,
          slug: values.slug,
          description: values.description,
          category_id: values.category_id,
          event_date: values.event_date,
          end_date: values.end_date || null,
          location: values.location,
          venue_name: values.venue_name || null,
          city: values.city,
          cover_image: values.cover_image || null,
          is_published: values.is_published,
          is_featured: values.is_featured,
          organizer_id: user.id,
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Create price tiers
      const priceTiersToInsert = values.price_tiers.map((tier) => ({
        event_id: eventData.id,
        name: tier.name,
        description: tier.description || null,
        price: tier.price,
        quantity_total: tier.quantity_total,
        quantity_sold: 0,
      }));

      const { error: tiersError } = await supabase
        .from("price_tiers")
        .insert(priceTiersToInsert);

      if (tiersError) throw tiersError;

      return eventData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Event Berhasil Dibuat! 🎉",
        description: `Event "${data.title}" telah ditambahkan`,
      });
      navigate("/admin/events");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Gagal Membuat Event",
        description: error.message || "Terjadi kesalahan, silakan coba lagi",
      });
    },
  });

  const onSubmit = async (values: EventFormValues) => {
    setIsSubmitting(true);
    try {
      await createEventMutation.mutateAsync(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Buat Event Baru" description="Isi detail event yang akan kamu selenggarakan">
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/events")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <span className="text-muted-foreground">Kembali ke daftar event</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informasi Dasar</CardTitle>
                    <CardDescription>Detail utama tentang event kamu</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Judul Event *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Contoh: Jakarta Music Festival 2026"
                              {...field}
                              onChange={(e) => handleTitleChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug URL *</FormLabel>
                          <FormControl>
                            <Input placeholder="jakarta-music-festival-2026" {...field} />
                          </FormControl>
                          <FormDescription>
                            URL: /event/{field.value || "slug-event"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kategori *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih kategori" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deskripsi *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Jelaskan detail event kamu, termasuk line-up, fasilitas, dll..."
                              className="min-h-[150px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Gunakan HTML untuk formatting (h3, ul, li, p)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Date & Location */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5" />
                      Waktu & Lokasi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="event_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tanggal & Waktu Mulai *</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="end_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tanggal & Waktu Selesai</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <FormField
                      control={form.control}
                      name="venue_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Venue</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: Stadion Utama GBK" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alamat Lengkap *</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: Jl. Pintu Satu Senayan, Jakarta" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kota *</FormLabel>
                          <FormControl>
                            <Input placeholder="Jakarta" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Price Tiers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Ticket className="w-5 h-5" />
                      Tier Harga Tiket
                    </CardTitle>
                    <CardDescription>Tambahkan berbagai jenis tiket dengan harga berbeda</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Tier {index + 1}</h4>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`price_tiers.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nama Tier *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Regular / VIP / VVIP" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`price_tiers.${index}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Harga (IDR) *</FormLabel>
                                <FormControl>
                                  <Input type="number" min="0" placeholder="350000" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`price_tiers.${index}.quantity_total`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Kuota Tiket *</FormLabel>
                                <FormControl>
                                  <Input type="number" min="1" placeholder="100" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`price_tiers.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Deskripsi</FormLabel>
                                <FormControl>
                                  <Input placeholder="Akses area regular..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        append({ name: "", description: "", price: 0, quantity_total: 100 })
                      }
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Tier Harga
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Cover Image */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Cover Image
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="cover_image"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
                          </FormControl>
                          <FormDescription>URL gambar cover event (rasio 4:3)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("cover_image") && (
                      <div className="mt-4 rounded-lg overflow-hidden border aspect-[4/3]">
                        <img
                          src={form.watch("cover_image")}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Publishing Options */}
                <Card>
                  <CardHeader>
                    <CardTitle>Opsi Publikasi</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="is_published"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Publikasikan</FormLabel>
                            <FormDescription>
                              Event akan terlihat oleh publik
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="is_featured"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Featured</FormLabel>
                            <FormDescription>
                              Tampilkan di halaman utama
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting || loadingCategories}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Simpan Event
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
};

export default CreateEvent;
