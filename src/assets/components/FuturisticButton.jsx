
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

const MotionLink = motion.create(Link);

const base =
  "group relative inline-flex cursor-pointer select-none items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-xl font-semibold tracking-[0.01em] " +
  "transition-[color,background-color,border-color,box-shadow,filter] duration-300 ease-out " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060f] " +
  "disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary:
    "btn-sheen border border-white/10 bg-[linear-gradient(115deg,#2563eb_0%,#4f46e5_48%,#7c3aed_100%)] text-white " +
    "shadow-[0_10px_35px_-12px_rgba(37,99,235,0.95),0_0_22px_-8px_rgba(124,58,237,0.85)] " +
    "hover:border-white/20 hover:shadow-[0_14px_45px_-10px_rgba(37,99,235,1),0_0_34px_-4px_rgba(124,58,237,0.95)] " +
    "active:shadow-[0_6px_22px_-10px_rgba(37,99,235,0.9)]",
  outline:
    "btn-glow-border border border-blue-400/35 bg-white/[0.035] text-slate-100 backdrop-blur-md " +
    "shadow-[0_0_20px_-10px_rgba(59,130,246,0.5),inset_0_0_18px_rgba(59,130,246,0.05)] " +
    "hover:bg-blue-500/[0.08] hover:text-white " +
    "hover:shadow-[0_0_0_1px_rgba(103,232,249,0.15),0_0_26px_rgba(59,130,246,0.3),inset_0_0_24px_rgba(59,130,246,0.08)]",
  gradient:
    "btn-sheen btn-gradient-shift border border-violet-300/20 text-white " +
    "shadow-[0_10px_35px_-12px_rgba(124,58,237,0.95),0_0_24px_-8px_rgba(168,85,247,0.8)] " +
    "hover:border-violet-200/30 " +
    "hover:shadow-[0_14px_45px_-10px_rgba(124,58,237,1),0_0_38px_-4px_rgba(168,85,247,0.95)]",
  ghost:
    "border border-white/10 bg-white/[0.035] text-slate-300 backdrop-blur-sm " +
    "hover:border-blue-400/45 hover:bg-blue-500/[0.08] hover:text-white " +
    "hover:shadow-[0_0_22px_-4px_rgba(59,130,246,0.35)]",
};

const sizes = {
  sm: "min-h-10 rounded-lg px-4 py-2 text-sm",
  md: "min-h-12 px-6 py-3 text-sm sm:text-base",
  lg: "min-h-[3.25rem] px-7 py-3.5 text-base",
};

/**
 * Reusable futuristic CTA.
 *
 * Renders an <a>, a React Router <Link>, or a <button> depending on the
 * props provided. All motion is disabled automatically for visitors who
 * prefer reduced motion.
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
  ...props
}) {
  const reduceMotion = useReducedMotion();

  const classes = `${base} ${variants[variant] ?? variants.primary} ${
    sizes[size] ?? sizes.md
  } ${className}`;

  const motionProps = {
    whileHover: reduceMotion ? undefined : { y: -2, scale: 1.025 },
    whileTap: reduceMotion ? undefined : { scale: 0.97 },
    transition: { type: "spring", stiffness: 380, damping: 24 },
  };

  const content = (
    <>
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
      <MotionLink to={to} className={classes} {...motionProps} {...props}>
        {content}
      </MotionLink>
    );
  }

  if (href) {
    return (
      <motion.a href={href} className={classes} {...motionProps} {...props}>
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      className={classes}
      {...motionProps}
      {...props}
    >
      {content}
    </motion.button>
  );
}
