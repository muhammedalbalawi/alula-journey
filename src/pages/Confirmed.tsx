import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const Confirmed = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto redirect to home after 5 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Email Confirmed!
            </h1>
            <p className="text-muted-foreground">
              Your email address has been successfully verified. Welcome to Journew!
            </p>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={() => navigate('/')} 
              className="w-full"
              size="lg"
            >
              Start Your Journey
            </Button>
            
            <p className="text-sm text-muted-foreground">
              You will be redirected automatically in a few seconds...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Confirmed;