import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogOut, ShoppingCart, MapPin, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface FoodListing {
  id: string;
  merchant_id: string;
  title: string;
  description: string;
  category: string;
  available_quantity: number;
  expiry_at: string;
  pickup_time_start: string;
  pickup_time_end: string;
  location: string;
  city: string;
  image_url: string;
}

const UserDashboard = ({ user }: { user: User }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [foodListings, setFoodListings] = useState<FoodListing[]>([]);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchFoodListings();
  }, []);

  const fetchFoodListings = async () => {
    const { data } = await supabase
      .from("food_listings")
      .select("*")
      .eq("status", "available")
      .gt("available_quantity", 0);

    if (data) setFoodListings(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const addToCart = (foodId: string) => {
    setCart((prev) => ({ ...prev, [foodId]: (prev[foodId] || 0) + 1 }));
    toast({ title: "Added to cart" });
  };

  const requestFood = async (foodId: string) => {
    const quantity = cart[foodId] || 1;
    const food = foodListings.find((f) => f.id === foodId);
    
    if (!food) return;

    const { error } = await supabase.from("food_requests").insert({
      food_id: foodId,
      user_id: user.id,
      merchant_id: food.merchant_id,
      quantity,
      pickup_time: `${food.pickup_time_start} - ${food.pickup_time_end}`,
    });

    if (error) {
      toast({ title: "Request failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Request sent successfully!" });
      setCart((prev) => {
        const newCart = { ...prev };
        delete newCart[foodId];
        return newCart;
      });
      fetchFoodListings();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <nav className="bg-card shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">ShareABite</h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Available Food</h2>
          <p className="text-muted-foreground">Browse and request food from local merchants</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foodListings
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((food) => (
            <Card key={food.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{food.title}</CardTitle>
                <CardDescription>{food.category}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{food.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    {food.location}, {food.city}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    Pickup: {food.pickup_time_start} - {food.pickup_time_end}
                  </div>
                  <p className="font-semibold">Available: {food.available_quantity} servings</p>
                  <p className="text-xs">Expires: {new Date(food.expiry_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => addToCart(food.id)} variant="outline" className="flex-1">
                    <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                  </Button>
                  <Button onClick={() => requestFood(food.id)} className="flex-1">
                    Request Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {foodListings.length > itemsPerPage && (
          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: Math.ceil(foodListings.length / itemsPerPage) }, (_, i) => (
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
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(foodListings.length / itemsPerPage), p + 1))}
                    className={currentPage === Math.ceil(foodListings.length / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;