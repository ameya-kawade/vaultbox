"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Users, MessageSquare, Video, Lock, Shield, 
  Github, Code, Headphones, FileText, ArrowRight 
} from "lucide-react";
import logoDark from "@/assets/logo-dark.svg";
import logoLight from "@/assets/logo-light.svg";

const LandingPage = ({ isAuthenticated, userId }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    
    // Check if we're in dark mode by inspecting the HTML element's class
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay: 0.1 },
    },
  };

  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const features = [
    {
      icon: <Lock className="h-8 w-8 text-primary" />,
      title: "End-to-End Encryption",
      description: "All communications are encrypted for maximum privacy",
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Secure Communications",
      description: "Keep your team's conversations private and secure",
    },
    {
      icon: <Video className="h-8 w-8 text-primary" />,
      title: "HD Video Meetings",
      description: "Crystal clear video with encrypted transmission",
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      title: "Encrypted Messaging",
      description: "Safe messaging with modern encryption standards",
    },
    {
      icon: <Github className="h-8 w-8 text-primary" />,
      title: "Open Source",
      description: "Transparent code you can trust",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Team Management",
      description: "Organize your team securely and efficiently",
    },
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Login",
      description: "Login up in seconds with just your email",
    },
    {
      step: 2,
      title: "Invite Your Team",
      description: "Add team members through secure invitations",
    },
    {
      step: 3,
      title: "Collaborate Securely",
      description: "Enjoy encrypted video meetings and messaging",
    },
  ];

  const faqs = [
    {
      question: "Is VaultBox truly secure?",
      answer: "Yes, VaultBox uses end-to-end encryption for all communications. Your data is encrypted on your device before transmission, ensuring only the intended recipients can access it."
    },
    {
      question: "Is VaultBox open source?",
      answer: "Yes, VaultBox is completely open source. You can view and contribute to our codebase on GitHub, ensuring transparency and security."
    },
    {
      question: "Can I self-host VaultBox?",
      answer: "Yes, VaultBox is designed to be self-hosted. You can deploy it on your own servers for complete control over your data and communications."
    },
    {
      question: "What features does VaultBox include?",
      answer: "VaultBox includes secure video meetings, encrypted messaging, file sharing, team management, and more - all with privacy and security as the top priority."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Navigation */}
      <motion.header
        className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? "bg-card/90 backdrop-blur-md py-3" : "bg-transparent py-5"}`}
        initial="hidden"
        animate="visible"
        variants={navVariants}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center space-x-1">
            <img src={isDarkMode ? logoDark : logoLight} alt="VaultBox" className="h-8" />
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-sm hover:text-primary transition-colors">
              Home
            </a>
            <a href="#features" className="text-sm hover:text-primary transition-colors">
              Features
            </a>
            <a href="#open-source" className="text-sm hover:text-primary transition-colors">
              Open Source
            </a>
            {isAuthenticated && (
              <a href="/dashboard" className="text-sm hover:text-primary transition-colors">
                Dashboard
              </a>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-primary text-primary hover:bg-primary/10"
                  onClick={() => navigate('/dashboard')}
                >
                  Go to Dashboard
                </Button>
              </>
            ) : (
              <>
               
                <Button 
                  size="sm"
                  className="hidden sm:inline-flex"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Glowing background effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background/80 to-background"></div>
        
        {/* Animated grid lines for matrix effect */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full bg-[linear-gradient(to_right,#4f4f4f20_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f20_1px,transparent_1px)]" style={{ backgroundSize: '24px 24px' }}></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center justify-center text-center">
            <motion.div
              className="max-w-4xl"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-center" 
                style={{ letterSpacing: "-0.05em" }}
                variants={fadeIn}
              >
                Secure Communications
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 block mt-2">
                  {" "}Built for Privacy
                </span>
              </motion.h1>
              
              <motion.p
                className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-center"
                variants={fadeIn}
              >
                End-to-end encrypted video meetings and messaging platform — open-source, private, and secure.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12"
                variants={fadeIn}
              >
                <Button 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-medium shadow-[0_0_15px_rgba(62,188,255,0.5)]"
                  onClick={() => navigate('/register')}
                >
                  Get Started Free
                </Button>
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10 px-8 py-3 rounded-lg font-medium"
                  onClick={() => window.open("https://github.com/vaultboxapp", "_blank")}
                >
                  <Github className="mr-2 h-5 w-5" />
                  GitHub
                </Button>
              </motion.div>
              
              {/* Badges */}
              <motion.div
                className="flex flex-wrap justify-center gap-4 mb-8"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.div variants={featureVariants} className="bg-card/50 backdrop-blur-sm border border-border rounded-full px-4 py-2 flex items-center">
                  <span className="text-primary mr-2">🔒</span>
                  <span className="text-sm">End-to-End Encrypted</span>
                </motion.div>
                <motion.div variants={featureVariants} className="bg-card/50 backdrop-blur-sm border border-border rounded-full px-4 py-2 flex items-center">
                  <span className="text-primary mr-2">⚡</span>
                  <span className="text-sm">High Performance</span>
                </motion.div>
                <motion.div variants={featureVariants} className="bg-card/50 backdrop-blur-sm border border-border rounded-full px-4 py-2 flex items-center">
                  <span className="text-primary mr-2">🌐</span>
                  <span className="text-sm">Open Source</span>
                </motion.div>
              </motion.div>

              {/* Glowing orb decoration */}
              <div className="relative w-full h-24 mt-12">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-primary/40 rounded-full blur-xl"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center" style={{ letterSpacing: "-0.05em" }}>Powerful Security Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-center">
              VaultBox combines cutting-edge cryptography with intuitive design to provide secure video meetings for everyone.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_15px_rgba(62,188,255,0.15)]"
                variants={featureVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="bg-primary/10 p-3 rounded-lg inline-block mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center" style={{ letterSpacing: "-0.05em" }}>How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-center">
              VaultBox makes secure communications simple and straightforward.
            </p>
          </motion.div>

          <div className="flex flex-col lg:flex-row justify-center space-y-8 lg:space-y-0 lg:space-x-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                className="bg-card border border-border rounded-xl p-6 w-full lg:w-1/3 relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground shadow-[0_0_10px_rgba(62,188,255,0.5)]">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>

                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 text-primary text-2xl">
                    →
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Source Section */}
      <section id="open-source" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center" style={{ letterSpacing: "-0.05em" }}>Open Source and Free to Use</h2>
            <p className="text-foreground mb-8 text-center">
              VaultBox is built with security and openness in mind — secure communication should be accessible
              to everyone. Our code is fully open source and available on GitHub.
            </p>
            <div className="bg-card/70 backdrop-blur-sm border border-border rounded-xl p-6 mb-8 text-center shadow-[0_0_15px_rgba(62,188,255,0.1)]">
              <div className="flex items-center justify-center mb-4">
                <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center mr-3">
                  <Github className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">VaultBox on GitHub</h3>
                  <p className="text-sm text-muted-foreground">github.com/vaultboxapp</p>
                </div>
              </div>
              <div className="flex justify-center space-x-4 text-sm">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-yellow-400 mr-1"></span>
                  <span>JavaScript</span>
                </div>
                <div className="flex items-center">
                  <Code className="h-4 w-4 mr-1" />
                  <span>Privacy first communication platform for teams</span>
                </div>
              </div>
            </div>
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-medium shadow-[0_0_15px_rgba(62,188,255,0.3)]"
              onClick={() => window.open("https://github.com/vaultboxapp", "_blank")}
            >
              <Github className="mr-2 h-5 w-5" />
              View on GitHub
            </Button>
          </motion.div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" className="py-20 bg-card/50">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center" style={{ letterSpacing: "-0.05em" }}>Frequently Asked Questions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-center">Find answers to common questions about VaultBox</p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <AnimatePresence>
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  className="mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_15px_rgba(62,188,255,0.1)]">
                    <h3 className="text-xl font-semibold mb-3">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-background to-card relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"></div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {isAuthenticated ? (
              <>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center" style={{ letterSpacing: "-0.05em" }}>Ready to Continue?</h2>
                <p className="text-foreground mb-8 text-center">
                  Return to your dashboard to access all your secure communications and meetings.
                </p>
                <Button 
                  className="px-8 py-3 rounded-lg font-medium shadow-[0_0_15px_rgba(62,188,255,0.3)]"
                  onClick={() => navigate('/dashboard')}
                >
                  Go to Dashboard
                </Button>
              </>
            ) : (
              <>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center" style={{ letterSpacing: "-0.05em" }}>Get Started with VaultBox Today</h2>
                <p className="text-foreground mb-8 text-center">
                  Join thousands of users who trust VaultBox for their secure communications. 
                  Try it free today and experience the difference.
                </p>
                <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <Button 
                    className="px-8 py-3 rounded-lg font-medium shadow-[0_0_15px_rgba(62,188,255,0.3)]"
                    onClick={() => navigate('/register')}
                  >
                    Sign Up Free
                  </Button>
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10 px-8 py-3 rounded-lg font-medium"
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <img src={isDarkMode ? logoDark : logoLight} alt="VaultBox" className="h-10" />
            </div>

            <div className="flex flex-wrap justify-center gap-6 mb-6 md:mb-0">
              <a 
                href="https://github.com/vaultboxapp" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center"
              >
                <Github className="h-4 w-4 mr-1" /> GitHub
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Documentation
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} VaultBox. All rights reserved.</p>
            <p className="mt-2">Privacy first communication platform for teams.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 