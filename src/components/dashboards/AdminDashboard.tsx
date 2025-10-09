import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Users, Store, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const AdminDashboard = ({ user }: { user: User }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, merchants: 0, listings: 0, requests: 0 });
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allListings, setAllListings] = useState<any[]>([]);
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [listingsPage, setListingsPage] = useState(1);
  const [requestsPage, setRequestsPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    const [usersData, merchantsData, listingsData, requestsData] = await Promise.all([
      supabase.from("user_roles").select("*").eq("role", "user"),
      supabase.from("user_roles").select("*").eq("role", "merchant"),
      supabase.from("food_listings").select("*"),
      supabase.from("food_requests").select("*"),
    ]);

    setStats({
      users: usersData.data?.length || 0,
      merchants: merchantsData.data?.length || 0,
      listings: listingsData.data?.length || 0,
      requests: requestsData.data?.length || 0,
    });

    if (listingsData.data) setAllListings(listingsData.data);
    if (requestsData.data) setAllRequests(requestsData.data);

    const { data: profiles } = await supabase.from("profiles").select("*");
    if (profiles) setAllUsers(profiles);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <nav className="bg-card shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">ShareABite - Admin Panel</h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard Overview</h2>
          <p className="text-muted-foreground">Monitor platform activity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Merchants</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.merchants}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Food Listings</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.listings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.requests}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Food Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allListings
                  .slice((listingsPage - 1) * itemsPerPage, listingsPage * itemsPerPage)
                  .map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>{listing.title}</TableCell>
                    <TableCell>{listing.category}</TableCell>
                    <TableCell>{listing.city}</TableCell>
                    <TableCell>{listing.available_quantity}</TableCell>
                    <TableCell className="capitalize">{listing.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {allListings.length > itemsPerPage && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setListingsPage(p => Math.max(1, p - 1))}
                        className={listingsPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.ceil(allListings.length / itemsPerPage) }, (_, i) => (
                      <PaginationItem key={i + 1}>
                        <PaginationLink
                          onClick={() => setListingsPage(i + 1)}
                          isActive={listingsPage === i + 1}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setListingsPage(p => Math.min(Math.ceil(allListings.length / itemsPerPage), p + 1))}
                        className={listingsPage === Math.ceil(allListings.length / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Food ID</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Pickup Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allRequests
                  .slice((requestsPage - 1) * itemsPerPage, requestsPage * itemsPerPage)
                  .map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.food_id.slice(0, 8)}...</TableCell>
                    <TableCell>{request.quantity}</TableCell>
                    <TableCell>{request.pickup_time}</TableCell>
                    <TableCell className="capitalize">{request.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {allRequests.length > itemsPerPage && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setRequestsPage(p => Math.max(1, p - 1))}
                        className={requestsPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.ceil(allRequests.length / itemsPerPage) }, (_, i) => (
                      <PaginationItem key={i + 1}>
                        <PaginationLink
                          onClick={() => setRequestsPage(i + 1)}
                          isActive={requestsPage === i + 1}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setRequestsPage(p => Math.min(Math.ceil(allRequests.length / itemsPerPage), p + 1))}
                        className={requestsPage === Math.ceil(allRequests.length / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;