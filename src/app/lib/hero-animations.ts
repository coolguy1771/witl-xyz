import { Variants } from "framer-motion";

// Optimized animation variants for Hero component
export const heroAnimations = {
  // Container animation for staggered children
  titleContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  } as Variants,

  // Word-level animation (much more performant than character-level)
  wordAnimation: {
    hidden: {
      opacity: 0,
      y: 30,
      filter: "blur(4px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 100,
        duration: 0.6,
      },
    },
  } as Variants,

  // Slide in animation for description
  slideInFromBottom: {
    hidden: {
      opacity: 0,
      y: 40,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.8,
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
  } as Variants,

  // Button pop-in animation
  buttonPopIn: {
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 1.2,
        duration: 0.5,
        type: "spring",
        damping: 15,
        stiffness: 200,
      },
    },
  } as Variants,

  // Floating animation for decorative elements
  float: {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        ease: "easeInOut",
        repeat: Infinity,
      },
    },
  } as Variants,
};

// Utility function to split text into words for animation
export const splitTextIntoWords = (text: string): string[] => {
  return text.split(" ").filter(word => word.length > 0);
};

// Utility function to create animated word data
export interface AnimatedWordData {
  word: string;
  key: string;
  style: {
    color: string;
    display: string;
    marginRight: string;
  };
  className?: string;
}

export const createAnimatedWords = (
  text: string,
  color: string,
  className?: string
): AnimatedWordData[] => {
  return splitTextIntoWords(text).map((word, index) => ({
    word,
    key: `${word}-${index}`,
    style: {
      color,
      display: "inline-block",
      marginRight: "0.3em",
    },
    className,
  }));
};
