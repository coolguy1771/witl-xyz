import { Variants } from 'framer-motion';

export const fadeIn: Variants = {
  initial: { 
    opacity: 0, 
    y: 20 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5
    }
  },
  exit: { 
    opacity: 0, 
    y: 20 
  }
};

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const slideInFromLeft: Variants = {
  initial: { 
    x: -100, 
    opacity: 0 
  },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 100
    }
  }
};

export const slideInFromRight: Variants = {
  initial: { 
    x: 100, 
    opacity: 0 
  },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 100
    }
  }
};

export const scaleUp: Variants = {
  initial: { 
    scale: 0.8, 
    opacity: 0 
  },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 100
    }
  }
};

export const navAnimation: Variants = {
  initial: { 
    y: -100, 
    opacity: 0 
  },
  animate: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 100
    }
  }
};