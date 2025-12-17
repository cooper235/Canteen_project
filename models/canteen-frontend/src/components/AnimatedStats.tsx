'use client';

import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { ShoppingBag, Users, Star, TrendingUp } from 'lucide-react';

interface StatProps {
  end: number;
  duration?: number;
  label: string;
  icon: React.ReactNode;
  suffix?: string;
  prefix?: string;
}

function AnimatedCounter({ end, duration = 2, label, icon, suffix = '', prefix = '' }: StatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (isInView) {
      motionValue.set(end);
    }
  }, [motionValue, isInView, end]);

  useEffect(() => {
    springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = prefix + Intl.NumberFormat('en-US').format(Math.floor(latest)) + suffix;
      }
    });
  }, [springValue, prefix, suffix]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="bg-white/[0.08] backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 group"
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="bg-gradient-to-r from-orange-500 to-amber-500 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/50 group-hover:shadow-orange-500/70"
      >
        {icon}
      </motion.div>
      <div
        ref={ref}
        className="text-4xl md:text-5xl font-black text-white mb-2 group-hover:text-orange-400 transition-colors"
      >
        0
      </div>
      <div className="text-slate-400 font-medium">{label}</div>
    </motion.div>
  );
}

export function AnimatedStats() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Trusted by <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Thousands</span>
          </h2>
          <p className="text-slate-400 text-lg">Join our growing community of food lovers</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <AnimatedCounter
            end={150}
            label="Delicious Dishes"
            suffix="+"
            icon={<ShoppingBag size={32} className="text-white" />}
          />
          <AnimatedCounter
            end={12}
            label="Campus Canteens"
            suffix="+"
            icon={<TrendingUp size={32} className="text-white" />}
          />
          <AnimatedCounter
            end={2500}
            label="Happy Students"
            suffix="+"
            icon={<Users size={32} className="text-white" />}
          />
          <AnimatedCounter
            end={4.5}
            label="Average Rating"
            icon={<Star size={32} className="text-white" fill="currentColor" />}
          />
        </div>
      </div>
    </section>
  );
}
