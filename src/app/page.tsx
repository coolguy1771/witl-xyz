'use client';

import React from 'react';
import {AboutSection} from './components/About';

import { Footer } from './components/Footer';
import { ContactSection } from './components/Contact';
import { HeroSection } from './components/Hero';
import { ProjectsSection } from './components/Projects';


export default function Home() {

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Hero Section */}
      <HeroSection />

      {/* About Section */}
      <AboutSection />

      {/* Work Section */}
      <ProjectsSection />

      {/* Contact Section */}
      <ContactSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}