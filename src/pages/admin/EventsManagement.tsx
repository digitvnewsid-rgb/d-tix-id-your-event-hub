import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Search,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Trash2,
  Loader2,
  Calendar,
  ExternalLink,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  slug: string;
  cover_image: string | null;
  event_date: string;
  location: string;
  city: string | null;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  categories: { name: string } | null;
  profiles: { full_name: string } | null;
}

const EventsManagement = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data: eventsData, error } = await supabase
        .from("events")
        .select(`*, categories(name)`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch organizer profiles separately
      const eventsWithProfiles = await Promise.all(
        (eventsData || []).map(async (event) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", event.organizer_id)
            .maybeSingle();

          return {
            ...event,
            profiles: profile,
          };
        })
      );

      return eventsWithProfiles as Event[];
    },
  });

  // Toggle publish mutation
  const togglePublishMutation = useMutation({
    mutationFn: async ({
      id,
      is_published,
    }: {
      id: string;
      is_published: boolean;
    }) => {
      const { error } = await supabase
        .from("events")
        .update({ is_published })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast.success("Status event berhasil diperbarui!");
    },
    onError: (error) => {
      toast.error("Gagal memperbarui status: " + error.message);
    },
  });

  // Toggle featured mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({
      id,
      is_featured,
    }: {
      id: string;
      is_featured: boolean;
    }) => {
      const { error } = await supabase
        .from("events")
        .update({ is_featured })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast.success("Status featured berhasil diperbarui!");
    },
    onError: (error) => {
      toast.error("Gagal memperbarui featured: " + error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast.success("Event berhasil dihapus!");
    },
    onError: (error) => {
      toast.error("Gagal menghapus event: " + error.message);
    },
  });

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      !search ||
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.city?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && event.is_published) ||
      (statusFilter === "draft" && !event.is_published) ||
      (statusFilter === "featured" && event.is_featured);

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <AdminLayout
      title="Manajemen Event"
      description="Kelola semua event di platform"
    >
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari judul atau kota..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{events.length}</p>
            <p className="text-sm text-muted-foreground">Total Event</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {events.filter((e) => e.is_published).length}
            </p>
            <p className="text-sm text-muted-foreground">Published</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {events.filter((e) => !e.is_published).length}
            </p>
            <p className="text-sm text-muted-foreground">Draft</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">
              {events.filter((e) => e.is_featured).length}
            </p>
            <p className="text-sm text-muted-foreground">Featured</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Tidak ada event ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Organizer</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {event.cover_image ? (
                            <img
                              src={event.cover_image}
                              alt={event.title}
                              className="w-16 h-12 rounded object-cover"
                            />
                          ) : (
                            <div className="w-16 h-12 rounded bg-muted flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[200px]">
                              {event.title}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.city || event.location}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {event.categories?.name || "Uncategorized"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {event.profiles?.full_name || "Unknown"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(event.event_date)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {event.is_published ? (
                            <Badge className="bg-green-500/10 text-green-600 border-green-200">
                              Published
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Draft</Badge>
                          )}
                          {event.is_featured && (
                            <Badge className="bg-purple-500/10 text-purple-600 border-purple-200">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/event/${event.id}`} target="_blank">
                            <Button size="sm" variant="ghost">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              togglePublishMutation.mutate({
                                id: event.id,
                                is_published: !event.is_published,
                              })
                            }
                            disabled={togglePublishMutation.isPending}
                          >
                            {event.is_published ? (
                              <EyeOff className="w-4 h-4 text-yellow-500" />
                            ) : (
                              <Eye className="w-4 h-4 text-green-500" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              toggleFeaturedMutation.mutate({
                                id: event.id,
                                is_featured: !event.is_featured,
                              })
                            }
                            disabled={toggleFeaturedMutation.isPending}
                          >
                            {event.is_featured ? (
                              <StarOff className="w-4 h-4 text-yellow-500" />
                            ) : (
                              <Star className="w-4 h-4 text-muted-foreground" />
                            )}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Event?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tindakan ini tidak dapat dibatalkan. Event "{event.title}" beserta semua tiket terkait akan dihapus permanen.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(event.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default EventsManagement;
