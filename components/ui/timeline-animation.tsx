"use client";
import { motion, useInView } from "framer-motion";
import { useRef, type ElementType } from "react";

type Props = {
  animationNum: number;
  timelineRef: React.RefObject<HTMLElement>;
  customVariants: any;
  className?: string;
  as?: ElementType;
  children: React.ReactNode;
};

/** Tiny scroll-triggered reveal — referenced by pricing-section-4. */
export function TimelineContent({
  animationNum,
  customVariants,
  className,
  as,
  children,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const Comp: any = motion[(as as keyof typeof motion) || "div"] || motion.div;

  return (
    <Comp
      ref={ref}
      custom={animationNum}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={customVariants}
      className={className}
    >
      {children}
    </Comp>
  );
}
