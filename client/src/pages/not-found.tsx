import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  const [location] = useLocation();
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black">
      <Card className="w-full max-w-md mx-4 bg-zinc-900 border-red-900/50">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-white">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-400">
            The page you're looking for doesn't exist.
          </p>
          
          <p className="mt-2 text-xs text-gray-600 font-mono">
            Current path: {location}
          </p>
          
          <Link href="/">
            <Button className="mt-6 w-full bg-red-700 hover:bg-red-600">
              Return to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
