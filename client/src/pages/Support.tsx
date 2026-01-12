import { Navigation } from "@/components/Navigation";
import { TacticalCard } from "@/components/TacticalCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, HelpCircle, AlertTriangle, Bug, MessageSquare } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Support() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    discordUsername: "",
    category: "",
    subject: "",
    message: "",
  });

  const supportMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/support", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Support Request Sent",
        description: "We'll get back to you as soon as possible!",
      });
      setFormData({
        name: "",
        email: "",
        discordUsername: "",
        category: "",
        subject: "",
        message: "",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send support request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.subject || !formData.message) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    supportMutation.mutate(formData);
  };

  const categories = [
    { value: "general", label: "General Question", icon: HelpCircle },
    { value: "bug", label: "Bug Report", icon: Bug },
    { value: "abuse", label: "Report Player", icon: AlertTriangle },
    { value: "donation", label: "Donation Issue", icon: Mail },
    { value: "other", label: "Other", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-black font-sans">
      <Navigation />
      
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-20">
        <div className="text-center mb-10 sm:mb-16">
          <h1 className="text-3xl sm:text-5xl font-tactical text-white mb-4">
            NEED <span className="text-red-600">HELP?</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto font-mono text-sm sm:text-base px-4">
            Fill out the form below and our team will get back to you as soon as possible.
          </p>
        </div>

        <TacticalCard title="SUPPORT REQUEST" glowColor="red">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300 font-mono text-xs sm:text-sm">
                  YOUR NAME
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-black/50 border-red-900/50 focus:border-red-500 text-white h-10 sm:h-12"
                  data-testid="input-name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300 font-mono text-xs sm:text-sm">
                  EMAIL ADDRESS
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-black/50 border-red-900/50 focus:border-red-500 text-white h-10 sm:h-12"
                  data-testid="input-email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discord" className="text-gray-300 font-mono text-xs sm:text-sm">
                DISCORD USERNAME (OPTIONAL)
              </Label>
              <Input
                id="discord"
                placeholder="username#1234"
                value={formData.discordUsername}
                onChange={(e) => setFormData({ ...formData, discordUsername: e.target.value })}
                className="bg-black/50 border-red-900/50 focus:border-red-500 text-white h-10 sm:h-12"
                data-testid="input-discord"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300 font-mono text-xs sm:text-sm">
                WHAT DO YOU NEED HELP WITH? *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger 
                  className="bg-black/50 border-red-900/50 focus:border-red-500 text-white h-10 sm:h-12"
                  data-testid="select-category"
                >
                  <SelectValue placeholder="Select a category..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-red-900/50">
                  {categories.map((cat) => (
                    <SelectItem 
                      key={cat.value} 
                      value={cat.value}
                      className="text-white focus:bg-red-900/30 focus:text-white"
                    >
                      <div className="flex items-center gap-2">
                        <cat.icon className="w-4 h-4 text-red-500" />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="text-gray-300 font-mono text-xs sm:text-sm">
                SUBJECT *
              </Label>
              <Input
                id="subject"
                placeholder="Brief description of your issue"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="bg-black/50 border-red-900/50 focus:border-red-500 text-white h-10 sm:h-12"
                data-testid="input-subject"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-gray-300 font-mono text-xs sm:text-sm">
                MESSAGE *
              </Label>
              <Textarea
                id="message"
                placeholder="Describe your issue in detail..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="bg-black/50 border-red-900/50 focus:border-red-500 text-white min-h-[120px] sm:min-h-[150px] resize-none"
                data-testid="input-message"
              />
            </div>

            <Button
              type="submit"
              disabled={supportMutation.isPending}
              className="w-full bg-red-700 hover:bg-red-600 text-white font-bold h-12 sm:h-14 tracking-wider text-base sm:text-lg"
              data-testid="button-submit-support"
            >
              {supportMutation.isPending ? (
                "SENDING..."
              ) : (
                <>
                  <Send className="mr-2 w-5 h-5" />
                  SEND REQUEST
                </>
              )}
            </Button>
          </form>
        </TacticalCard>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-600 font-mono">
            Responses are typically sent within 24-48 hours.
            <br />
            For urgent matters, contact us on Discord.
          </p>
        </div>
      </div>
    </div>
  );
}
