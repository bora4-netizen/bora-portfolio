
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Modern parallax wrapper.
 * Shifts children vertically with a subtle transform as the element scrolls
 * through the viewport. Movement is restrained so it never feels distracting.
 */
export default function Parallax({
  children,
  from = 30,
  to = -30,
  className = "",
}) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [from, to]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={reduceMotion ? undefined : { y }}>
        {children}
      </motion.div>
    </div>
  );
}
