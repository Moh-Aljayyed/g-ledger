"use client";

import { ScrollAnimate } from "./scroll-animate";
import { ReactNode } from "react";

export function AnimatedSection({ children, animation = "fadeUp", delay = 0, className = "" }: {
  children: ReactNode;
  animation?: "fadeUp" | "fadeLeft" | "fadeRight" | "scaleUp" | "slideUp";
  delay?: number;
  className?: string;
}) {
  return (
    <ScrollAnimate animation={animation} delay={delay} className={className}>
      {children}
    </ScrollAnimate>
  );
}

export function AnimatedCard({ children, delay = 0, className = "" }: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <ScrollAnimate animation="scaleUp" delay={delay} className={`card-3d card-shine ${className}`}>
      {children}
    </ScrollAnimate>
  );
}

export function FloatingElement({ children, speed = "normal", className = "" }: {
  children: ReactNode;
  speed?: "slow" | "normal" | "delayed";
  className?: string;
}) {
  const animClass = speed === "slow" ? "animate-float-slow" : speed === "delayed" ? "animate-float-delay" : "animate-float";
  return <div className={`${animClass} ${className}`}>{children}</div>;
}
