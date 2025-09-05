"use client";
import React from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles, Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  const socialLinks = [
    {
      icon: Github,
      href: "https://www.github.com/deevXO",
      label: "GitHub"
    },
    {
      icon: Twitter,
      href: "https://x.com/deevbuilds",
      label: "X (Twitter)"
    },
    {
      icon: Linkedin,
      href: "https://www.linkedin.com/in/deevanshu-kapoor-a71098289",
      label: "LinkedIn"
    }
  ];

  return (
    <footer className="py-8 sm:py-12 lg:py-16 border-t border-card-border relative overflow-hidden">
      {/*  Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-muted/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mb-8">
            {/* Logo and Description */}
            <div className="lg:col-span-2 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-2 mb-4">
                <div className="relative">
                  <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary animate-glow-pulse" />
                  <div className="absolute inset-0 h-6 w-6 sm:h-8 sm:w-8 text-secondary animate-glow-pulse opacity-50" />
                </div>
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Memento AI
                </span>
              </div>
              
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md mx-auto lg:mx-0">
                Transform your photos with AI-powered editing tools. Remove backgrounds, enhance quality, and create stunning visuals in seconds.
              </p>
            </div>

            {/* Social Links */}
            <div className="text-center lg:text-right">
              <h3 className="text-sm font-semibold text-foreground mb-4">Follow Us</h3>
              <div className="flex items-center justify-center lg:justify-end space-x-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-card border border-card-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow-subtle group"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    aria-label={social.label}
                  >
                    <social.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="pt-6 sm:pt-8 border-t border-card-border">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              {/* Made with love */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start space-x-1 sm:space-x-2 text-xs sm:text-sm text-muted-foreground">
                <span>Made with</span>
                <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 animate-pulse mx-1" />
                <span>by</span>
                <a
                  href="https://www.github.com/deevXO"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary hover:underline transition-colors"
                >
                  Deevanshu Kapoor
                </a>
              </div>

              {/* Copyright */}
              <p className="text-xs sm:text-sm text-muted-foreground">
                © 2025 Memento AI. All rights reserved.
              </p>
            </div>
            
            {/* Mobile-only additional text */}
            <div className="sm:hidden text-center mt-2">
              <span className="text-xs text-muted-foreground">for creators everywhere</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;