import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  Loader2, 
  QrCode,
  Download,
  ExternalLink 
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface TicketWithDetails {
  id: string;
  qr_code: string;
  status: string;
  purchased_at: string;
  checked_in_at: string | null;
  events: {
    id: string;
    title: string;
    event_date: string;
    location: string;
    venue_name: string | null;
    cover_image: string | null;
  };
  price_tiers: {
    name: string;
    price: number;
  };
}

const MyTickets = () => {
  const { user } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState<TicketWithDetails | null>(null);

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["my-tickets", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("tickets")
        .select(`
          id,
          qr_code,
          status,
          purchased_at,
          checked_in_at,
          events(id, title, event_date, location, venue_name, cover_image),
          price_tiers(name, price)
        `)
        .eq("user_id", user.id)
        .order("purchased_at", { ascending: false });

      if (error) throw error;
      return data as unknown as TicketWithDetails[];
    },
    enabled: !!user,
  });

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald text-primary-foreground";
      case "used":
        return "bg-muted text-muted-foreground";
      case "cancelled":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Aktif";
      case "used":
        return "Sudah Digunakan";
      case "cancelled":
        return "Dibatalkan";
      case "refunded":
        return "Refund";
      default:
        return status;
    }
  };

  const upcomingTickets = tickets?.filter(
    (t) => t.status === "active" && new Date(t.events.event_date) > new Date()
  ) || [];

  const pastTickets = tickets?.filter(
    (t) => t.status === "used" || new Date(t.events.event_date) <= new Date()
  ) || [];

  const TicketCard = ({ ticket }: { ticket: TicketWithDetails }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row">
        {/* Event Image */}
        <div className="sm:w-48 h-32 sm:h-auto shrink-0">
          <img
            src={ticket.events.cover_image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop"}
            alt={ticket.events.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Ticket Info */}
        <CardContent className="flex-1 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
            <Badge className={getStatusColor(ticket.status)}>
              {getStatusLabel(ticket.status)}
            </Badge>
            <Badge variant="outline">{ticket.price_tiers.name}</Badge>
          </div>

          <h3 className="font-bold text-lg mb-3 line-clamp-2">
            {ticket.events.title}
          </h3>

          <div className="space-y-2 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(ticket.events.event_date)} • {formatTime(ticket.events.event_date)} WIB</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{ticket.events.venue_name || ticket.events.location}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="coral"
              size="sm"
              onClick={() => setSelectedTicket(ticket)}
              disabled={ticket.status !== "active"}
            >
              <QrCode className="w-4 h-4 mr-2" />
              Lihat QR Code
            </Button>
            <Link to={`/event/${ticket.events.id}`}>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                Detail Event
              </Button>
            </Link>
          </div>
        </CardContent>
      </div>
    </Card>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-16">
      <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Belum Ada Tiket</h3>
      <p className="text-muted-foreground mb-4">{message}</p>
      <Link to="/events">
        <Button variant="coral">Jelajahi Event</Button>
      </Link>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Login Diperlukan</h1>
            <p className="text-muted-foreground mb-4">Silakan login untuk melihat tiket kamu</p>
            <Link to="/login">
              <Button variant="coral">Login</Button>
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

      <main className="flex-1 py-8">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Tiket Saya</h1>
            <p className="text-muted-foreground">
              Kelola semua tiket event yang sudah kamu beli
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs defaultValue="upcoming" className="space-y-6">
              <TabsList>
                <TabsTrigger value="upcoming" className="gap-2">
                  <Ticket className="w-4 h-4" />
                  Akan Datang ({upcomingTickets.length})
                </TabsTrigger>
                <TabsTrigger value="past" className="gap-2">
                  Riwayat ({pastTickets.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-4">
                {upcomingTickets.length === 0 ? (
                  <EmptyState message="Kamu belum punya tiket untuk event yang akan datang" />
                ) : (
                  upcomingTickets.map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-4">
                {pastTickets.length === 0 ? (
                  <EmptyState message="Belum ada riwayat tiket" />
                ) : (
                  pastTickets.map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} />
                  ))
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      {/* QR Code Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>E-Ticket QR Code</DialogTitle>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4">
              <div className="p-6 bg-muted rounded-xl flex items-center justify-center">
                <div className="bg-card p-4 rounded-lg">
                  {/* Simple QR Code Placeholder - In production, use a QR library */}
                  <div className="w-48 h-48 bg-foreground rounded flex items-center justify-center">
                    <div className="text-background text-center p-4">
                      <QrCode className="w-16 h-16 mx-auto mb-2" />
                      <p className="text-xs break-all">{selectedTicket.qr_code}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-2">
                <h3 className="font-semibold">{selectedTicket.events.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedTicket.price_tiers.name} • {formatPrice(selectedTicket.price_tiers.price)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(selectedTicket.events.event_date)}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Unduh
                </Button>
                <Button variant="coral" className="flex-1">
                  Bagikan
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Tunjukkan QR Code ini saat check-in di venue
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default MyTickets;