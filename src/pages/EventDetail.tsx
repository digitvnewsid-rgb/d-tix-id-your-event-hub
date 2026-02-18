import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Share2,
  Heart,
  Ticket,
  Loader2,
  ChevronLeft,
  Minus,
  Plus,
  CheckCircle,
  AlertCircle,
  BadgeCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PriceTier {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quantity_total: number;
  quantity_sold: number;
}

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedTier, setSelectedTier] = useState<PriceTier | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Fetch event details
  const { data: event, isLoading, error } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          categories(id, name, slug, icon)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Event not found");

      // Fetch organizer profile separately
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, bio")
        .eq("id", data.organizer_id)
        .maybeSingle();

      return { ...data, profiles: profileData };
    },
    enabled: !!id,
  });

  // Fetch price tiers
  const { data: priceTiers } = useQuery({
    queryKey: ["price-tiers", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("price_tiers")
        .select("*")
        .eq("event_id", id)
        .order("price", { ascending: true });

      if (error) throw error;
      return data as PriceTier[];
    },
    enabled: !!id,
  });

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async () => {
      if (!user || !selectedTier || !event) {
        throw new Error("Missing required data");
      }

      const tickets = [];
      for (let i = 0; i < quantity; i++) {
        const qrCode = `DTIX-${event.id.slice(0, 8)}-${selectedTier.id.slice(0, 8)}-${Date.now()}-${i}`;
        tickets.push({
          user_id: user.id,
          event_id: event.id,
          price_tier_id: selectedTier.id,
          qr_code: qrCode,
          status: "active",
        });
      }

      const { data, error } = await supabase
        .from("tickets")
        .insert(tickets)
        .select();

      if (error) throw error;

      // Update quantity sold
      await supabase
        .from("price_tiers")
        .update({ quantity_sold: selectedTier.quantity_sold + quantity })
        .eq("id", selectedTier.id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-tiers", id] });
      setShowCheckoutDialog(false);
      toast({
        title: "Pembelian Berhasil! 🎉",
        description: "Tiket kamu sudah tersedia di halaman Tiket Saya",
      });
      navigate("/my-tickets");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Pembelian Gagal",
        description: error.message || "Terjadi kesalahan, silakan coba lagi",
      });
    },
  });

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Login Diperlukan",
        description: "Silakan login terlebih dahulu untuk membeli tiket",
      });
      navigate("/login", { state: { from: `/event/${id}` } });
      return;
    }

    if (!selectedTier) {
      toast({
        variant: "destructive",
        title: "Pilih Tiket",
        description: "Silakan pilih jenis tiket terlebih dahulu",
      });
      return;
    }

    setShowCheckoutDialog(true);
  };

  const confirmPurchase = () => {
    setIsPurchasing(true);
    purchaseMutation.mutate();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAvailableTickets = (tier: PriceTier) => {
    return tier.quantity_total - tier.quantity_sold;
  };

  // Sample event for demo
  const sampleEvent = {
    id: id || "sample",
    title: "Jakarta Music Festival 2025",
    slug: "jakarta-music-festival-2025",
    description: `
      <h3>Tentang Event</h3>
      <p>Jakarta Music Festival 2025 adalah festival musik terbesar di Indonesia yang menampilkan berbagai artis lokal dan internasional. Acara ini akan berlangsung selama satu hari penuh dengan berbagai genre musik dari pop, rock, hingga EDM.</p>
      
      <h3>Line Up</h3>
      <ul>
        <li>Tulus</li>
        <li>Pamungkas</li>
        <li>Hindia</li>
        <li>NIKI</li>
        <li>Rich Brian</li>
        <li>dan masih banyak lagi!</li>
      </ul>
      
      <h3>Fasilitas</h3>
      <ul>
        <li>Free parking</li>
        <li>Food court area</li>
        <li>Merchandise booth</li>
        <li>Photo booth</li>
        <li>First aid station</li>
      </ul>
    `,
    event_date: "2025-03-15T18:00:00",
    end_date: "2025-03-15T23:00:00",
    location: "Gelora Bung Karno, Jakarta",
    venue_name: "Stadion Utama GBK",
    city: "Jakarta",
    cover_image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=600&fit=crop",
    is_published: true,
    is_featured: true,
    categories: { id: "1", name: "Festival", slug: "festival", icon: "music" },
    profiles: { 
      id: "org1", 
      full_name: "Live Nation Indonesia", 
      avatar_url: null,
      bio: "Promotor event musik terbesar di Indonesia"
    },
  };

  const samplePriceTiers: PriceTier[] = [
    {
      id: "tier1",
      name: "Regular",
      description: "Akses area regular dengan standing position",
      price: 350000,
      quantity_total: 5000,
      quantity_sold: 3200,
    },
    {
      id: "tier2",
      name: "VIP",
      description: "Akses area VIP dengan viewing platform, free drink, dan merchandise",
      price: 750000,
      quantity_total: 1000,
      quantity_sold: 650,
    },
    {
      id: "tier3",
      name: "VVIP",
      description: "Akses area VVIP dengan front row, meet & greet, exclusive lounge, dan full package merchandise",
      price: 1500000,
      quantity_total: 200,
      quantity_sold: 180,
    },
  ];

  const displayEvent = event || sampleEvent;
  const displayTiers = priceTiers && priceTiers.length > 0 ? priceTiers : samplePriceTiers;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !sampleEvent) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Event Tidak Ditemukan</h1>
            <p className="text-muted-foreground mb-4">Event yang kamu cari tidak tersedia</p>
            <Link to="/events">
              <Button variant="coral">Jelajahi Event Lain</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero Image */}
        <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
          <img
            src={displayEvent.cover_image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=600&fit=crop"}
            alt={displayEvent.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          
          {/* Back Button */}
          <div className="absolute top-4 left-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Kembali
            </Button>
          </div>

          {/* Share & Wishlist */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="secondary" size="icon">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="secondary" size="icon">
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="container -mt-20 relative z-10 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {displayEvent.categories?.name || "Event"}
                    </Badge>
                    {displayEvent.is_featured && (
                      <Badge className="bg-accent text-accent-foreground">
                        ⭐ Featured
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    {displayEvent.title}
                  </h1>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{formatDate(displayEvent.event_date)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(displayEvent.event_date)} WIB
                          {displayEvent.end_date && ` - ${formatTime(displayEvent.end_date)} WIB`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{displayEvent.venue_name || displayEvent.location}</p>
                        <p className="text-sm text-muted-foreground">{displayEvent.city}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Tentang Event</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-sm max-w-none text-foreground"
                    dangerouslySetInnerHTML={{ 
                      __html: DOMPurify.sanitize(displayEvent.description || "<p>Deskripsi event akan segera tersedia.</p>", {
                        ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'strong', 'em', 'br', 'a', 'blockquote', 'span'],
                        ALLOWED_ATTR: ['href', 'target', 'rel']
                      })
                    }}
                  />
                </CardContent>
              </Card>

              {/* Organizer */}
              <Card>
                <CardHeader>
                  <CardTitle>Penyelenggara</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                      {displayEvent.profiles?.avatar_url ? (
                        <img
                          src={displayEvent.profiles.avatar_url}
                          alt={displayEvent.profiles.full_name || "Organizer"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{displayEvent.profiles?.full_name || "Organizer"}</h3>
                        <BadgeCheck className="w-4 h-4 text-sky" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {displayEvent.profiles?.bio || "Event Organizer"}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Lihat Profil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Ticket Selection */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Ticket className="w-5 h-5 text-primary" />
                      Pilih Tiket
                    </CardTitle>
                    <CardDescription>
                      Pilih jenis tiket yang kamu inginkan
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {displayTiers.map((tier) => {
                      const available = getAvailableTickets(tier);
                      const isSelected = selectedTier?.id === tier.id;
                      const isSoldOut = available <= 0;

                      return (
                        <div
                          key={tier.id}
                          onClick={() => !isSoldOut && setSelectedTier(tier)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : isSoldOut
                              ? "border-muted bg-muted/50 cursor-not-allowed opacity-60"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold">{tier.name}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {tier.description}
                              </p>
                            </div>
                            {isSelected && (
                              <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                            )}
                          </div>
                          <div className="flex justify-between items-center mt-3">
                            <span className="text-lg font-bold text-primary">
                              {formatPrice(tier.price)}
                            </span>
                            <span className={`text-xs ${isSoldOut ? "text-destructive" : "text-muted-foreground"}`}>
                              {isSoldOut ? "Sold Out" : `${available} tersisa`}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {selectedTier && (
                      <>
                        <Separator />
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Jumlah Tiket</span>
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={quantity <= 1}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-8 text-center font-semibold">{quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setQuantity(Math.min(5, quantity + 1))}
                                disabled={quantity >= 5 || quantity >= getAvailableTickets(selectedTier)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="p-4 rounded-lg bg-muted">
                            <div className="flex justify-between text-sm mb-2">
                              <span>{selectedTier.name} x{quantity}</span>
                              <span>{formatPrice(selectedTier.price * quantity)}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-bold">
                              <span>Total</span>
                              <span className="text-primary">{formatPrice(selectedTier.price * quantity)}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <Button
                      variant="coral"
                      size="lg"
                      className="w-full"
                      onClick={handlePurchase}
                      disabled={!selectedTier}
                    >
                      {selectedTier ? "Beli Tiket" : "Pilih Tiket Dulu"}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Dengan membeli tiket, kamu menyetujui{" "}
                      <Link to="/terms" className="text-primary hover:underline">
                        Syarat & Ketentuan
                      </Link>
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Checkout Dialog */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Pembelian</DialogTitle>
            <DialogDescription>
              Pastikan detail pembelian sudah benar
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-muted">
              <h4 className="font-semibold mb-2">{displayEvent.title}</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{formatDate(displayEvent.event_date)}</p>
                <p>{displayEvent.location}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Tiket</span>
                <span>{selectedTier?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Jumlah</span>
                <span>{quantity} tiket</span>
              </div>
              <div className="flex justify-between">
                <span>Harga per tiket</span>
                <span>{selectedTier && formatPrice(selectedTier.price)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total Pembayaran</span>
                <span className="text-primary">
                  {selectedTier && formatPrice(selectedTier.price * quantity)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCheckoutDialog(false)}>
              Batal
            </Button>
            <Button
              variant="coral"
              onClick={confirmPurchase}
              disabled={isPurchasing}
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Konfirmasi & Bayar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default EventDetail;