import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Shield, UserCheck, UserX, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface UserWithRoles {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  created_at: string;
  roles: { role: "buyer" | "creator" | "organizer" }[];
}

const UsersManagement = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch roles for each user
      const usersWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", profile.id);

          return {
            ...profile,
            roles: roles || [],
          };
        })
      );

      return usersWithRoles as UserWithRoles[];
    },
  });

  // Add role mutation
  const addRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: "buyer" | "creator" | "organizer";
    }) => {
      const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        role,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Role berhasil ditambahkan!");
    },
    onError: (error) => {
      toast.error("Gagal menambahkan role: " + error.message);
    },
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: "buyer" | "creator" | "organizer";
    }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Role berhasil dihapus!");
    },
    onError: (error) => {
      toast.error("Gagal menghapus role: " + error.message);
    },
  });

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !search ||
      user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.phone?.includes(search);

    const matchesRole =
      roleFilter === "all" ||
      user.roles.some((r) => r.role === roleFilter);

    return matchesSearch && matchesRole;
  });

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "organizer":
        return "bg-purple-500/10 text-purple-600 border-purple-200";
      case "creator":
        return "bg-blue-500/10 text-blue-600 border-blue-200";
      case "buyer":
        return "bg-green-500/10 text-green-600 border-green-200";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const hasRole = (user: UserWithRoles, role: string) => {
    return user.roles.some((r) => r.role === role);
  };

  return (
    <AdminLayout
      title="Manajemen Pengguna"
      description="Kelola pengguna dan role akses"
    >
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau telepon..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Role</SelectItem>
                <SelectItem value="buyer">Buyer</SelectItem>
                <SelectItem value="creator">Creator</SelectItem>
                <SelectItem value="organizer">Organizer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Tidak ada pengguna ditemukan
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pengguna</TableHead>
                    <TableHead>Telepon</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Bergabung</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(user.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {user.full_name || "Unknown"}
                            </p>
                            {user.bio && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {user.bio}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {user.phone || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((r) => (
                            <Badge
                              key={r.role}
                              variant="outline"
                              className={getRoleBadgeColor(r.role)}
                            >
                              {r.role}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground text-sm">
                          {formatDate(user.created_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {!hasRole(user, "organizer") && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                addRoleMutation.mutate({
                                  userId: user.id,
                                  role: "organizer",
                                })
                              }
                              disabled={addRoleMutation.isPending}
                            >
                              <Shield className="w-4 h-4 mr-1" />
                              Jadikan Admin
                            </Button>
                          )}
                          {!hasRole(user, "creator") && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                addRoleMutation.mutate({
                                  userId: user.id,
                                  role: "creator",
                                })
                              }
                              disabled={addRoleMutation.isPending}
                            >
                              <UserCheck className="w-4 h-4 mr-1" />
                              Jadikan Creator
                            </Button>
                          )}
                          {hasRole(user, "organizer") && user.roles.length > 1 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() =>
                                removeRoleMutation.mutate({
                                  userId: user.id,
                                  role: "organizer",
                                })
                              }
                              disabled={removeRoleMutation.isPending}
                            >
                              <UserX className="w-4 h-4 mr-1" />
                              Hapus Admin
                            </Button>
                          )}
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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">
              {users.filter((u) => hasRole(u, "buyer")).length}
            </p>
            <p className="text-sm text-muted-foreground">Buyers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">
              {users.filter((u) => hasRole(u, "creator")).length}
            </p>
            <p className="text-sm text-muted-foreground">Creators</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">
              {users.filter((u) => hasRole(u, "organizer")).length}
            </p>
            <p className="text-sm text-muted-foreground">Organizers</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default UsersManagement;
