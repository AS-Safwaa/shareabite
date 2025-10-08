import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MerchantDashboard = ({ user }: { user: User }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [myDonations, setMyDonations] = useState<any[]>([]);

  useEffect(() => {
    fetchMyDonations();
  }, []);

  const fetchMyDonations = async () => {
    const { data } = await supabase
      .from("food_listings")
      .select("*")
      .eq("merchant_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setMyDonations(data);
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
    }]);

    if (error) {
      toast({ title: "Failed to add food", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Food added successfully!" });
      setShowAddForm(false);
      fetchMyDonations();
      (e.target as HTMLFormElement).reset();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <nav className="bg-card shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">ShareABite - Merchant</h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">My Donations</h2>
            <p className="text-muted-foreground">Manage your food listings</p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="mr-2 h-4 w-4" /> Add Food
          </Button>
        </div>

        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Food Donation</CardTitle>
            </CardHeader>
            <CardContent>
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
                <Button type="submit" className="w-full">Submit Donation</Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myDonations.map((donation) => (
            <Card key={donation.id}>
              <CardHeader>
                <CardTitle>{donation.title}</CardTitle>
                <CardDescription>{donation.category}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>Location:</strong> {donation.location}, {donation.city}</p>
                <p><strong>Available:</strong> {donation.available_quantity} / {donation.quantity}</p>
                <p><strong>Expires:</strong> {new Date(donation.expiry_at).toLocaleString()}</p>
                <p><strong>Status:</strong> <span className="capitalize">{donation.status}</span></p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default MerchantDashboard;