"use client";
import { signIn, useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, Sparkles, X } from "lucide-react";
import { Button } from "../ui/button";


const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const handleSubmit = async () => {
    if (session?.user) {
      scrollToSection("editor");
    } else {
      await signIn("google");
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "glass border-b backdrop-blur-glass"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-2 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => scrollToSection("hero")}
          >
            <div className="relative">
              <Sparkles
                fill="transparent"
                className="h-8 w-8 text-primary animate-glow-pulse"
              />
              <div className="absolute inset-0 h-8 w-8 text-secondary animate-glow-pulse opacity-50" />
            </div>
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              MEMENTO AI
            </span>
          </motion.div>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => scrollToSection("features")}
              className="text-foreground hover:text-primary transition-colors font-medium px-3 py-2"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="text-foreground hover:text-primary transition-colors font-medium px-3 py-2"
            >
              Pricing
            </button>
            <Button
              variant="default"
              className="font-semibold px-6 py-2"
              onClick={handleSubmit}
            >
              {session?.user ? "Launch App" : "Sign In"}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground hover:text-primary transition-colors p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{
            height: isMobileMenuOpen ? "auto" : 0,
            opacity: isMobileMenuOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-4 space-y-3 border-t border-border/20">
            <button
              onClick={() => scrollToSection("features")}
              className="block w-full text-left text-foreground hover:text-primary transition-colors font-medium py-2 px-2"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="block w-full text-left text-foreground hover:text-primary transition-colors font-medium py-2 px-2"
            >
              Pricing
            </button>
            <Button 
              variant="default" 
              className="w-full font-semibold mt-4" 
              onClick={handleSubmit}
            >
              {session?.user ? "Launch App" : "Sign In"}
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar;