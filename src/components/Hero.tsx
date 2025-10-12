import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-hero pt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent rounded-full border border-primary/20">
              <Leaf className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-accent-foreground">
                Join the Food Waste Reduction Movement
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
              Share Food,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-primary">
                Save Lives
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-xl">
              Connect with local merchants to rescue surplus food before it expires. 
              Join a community making a real environmental impact, one meal at a time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="group" onClick={() => navigate("/auth")}>
                Start Rescuing Food
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/auth")}>
                For Merchants
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
              <div>
                <div className="text-3xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Meals Saved</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-secondary">1,200+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-merchant">500+</div>
                <div className="text-sm text-muted-foreground">Partner Merchants</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative lg:h-[600px] h-96 rounded-2xl overflow-hidden shadow-strong">
            <img
              src={heroImage}
              alt="Community members sharing fresh food together"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            
            {/* Floating Card */}
            <div className="absolute bottom-6 left-6 right-6 bg-card/95 backdrop-blur-sm rounded-xl p-6 shadow-medium border border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-semibold text-card-foreground">Join 1,200+ Community Members</div>
                  <div className="text-sm text-muted-foreground">Making a difference every day</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
