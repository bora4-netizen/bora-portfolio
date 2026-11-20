import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";

const MotionLink = motion.create(Link);

const base =
  "group relative inline-flex cursor-pointer select-none items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-xl font-semibold tracking-[0.01em] transform-gpu " +
  "transition-[color,background-color,border-color,box-shadow,filter] duration-300 ease-out " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060f] " +
  "disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary:
    "btn-primary-shift border border-white/10 text-white " +
    "shadow-[0_10px_35px_-12px_rgba(37,99,235,0.95),0_0_22px_-8px_rgba(124,58,237,0.85)] " +
    "hover:border-white/20 hover:shadow-[0_16px_50px_-10px_rgba(37,99,235,1),0_0_38px_-4px_rgba(124,58,237,0.95)] " +
    "active:shadow-[0_6px_22px_-10px_rgba(37,99,235,0.9)]",
  outline:
    "border border-blue-400/35 bg-white/[0.035] text-slate-100 backdrop-blur-md " +
    "shadow-[0_0_20px_-10px_rgba(59,130,246,0.5),inset_0_0_18px_rgba(59,130,246,0.05)] " +
    "hover:bg-blue-500/[0.08] hover:text-white " +
    "hover:shadow-[0_0_0_1px_rgba(103,232,249,0.15),0_0_32px_rgba(59,130,246,0.34),inset_0_0_24px_rgba(59,130,246,0.08)]",
  gradient:
    "btn-gradient-shift border border-violet-300/20 text-white " +
    "shadow-[0_10px_35px_-12px_rgba(124,58,237,0.95),0_0_24px_-8px_rgba(168,85,247,0.8)] " +
    "hover:border-violet-200/30 " +
    "hover:shadow-[0_16px_50px_-10px_rgba(124,58,237,1),0_0_42px_-4px_rgba(168,85,247,0.95)]",
  ghost:
    "border border-white/10 bg-white/[0.035] text-slate-300 backdrop-blur-sm " +
    "hover:border-blue-400/45 hover:bg-blue-500/[0.08] hover:text-white " +
    "hover:shadow-[0_0_26px_-4px_rgba(59,130,246,0.4)]",
};

const sizes = {
  sm: "min-h-10 rounded-lg px-4 py-2 text-sm",
  md: "min-h-12 px-6 py-3 text-sm sm:text-base",
  lg: "min-h-[3.25rem] px-7 py-3.5 text-base",
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * Reusable futuristic CTA.
 *
 * Renders an <a>, a React Router <Link>, or a <button> depending on the
 * props provided. The magnetic movement, spotlight and border animation are
 * all disabled automatically for visitors who prefer reduced motion.
 */
export default function FuturisticButton({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconRight = false,
  className = "",
  to,
  href,
  type = "button",
  disabled = false,
  style,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  ...props
}) {
  const reduceMotion = useReducedMotion();
  const elementRef = useRef(null);

  const magneticX = useMotionValue(0);
  const magneticY = useMotionValue(0);

  const x = useSpring(magneticX, {
    stiffness: 320,
    damping: 20,
    mass: 0.35,
  });
  const y = useSpring(magneticY, {
    stiffness: 320,
    damping: 20,
    mass: 0.35,
  });

  const updateSpotlight = (event) => {
    const node = elementRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    node.style.setProperty("--btn-x", `${event.clientX - rect.left}px`);
    node.style.setProperty("--btn-y", `${event.clientY - rect.top}px`);
  };

  const handlePointerEnter = (event) => {
    updateSpotlight(event);
    onPointerEnter?.(event);
  };

  const handlePointerMove = (event) => {
    updateSpotlight(event);

    if (
      !reduceMotion &&
      event.pointerType === "mouse" &&
      elementRef.current
    ) {
      const rect = elementRef.current.getBoundingClientRect();
      const offsetX = event.clientX - rect.left - rect.width / 2;
      const offsetY = event.clientY - rect.top - rect.height / 2;

      magneticX.set(clamp(offsetX * 0.14, -7, 7));
      magneticY.set(clamp(offsetY * 0.18, -5, 5));
    }

    onPointerMove?.(event);
  };

  const handlePointerLeave = (event) => {
    magneticX.set(0);
    magneticY.set(0);
    onPointerLeave?.(event);
  };

  const classes = `${base} ${variants[variant] ?? variants.primary} ${
    sizes[size] ?? sizes.md
  } ${className}`;

  const motionProps = {
    ref: elementRef,
    className: classes,
    style: { ...style, x, y },
    whileHover: reduceMotion ? undefined : { scale: 1.03 },
    whileTap: reduceMotion ? undefined : { scale: 0.965 },
    transition: { type: "spring", stiffness: 380, damping: 24 },
    onPointerEnter: handlePointerEnter,
    onPointerMove: handlePointerMove,
    onPointerLeave: handlePointerLeave,
  };

  const content = (
    <>
      <span aria-hidden="true" className="btn-border-glow" />
      <span aria-hidden="true" className="btn-cursor-glow" />

      {Icon && !iconRight && (
        <Icon
          size={size === "sm" ? 16 : 18}
          aria-hidden="true"
          className="relative z-10"
        />
      )}
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
      </span>
      {Icon && iconRight && (
        <Icon
          size={size === "sm" ? 16 : 18}
          aria-hidden="true"
          className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5"
        />
      )}
    </>
  );

  if (to) {
    return (
      <MotionLink to={to} {...motionProps} {...props}>
        {content}
      </MotionLink>
    );
  }

  if (href) {
    return (
      <motion.a href={href} {...motionProps} {...props}>
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      {...motionProps}
      {...props}
    >
      {content}
    </motion.button>
  );
}
