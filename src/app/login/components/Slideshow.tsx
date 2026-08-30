"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";

const IMAGES = [
  "/images/cloudron-1.jpg",
  "/images/inauguration-1.jpg",
  "/images/mahotsav-1.jpg",
  "/images/nova-2026-1.jpg",
];

export default function Slideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={IMAGES[currentIndex]}
            alt="ACM Event"
            fill
            className="object-cover opacity-20"
            priority={currentIndex === 0}
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      
      <div className="relative z-10 flex flex-col items-start justify-center h-full p-12 lg:p-24 space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Image src="/images/acm-logo-circle.png" alt="ACM Logo" width={80} height={80} className="mb-6 drop-shadow-2xl shadow-cyan/20" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-5xl lg:text-7xl font-display font-bold tracking-tighter text-foreground leading-[1.1]"
        >
          Empowering <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-acm to-cyan">Minds.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-lg lg:text-xl text-muted-foreground max-w-lg mt-4"
        >
          Welcome to the ACM GRIET Admin Portal. Securely manage recruitments, team members, and chapter operations.
        </motion.p>
      </div>
    </div>
  );
}
