import { Search, ShoppingCart, Heart, Store, Upload, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const HowItWorks = () => {
  const userSteps = [
    {
      icon: Search,
      title: "Browse Listings",
      description: "Discover surplus food from local merchants near you",
      color: "text-primary",
    },
    {
      icon: ShoppingCart,
      title: "Request & Reserve",
      description: "Add items to cart and set your preferred pickup time",
      color: "text-primary",
    },
    {
      icon: Heart,
      title: "Pick Up & Enjoy",
      description: "Collect your rescued food and help reduce waste",
      color: "text-primary",
    },
  ];

  const merchantSteps = [
    {
      icon: Upload,
      title: "List Surplus Food",
      description: "Upload items approaching expiry with photos and details",
      color: "text-merchant",
    },
    {
      icon: Bell,
      title: "Receive Requests",
      description: "Get notified when users want to rescue your food",
      color: "text-merchant",
    },
    {
      icon: Store,
      title: "Manage Pickups",
      description: "Track donations and coordinate with your community",
      color: "text-merchant",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How ShareABite Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple steps for both users and merchants to join the food-sharing community
          </p>
        </div>

        {/* For Users */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-center mb-10 text-primary">
            For Food Rescuers
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {userSteps.map((step, index) => (
              <Card 
                key={index} 
                className="relative overflow-hidden hover:shadow-medium transition-all duration-300 hover:-translate-y-1 border-2"
              >
                <CardContent className="p-8">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary opacity-5 rounded-bl-full" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center mb-6">
                      <step.icon className={`w-7 h-7 ${step.color}`} />
                    </div>
                    <div className="flex items-start gap-3 mb-4">
                      <span className="text-4xl font-bold text-primary/20">0{index + 1}</span>
                      <h4 className="text-xl font-bold mt-2">{step.title}</h4>
                    </div>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* For Merchants */}
        <div>
          <h3 className="text-2xl font-bold text-center mb-10 text-merchant">
            For Merchants
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {merchantSteps.map((step, index) => (
              <Card 
                key={index} 
                className="relative overflow-hidden hover:shadow-medium transition-all duration-300 hover:-translate-y-1 border-2"
              >
                <CardContent className="p-8">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-merchant opacity-5 rounded-bl-full" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-merchant/10 rounded-xl flex items-center justify-center mb-6">
                      <step.icon className={`w-7 h-7 ${step.color}`} />
                    </div>
                    <div className="flex items-start gap-3 mb-4">
                      <span className="text-4xl font-bold text-merchant/20">0{index + 1}</span>
                      <h4 className="text-xl font-bold mt-2">{step.title}</h4>
                    </div>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
