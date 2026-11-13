
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

// Wraps decorative content and shifts it vertically as the user scrolls,
// creating a parallax depth effect. `from`/`to` are pixel offsets mapped
// to the element entering and leaving the viewport.
export default function Parallax({
  children,
  from = 60,
  to = -60,
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
