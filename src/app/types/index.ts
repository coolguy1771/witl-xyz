export interface Project {
  title: string;
  description: string;
  tech: string[];
  link: string;
  githubUrl?: string;
}

export interface AnimationProps {
  initial?: string | object;
  animate?: string | object;
  exit?: string | object;
  variants?: {
    initial?: object;
    animate?: object;
    exit?: object;
  };
  transition?: {
    type?: string;
    damping?: number;
    stiffness?: number;
    duration?: number;
    delay?: number;
  };
}

export interface SEOProps {
  title: string;
  description: string;
  ogImage?: string;
  canonical?: string;
}

export interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}
