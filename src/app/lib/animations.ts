import { Variants } from 'framer-motion';

/**
 * Animation variants for use with Framer Motion
 * 
 * This file contains reusable animation presets with carefully tuned easing curves
 * for smooth, professional animations throughout the site. Each animation is
 * optimized for specific UI elements and interaction patterns.
 */

/**
 * Modern, subtle fade in animation with slight upward movement
 * Best used for: page transitions, content appearing on scroll, modal dialogs
 */
export const fadeIn: Variants = {
  initial: { 
    opacity: 0, 
    y: 15 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] // Smooth ease-out curve
    }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] // Material Design standard easing
    }
  }
};

/**
 * Container variant for staggered children animations
 * Apply this to a parent element containing multiple children with other animation variants
 * Best used for: lists, grids, or any group of similar elements that should animate sequentially
 */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
      ease: [0.4, 0, 0.2, 1] // Material Design standard easing
    }
  }
};

/**
 * Subtle slide in from left with fade effect
 * Best used for: section headings, titles, sidebar content
 * Pairs well with slideInFromRight for creating balanced entry effects
 */
export const slideInFromLeft: Variants = {
  initial: { 
    x: -30, 
    opacity: 0 
  },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

/**
 * Subtle slide in from right with fade effect
 * Best used for: content blocks, cards, right-aligned elements
 * Complements slideInFromLeft for creating balanced entry effects
 */
export const slideInFromRight: Variants = {
  initial: { 
    x: 30, 
    opacity: 0 
  },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

/**
 * Smooth scale up animation with slight vertical movement
 * Creates a subtle "rising" effect with proper easing
 * Best used for: cards, UI elements, images, or any container that should grow into view
 */
export const scaleUp: Variants = {
  initial: { 
    scale: 0.95, 
    opacity: 0,
    y: 10 
  },
  animate: { 
    scale: 1, 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

/**
 * Navbar-specific animation with subtle downward entry
 * Optimized timing and subtle movement for fixed navigation elements
 * Best used for: top navigation bars, app headers, fixed position UI elements
 */
export const navAnimation: Variants = {
  initial: { 
    y: -20, 
    opacity: 0 
  },
  animate: { 
    y: 0, 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

/**
 * Modern attention-grabbing animation with spring-like effect
 * Uses a custom spring easing curve for a natural, energetic pop
 * Includes hover state for interactive elements
 * Best used for: call-to-action buttons, important UI elements, featured content
 */
export const popIn: Variants = {
  initial: {
    scale: 0.9,
    opacity: 0
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.34, 1.56, 0.64, 1] // Custom spring-like easing
    }
  },
  hover: {
    scale: 1.03,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

/**
 * Modern card hover animation with elevation change
 * Combines subtle upward movement with increased shadow on hover
 * Best used for: cards, clickable panels, interactive containers
 * Note: Apply this to elements with the whileHover prop in Framer Motion
 */
export const cardHover: Variants = {
  initial: { 
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)" 
  },
  hover: { 
    y: -5,
    boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.15)",
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

/**
 * Reveal animation for page sections with upward movement
 * Creates a natural "unveiling" effect ideal for content that appears on scroll
 * Best used for: page sections, large content blocks, elements revealed during scrolling
 */
export const revealFromBottom: Variants = {
  initial: {
    opacity: 0,
    y: 50
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};
