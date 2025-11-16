// Theme utilities for consistent dark theme across all pages - Swiggy/Zomato inspired

export const themeClasses = {
  // Backgrounds
  background: 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950',
  backgroundAlt: 'bg-slate-800/60',
  backgroundCard: 'bg-white/5',
  
  // Text Colors
  textPrimary: 'text-white',
  textSecondary: 'text-slate-300',
  textTertiary: 'text-slate-400',
  textMuted: 'text-slate-500',
  
  // Borders
  border: 'border-slate-700/30',
  borderAlt: 'border-slate-600/50',
  
  // Buttons
  buttonPrimary: 'bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-lg shadow-orange-500/30',
  buttonSecondary: 'bg-slate-700/80 hover:bg-slate-600/80 text-slate-200 backdrop-blur',
  buttonGradient: 'bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:via-orange-700 hover:to-amber-600 text-white font-medium shadow-xl shadow-orange-500/40',
  
  // Cards
  card: 'bg-white/[0.08] backdrop-blur-sm rounded-2xl border border-white/10 hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300',
  cardDark: 'bg-slate-800/40 backdrop-blur rounded-xl border border-slate-700/50',
  
  // Section spacing
  section: 'py-16 px-4',
  container: 'container mx-auto max-w-7xl',
  
  // Effects
  glass: 'bg-white/[0.05] backdrop-blur-lg border border-white/10',
  shadow: 'shadow-xl hover:shadow-2xl transition-shadow duration-300',
  glow: (color: 'orange' | 'amber' | 'yellow' = 'orange') => {
    const glows = {
      orange: 'shadow-2xl shadow-orange-500/30',
      amber: 'shadow-2xl shadow-amber-500/30',
      yellow: 'shadow-2xl shadow-yellow-500/30',
    };
    return glows[color];
  },
};

export const animations = {
  containerVariants: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  },
  
  itemVariants: {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] // Custom easing
      },
    },
  },
  
  cardHoverVariants: {
    rest: { 
      scale: 1, 
      y: 0,
      rotateX: 0,
    },
    hover: {
      scale: 1.03,
      y: -12,
      rotateX: 5,
      transition: { 
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      },
    },
  },
  
  fadeInVariants: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        duration: 0.8,
        ease: "easeOut"
      } 
    },
  },
  
  slideInVariants: {
    hidden: { opacity: 0, x: -40 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { 
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1]
      } 
    },
  },
  
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
  },
  
  slideUp: {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1]
      }
    },
  },
};

// Responsive utility for hiding/showing elements
export const responsive = {
  hideOnMobile: 'hidden md:block',
  showOnMobile: 'md:hidden',
  hideOnTablet: 'hidden lg:block',
  showOnTablet: 'lg:hidden',
};
