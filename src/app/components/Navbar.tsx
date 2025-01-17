"use client";
import Link from 'next/link';
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { navAnimation,  } from "../lib/animations";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Work", href: "/#work" },
    { label: "Blog", href: "/blog" },
    { label: "About", href: "/#about" },
    { label: "Contact", href: "/#contact" },
  ];

  return (
    <motion.nav 
      className="fixed w-full bg-background/50 backdrop-blur-sm border-b border-foreground/10 z-10"
      initial="initial"
      animate="animate"
      variants={navAnimation}
    >
      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link 
            href="/" 
            className="text-lg font-mono hover:text-gray-300 transition-colors"
          >
            john.doe
          </Link>
          
          <div className="flex gap-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (pathname === '/' && item.href.startsWith('/#'));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative group ${isActive ? 'text-foreground' : 'text-gray-400'}`}
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-300 transition-all group-hover:w-full" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
