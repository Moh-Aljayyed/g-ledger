"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface ScrollAnimateProps {
  children: ReactNode;
  animation?: "fadeUp" | "fadeLeft" | "fadeRight" | "scaleUp" | "slideUp";
  delay?: number;
  className?: string;
}

export function ScrollAnimate({ children, animation = "fadeUp", delay = 0, className = "" }: ScrollAnimateProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  const animations: Record<string, string> = {
    fadeUp: `transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`,
    fadeLeft: `transition-all duration-700 ease-out ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`,
    fadeRight: `transition-all duration-700 ease-out ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`,
    scaleUp: `transition-all duration-700 ease-out ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`,
    slideUp: `transition-all duration-500 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`,
  };

  return (
    <div ref={ref} className={`${animations[animation]} ${className}`}>
      {children}
    </div>
  );
}
