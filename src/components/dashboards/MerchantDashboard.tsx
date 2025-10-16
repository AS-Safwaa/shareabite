import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Plus, Bell, Edit, Trash2, Archive, ArchiveRestore } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const MerchantDashboard = ({ user }: { user: User }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [myDonations, setMyDonations] = useState<any[]>([]);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchMyDonations();
    fetchPendingOrdersCount();
  }, []);

  const fetchMyDonations = async () => {
    const { data } = await supabase
      .from("food_listings")
      .select("*")
      .eq("merchant_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setMyDonations(data);
  };

  const fetchPendingOrdersCount = async () => {
    const { data } = await supabase
      .from("food_requests")
      .select("id")
      .eq("merchant_id", user.id)
      .eq("status", "pending");

    if (data) setPendingOrdersCount(data.length);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleAddFood = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const { error } = await supabase.from("food_listings").insert([{
      merchant_id: user.id,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      quantity: parseInt(formData.get("quantity") as string),
      available_quantity: parseInt(formData.get("quantity") as string),
      expiry_at: formData.get("expiry_at") as string,
      pickup_time_start: formData.get("pickup_start") as string,
      pickup_time_end: formData.get("pickup_end") as string,
      location: formData.get("location") as string,
      city: formData.get("city") as string,
      status: "available",
    }]);

    if (error) {
      toast({ title: "Failed to add food", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Food added successfully!" });
      setShowAddDialog(false);
      fetchMyDonations();
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleEditFood = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const { error } = await supabase
      .from("food_listings")
      .update({
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        quantity: parseInt(formData.get("quantity") as string),
        available_quantity: parseInt(formData.get("available_quantity") as string),
        expiry_at: formData.get("expiry_at") as string,
        pickup_time_start: formData.get("pickup_start") as string,
        pickup_time_end: formData.get("pickup_end") as string,
        location: formData.get("location") as string,
        city: formData.get("city") as string,
      })
      .eq("id", editingItem.id);

    if (error) {
      toast({ title: "Failed to update food", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Food updated successfully!" });
      setEditingItem(null);
      fetchMyDonations();
    }
  };

  const handleDeleteFood = async (id: string) => {
    const { error } = await supabase
      .from("food_listings")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Food item deleted" });
      fetchMyDonations();
    }
  };

  const handleArchiveToggle = async (item: any) => {
    const newStatus = item.status === "archived" ? "available" : "archived";
    const { error } = await supabase
      .from("food_listings")
      .update({ status: newStatus })
      .eq("id", item.id);

    if (error) {
      toast({ title: "Failed to update status", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Item ${newStatus === "archived" ? "archived" : "unarchived"}` });
      fetchMyDonations();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <nav className="bg-card shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">ShareABite - Merchant</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/dashboard/orders")}>
              <div className="relative">
                <Bell className="h-5 w-5 mr-2" />
                {pendingOrdersCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                    {pendingOrdersCount}
                  </Badge>
                )}
              </div>
              Orders
            </Button>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">My Food Listings</h2>
            <p className="text-muted-foreground">Manage your food donations</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Food
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Food Donation</DialogTitle>
                <DialogDescription>Fill in the details for your food donation</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddFood} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Food Title</Label>
                    <Input id="title" name="title" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" name="category" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity (servings)</Label>
                    <Input id="quantity" name="quantity" type="number" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiry_at">Expiry Date & Time</Label>
                    <Input id="expiry_at" name="expiry_at" type="datetime-local" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pickup_start">Pickup Start Time</Label>
                    <Input id="pickup_start" name="pickup_start" type="time" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pickup_end">Pickup End Time</Label>
                    <Input id="pickup_end" name="pickup_end" type="time" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" name="location" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" required defaultValue="Chennai" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" rows={3} />
                </div>
                <Button type="submit" className="w-full">Add Food Item</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {editingItem && (
          <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Food Item</DialogTitle>
                <DialogDescription>Update the details for your food donation</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditFood} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Food Title</Label>
                    <Input id="edit-title" name="title" defaultValue={editingItem.title} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <Input id="edit-category" name="category" defaultValue={editingItem.category} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-quantity">Total Quantity</Label>
                    <Input id="edit-quantity" name="quantity" type="number" defaultValue={editingItem.quantity} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-available">Available Quantity</Label>
                    <Input id="edit-available" name="available_quantity" type="number" defaultValue={editingItem.available_quantity} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-expiry">Expiry Date & Time</Label>
                    <Input id="edit-expiry" name="expiry_at" type="datetime-local" defaultValue={editingItem.expiry_at?.slice(0, 16)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-pickup-start">Pickup Start Time</Label>
                    <Input id="edit-pickup-start" name="pickup_start" type="time" defaultValue={editingItem.pickup_time_start} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-pickup-end">Pickup End Time</Label>
                    <Input id="edit-pickup-end" name="pickup_end" type="time" defaultValue={editingItem.pickup_time_end} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-location">Location</Label>
                    <Input id="edit-location" name="location" defaultValue={editingItem.location} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-city">City</Label>
                    <Input id="edit-city" name="city" defaultValue={editingItem.city} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea id="edit-description" name="description" rows={3} defaultValue={editingItem.description || ""} />
                </div>
                <Button type="submit" className="w-full">Update Food Item</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myDonations
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((donation) => (
            <Card key={donation.id} className={donation.status === "archived" ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{donation.title}</CardTitle>
                    <CardDescription>{donation.category}</CardDescription>
                  </div>
                  <Badge variant={donation.status === "archived" ? "secondary" : "default"}>
                    {donation.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm"><strong>Location:</strong> {donation.location}, {donation.city}</p>
                <p className="text-sm"><strong>Available:</strong> {donation.available_quantity} / {donation.quantity} servings</p>
                <p className="text-sm"><strong>Expires:</strong> {new Date(donation.expiry_at).toLocaleString()}</p>
                <p className="text-sm"><strong>Pickup:</strong> {donation.pickup_time_start} - {donation.pickup_time_end}</p>
                {donation.description && <p className="text-sm text-muted-foreground">{donation.description}</p>}
                
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => setEditingItem(donation)}>
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleArchiveToggle(donation)}
                  >
                    {donation.status === "archived" ? (
                      <><ArchiveRestore className="h-4 w-4 mr-1" /> Unarchive</>
                    ) : (
                      <><Archive className="h-4 w-4 mr-1" /> Archive</>
                    )}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleDeleteFood(donation.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {myDonations.length > itemsPerPage && (
          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: Math.ceil(myDonations.length / itemsPerPage) }, (_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      onClick={() => setCurrentPage(i + 1)}
                      isActive={currentPage === i + 1}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(myDonations.length / itemsPerPage), p + 1))}
                    className={currentPage === Math.ceil(myDonations.length / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {myDonations.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No food items yet. Click "Add Food" to get started!</p>
          </Card>
        )}
      </main>
    </div>
  );
};

export default MerchantDashboard;