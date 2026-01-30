import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Loader2,
  Ticket,
  QrCode,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import QRCode from "react-qr-code";

interface TicketData {
  id: string;
  qr_code: string;
  status: string;
  purchased_at: string;
  checked_in_at: string | null;
  events: { title: string; event_date: string } | null;
  price_tiers: { name: string; price: number } | null;
  profiles: { full_name: string } | null;
}

const TicketsManagement = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["admin-tickets"],
    queryFn: async () => {
      const { data: ticketsData, error } = await supabase
        .from("tickets")
        .select(`*, events(title, event_date), price_tiers(name, price)`)
        .order("purchased_at", { ascending: false });

      if (error) throw error;

      // Fetch buyer profiles separately
      const ticketsWithProfiles = await Promise.all(
        (ticketsData || []).map(async (ticket) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", ticket.user_id)
            .maybeSingle();

          return {
            ...ticket,
            profiles: profile,
          };
        })
      );

      return ticketsWithProfiles as TicketData[];
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updateData: { status: string; checked_in_at?: string | null } = { status };
      
      if (status === "used") {
        updateData.checked_in_at = new Date().toISOString();
      } else if (status === "active") {
        updateData.checked_in_at = null;
      }

      const { error } = await supabase
        .from("tickets")
        .update(updateData)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
      toast.success("Status tiket berhasil diperbarui!");
    },
    onError: (error) => {
      toast.error("Gagal memperbarui status: " + error.message);
    },
  });

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      !search ||
      ticket.events?.title.toLowerCase().includes(search.toLowerCase()) ||
      ticket.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      ticket.qr_code.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "used":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">
            <Clock className="w-3 h-3 mr-1" />
            Used
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Calculate stats
  const totalRevenue = tickets.reduce(
    (sum, t) => sum + (t.price_tiers?.price || 0),
    0
  );
  const activeCount = tickets.filter((t) => t.status === "active").length;
  const usedCount = tickets.filter((t) => t.status === "used").length;
  const cancelledCount = tickets.filter((t) => t.status === "cancelled").length;

  return (
    <AdminLayout
      title="Manajemen Tiket"
      description="Kelola semua tiket yang terjual"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{tickets.length}</p>
            <p className="text-sm text-muted-foreground">Total Tiket</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{usedCount}</p>
            <p className="text-sm text-muted-foreground">Used</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{cancelledCount}</p>
            <p className="text-sm text-muted-foreground">Cancelled</p>
          </CardContent>
        </Card>
        <Card className="col-span-2 lg:col-span-1">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">
              Rp {totalRevenue.toLocaleString("id-ID")}
            </p>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari event, pembeli, atau QR code..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="used">Used</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Tidak ada tiket ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Pembeli</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dibeli</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[200px]">
                            {ticket.events?.title || "Unknown Event"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ticket.events?.event_date
                              ? formatDate(ticket.events.event_date)
                              : "-"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {ticket.profiles?.full_name || "Unknown"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {ticket.price_tiers?.name || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          Rp{" "}
                          {(ticket.price_tiers?.price || 0).toLocaleString(
                            "id-ID"
                          )}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(ticket.purchased_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            <QrCode className="w-4 h-4" />
                          </Button>
                          <Select
                            value={ticket.status}
                            onValueChange={(value) =>
                              updateStatusMutation.mutate({
                                id: ticket.id,
                                status: value,
                              })
                            }
                          >
                            <SelectTrigger className="w-28 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="used">Used</SelectItem>
                              <SelectItem value="cancelled">
                                Cancelled
                              </SelectItem>
                            </SelectContent>
                          </Select>
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

      {/* QR Code Dialog */}
      <Dialog
        open={!!selectedTicket}
        onOpenChange={() => setSelectedTicket(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>QR Code Tiket</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="text-center space-y-4">
              <div className="bg-white p-4 rounded-lg inline-block">
                <QRCode value={selectedTicket.qr_code} size={200} />
              </div>
              <div className="text-left space-y-2">
                <p className="font-medium">{selectedTicket.events?.title}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedTicket.profiles?.full_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedTicket.price_tiers?.name} • Rp{" "}
                  {selectedTicket.price_tiers?.price?.toLocaleString("id-ID")}
                </p>
                <div className="flex items-center gap-2 pt-2">
                  {getStatusBadge(selectedTicket.status)}
                  {selectedTicket.checked_in_at && (
                    <span className="text-xs text-muted-foreground">
                      Check-in: {formatDate(selectedTicket.checked_in_at)}
                    </span>
                  )}
                </div>
              </div>
              <code className="text-xs bg-muted px-2 py-1 rounded block overflow-hidden text-ellipsis">
                {selectedTicket.qr_code}
              </code>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default TicketsManagement;
