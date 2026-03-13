import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  threshold?: number;
  delay?: number;
  className?: string;
  width?: 'full' | 'auto'; 
}

export const Reveal: React.FC<RevealProps> = ({ 
  children, 
  threshold = 0.1, 
  delay = 0, 
  className = "",
  width = 'full'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: threshold,
        // Trigger slightly earlier on mobile to avoid blank space while scrolling fast
        rootMargin: "0px 0px -10% 0px"
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  const transitionDelay = `${delay}s`;

  return (
    <div 
      ref={ref} 
      className={`${width === 'full' ? 'w-full' : 'w-auto'} ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        // Reduced from 50px to 30px for lighter paint cost on mobile
        transform: isVisible ? 'translateY(0) translateZ(0)' : 'translateY(30px) translateZ(0)',
        // Hint to browser to optimize this layer
        willChange: 'opacity, transform',
        transition: `opacity 1s cubic-bezier(0.16, 1, 0.3, 1) ${transitionDelay}, transform 1s cubic-bezier(0.16, 1, 0.3, 1) ${transitionDelay}`
      }}
    >
      {children}
    </div>
  );
};