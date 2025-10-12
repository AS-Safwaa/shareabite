import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const handleRoleLogin = async (role: 'user' | 'admin' | 'merchant') => {
    setLoading(true);
    
    const credentials = {
      user: { email: 'user@shareabite.com', password: 'user123', name: 'User' },
      admin: { email: 'admin@shareabite.com', password: 'admin123', name: 'Admin' },
      merchant: { email: 'merchant@shareabite.com', password: 'merchant123', name: 'Merchant' },
    };

    const { email, password, name } = credentials[role];
    
    // Try to sign in first
    let { error } = await supabase.auth.signInWithPassword({ email, password });

    // If sign in fails, try to sign up
    if (error) {
      const signUpResult = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (signUpResult.error) {
        toast({
          title: "Login failed",
          description: signUpResult.error.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      // After signup, assign the correct role
      if (signUpResult.data.user) {
        await supabase
          .from('user_roles')
          .insert({ user_id: signUpResult.data.user.id, role });
      }
    }
    
    navigate("/dashboard");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            ShareABite
          </CardTitle>
          <CardDescription>Join the food waste reduction movement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-center text-muted-foreground mb-6">
              Select your role to access the dashboard
            </p>
            
            <Button 
              onClick={() => handleRoleLogin('user')} 
              className="w-full h-16 text-lg"
              disabled={loading}
            >
              Continue as User
            </Button>
            
            <Button 
              onClick={() => handleRoleLogin('merchant')} 
              className="w-full h-16 text-lg"
              disabled={loading}
            >
              Continue as Merchant
            </Button>
            
            <Button 
              onClick={() => handleRoleLogin('admin')} 
              className="w-full h-16 text-lg"
              disabled={loading}
            >
              Continue as Admin
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;