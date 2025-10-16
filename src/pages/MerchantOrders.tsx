import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle, XCircle, Clock, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MerchantOrders = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleData?.role !== "merchant") {
        navigate("/dashboard");
        return;
      }

      setUser(user);
      fetchOrders(user.id);
    };

    checkAuth();
  }, [navigate]);

  const fetchOrders = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("food_requests")
      .select(`
        *,
        food_listings(*),
        profiles(*)
      `)
      .eq("merchant_id", userId)
      .order("created_at", { ascending: false });

    if (data) setOrders(data);
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from("food_requests")
      .update({ status })
      .eq("id", orderId);

    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Order ${status}` });
      if (user) fetchOrders(user.id);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", icon: Clock, text: "Pending" },
      approved: { variant: "default", icon: CheckCircle, text: "Approved" },
      rejected: { variant: "destructive", icon: XCircle, text: "Rejected" },
      completed: { variant: "outline", icon: Package, text: "Completed" },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const pendingOrders = orders.filter(o => o.status === "pending");
  const activeOrders = orders.filter(o => o.status === "approved");
  const pastOrders = orders.filter(o => ["rejected", "completed"].includes(o.status));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <nav className="bg-card shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Order Management</h2>
          <p className="text-muted-foreground">Review and manage customer requests</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              History ({pastOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingOrders.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No pending orders</p>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Pending Requests</CardTitle>
                  <CardDescription>Review and respond to customer requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Food Item</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Pickup Time</TableHead>
                        <TableHead>Request Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                          <TableCell className="font-medium">{order.food_listings?.title}</TableCell>
                          <TableCell>{order.profiles?.full_name || order.profiles?.email}</TableCell>
                          <TableCell>{order.quantity} servings</TableCell>
                          <TableCell>{order.pickup_time}</TableCell>
                          <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => updateOrderStatus(order.id, 'approved')}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" /> Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => updateOrderStatus(order.id, 'rejected')}
                              >
                                <XCircle className="h-4 w-4 mr-1" /> Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeOrders.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No active orders</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {activeOrders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{order.food_listings?.title}</CardTitle>
                          <CardDescription>Order #{order.id.slice(0, 8)}</CardDescription>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm"><strong>Customer:</strong> {order.profiles?.full_name || order.profiles?.email}</p>
                          <p className="text-sm"><strong>Quantity:</strong> {order.quantity} servings</p>
                          <p className="text-sm"><strong>Pickup Time:</strong> {order.pickup_time}</p>
                        </div>
                        <div>
                          <p className="text-sm"><strong>Location:</strong> {order.food_listings?.location}</p>
                          <p className="text-sm"><strong>Request Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
                          {order.notes && <p className="text-sm"><strong>Notes:</strong> {order.notes}</p>}
                        </div>
                      </div>
                      <div className="pt-2">
                        <Button 
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                        >
                          <Package className="h-4 w-4 mr-1" /> Mark as Completed
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {pastOrders.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No order history</p>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>Past completed and rejected orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Food Item</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pastOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                          <TableCell className="font-medium">{order.food_listings?.title}</TableCell>
                          <TableCell>{order.profiles?.full_name || order.profiles?.email}</TableCell>
                          <TableCell>{order.quantity} servings</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MerchantOrders;
