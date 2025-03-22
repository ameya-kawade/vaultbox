import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [adminMode, setAdminMode] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [invalidCode, setInvalidCode] = useState(false);
  
  // Check if previously authenticated
  useEffect(() => {
    const hasAccess = localStorage.getItem("admin-access") === "true";
    if (hasAccess) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery === "Admin@123#") {
      setAdminMode(true);
      return;
    }
    
    if (searchQuery.trim()) {
      // Regular search behavior
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  const handleAdminAccess = () => {
    if (accessCode === "Admin@123#") {
      localStorage.setItem("admin-access", "true");
      navigate("/dashboard");
    } else {
      setInvalidCode(true);
      setTimeout(() => setInvalidCode(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-3xl flex flex-col items-center">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <Logo className="h-16 w-auto" />
        </motion.div>
        
        <AnimatePresence mode="wait">
          {!adminMode ? (
            <motion.div 
              key="search"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <h1 className="text-4xl font-bold text-center mb-4">VaultBox Secure Messaging</h1>
              <p className="text-muted-foreground text-center mb-8">
                Enter your search term or access code to continue
              </p>
              
              <form onSubmit={handleSearch} className="relative w-full">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search or enter access code..."
                  className="w-full h-14 pl-5 pr-16 text-lg rounded-full"
                  autoFocus
                />
                <Button 
                  type="submit" 
                  size="icon"
                  className="absolute right-2 top-2 rounded-full h-10 w-10"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div 
              key="admin"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md bg-card p-8 rounded-lg shadow-lg border border-border"
            >
              <div className="flex items-center justify-center mb-6">
                <Shield className="h-10 w-10 text-primary mr-3" />
                <h2 className="text-2xl font-bold">Admin Access</h2>
              </div>
              
              <p className="text-muted-foreground text-center mb-6">
                Enter your admin access code to continue
              </p>
              
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    type="password"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="Access Code"
                    className={`w-full ${invalidCode ? 'border-destructive' : ''}`}
                    autoFocus
                  />
                  <Lock className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
                
                {invalidCode && (
                  <p className="text-destructive text-sm">Invalid access code</p>
                )}
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setAdminMode(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={handleAdminAccess}
                  >
                    Access
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 