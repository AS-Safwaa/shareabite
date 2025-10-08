import { TrendingUp, Leaf, Users2, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Impact = () => {
  const stats = [
    {
      icon: Leaf,
      value: "25 Tons",
      label: "CO₂ Emissions Prevented",
      description: "Equivalent to 5,000 trees planted",
      gradient: "bg-gradient-primary",
    },
    {
      icon: TrendingUp,
      value: "50,000+",
      label: "Meals Rescued",
      description: "Feeding families, reducing waste",
      gradient: "bg-gradient-warm",
    },
    {
      icon: Users2,
      value: "1,200+",
      label: "Active Community Members",
      description: "Growing every day",
      gradient: "bg-gradient-primary",
    },
    {
      icon: Award,
      value: "500+",
      label: "Partner Merchants",
      description: "Local businesses making impact",
      gradient: "bg-gradient-warm",
    },
  ];

  return (
    <section id="impact" className="py-24 bg-gradient-hero">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Our Community Impact
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Together, we're creating meaningful change in our communities and environment
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card 
              key={index}
              className="relative overflow-hidden border-2 hover:shadow-glow transition-all duration-500 hover:-translate-y-2 group"
            >
              <CardContent className="p-8">
                <div className={`w-16 h-16 ${stat.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-primary">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold mb-2">{stat.label}</div>
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-card rounded-2xl p-8 md:p-12 shadow-strong border border-border">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-4">
                Every Action Counts
              </h3>
              <p className="text-muted-foreground mb-6">
                When you rescue food through ShareABite, you're not just saving a meal – 
                you're reducing greenhouse gas emissions, supporting local businesses, 
                and building a stronger, more sustainable community.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-sm">40% of food in the US goes to waste</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-sm">Food waste contributes 8-10% of global emissions</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-sm">Together we can make a difference</span>
                </div>
              </div>
            </div>
            <div className="relative h-64 md:h-80 bg-accent rounded-xl flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-primary">
                  92%
                </div>
                <div className="text-lg font-semibold">
                  User Satisfaction Rate
                </div>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Our community loves the impact they're making
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Impact;
