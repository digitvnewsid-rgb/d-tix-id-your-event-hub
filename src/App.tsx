import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import MyTickets from "./pages/MyTickets";
import Profile from "./pages/Profile";
import AdminBanners from "./pages/AdminBanners";
import NotFound from "./pages/NotFound";

// Admin pages
import Overview from "./pages/admin/Overview";
import UsersManagement from "./pages/admin/UsersManagement";
import CategoriesManagement from "./pages/admin/CategoriesManagement";
import EventsManagement from "./pages/admin/EventsManagement";
import CreateEvent from "./pages/admin/CreateEvent";
import TicketsManagement from "./pages/admin/TicketsManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/events" element={<Events />} />
            <Route path="/event/:id" element={<EventDetail />} />
            <Route
              path="/my-tickets"
              element={
                <ProtectedRoute>
                  <MyTickets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Overview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <UsersManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute>
                  <CategoriesManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events"
              element={
                <ProtectedRoute>
                  <EventsManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events/create"
              element={
                <ProtectedRoute>
                  <CreateEvent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tickets"
              element={
                <ProtectedRoute>
                  <TicketsManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/banners"
              element={
                <ProtectedRoute>
                  <AdminBanners />
                </ProtectedRoute>
              }
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;