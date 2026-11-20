
import { useEffect, useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

const gridStyle = {
  backgroundImage:
    "linear-gradient(rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.07) 1px, transparent 1px)",
  backgroundSize: "64px 64px",
  maskImage: "radial-gradient(ellipse at 50% 45%, black 8%, transparent 78%)",
  WebkitMaskImage:
    "radial-gradient(ellipse at 50% 45%, black 8%, transparent 78%)",
};

const accentGridStyle = {
  backgroundImage:
    "linear-gradient(rgba(96,165,250,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.055) 1px, transparent 1px)",
  backgroundSize: "256px 256px",
  maskImage:
    "linear-gradient(to bottom, transparent 0%, black 16%, black 84%, transparent 100%)",
  WebkitMaskImage:
    "linear-gradient(to bottom, transparent 0%, black 16%, black 84%, transparent 100%)",
};

const orbOneStyle = {
  background:
    "radial-gradient(circle at center, rgba(37,99,235,0.42) 0%, rgba(37,99,235,0.16) 40%, transparent 70%)",
};

const orbTwoStyle = {
  background:
    "radial-gradient(circle at center, rgba(124,58,237,0.4) 0%, rgba(88,28,135,0.14) 42%, transparent 72%)",
};

const orbThreeStyle = {
  background:
    "radial-gradient(circle at center, rgba(14,165,233,0.26) 0%, rgba(59,130,246,0.1) 46%, transparent 72%)",
};

/**
 * Lightweight canvas layer with drifting particles and proximity links.
 * It caps DPR, scales the particle count to the viewport, pauses when the
 * tab is hidden, and renders a single static frame for reduced motion.
 */
function ParticleNetwork() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerQuery = window.matchMedia("(pointer: fine)");
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);

    let width = 0;
    let height = 0;
    let particles = [];
    let frameId = 0;
    let resizeFrameId = 0;
    let lastFrame = 0;
    let running = !motionQuery.matches;
    let reduceMotion = motionQuery.matches;
    const pointer = { x: -9999, y: -9999, active: false };

    const makeGlowSprite = (rgb) => {
      const sprite = document.createElement("canvas");
      sprite.width = 64;
      sprite.height = 64;

      const spriteCtx = sprite.getContext("2d");
      if (!spriteCtx) return sprite;

      const gradient = spriteCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, `rgba(${rgb},0.95)`);
      gradient.addColorStop(0.24, `rgba(${rgb},0.38)`);
      gradient.addColorStop(1, `rgba(${rgb},0)`);
      spriteCtx.fillStyle = gradient;
      spriteCtx.fillRect(0, 0, 64, 64);

      return sprite;
    };

    const sprites = [
      makeGlowSprite("56,189,248"),
      makeGlowSprite("129,140,248"),
      makeGlowSprite("167,139,250"),
    ];

    const getParticleCount = () => {
      if (width < 640) return 16;
      if (width < 1024) return 28;
      return 44;
    };

    const createParticle = () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.06 + Math.random() * 0.13;

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 0.8 + Math.random() * 1.1,
        sprite: sprites[Math.floor(Math.random() * sprites.length)],
        phase: Math.random() * Math.PI * 2,
      };
    };

    const resetParticles = () => {
      particles = Array.from({ length: getParticleCount() }, createParticle);
    };

    const paint = (time, animate, delta = 1) => {
      ctx.clearRect(0, 0, width, height);

      const maxDistance = width < 640 ? 96 : 132;
      const maxDistanceSq = maxDistance * maxDistance;

      if (animate) {
        for (const particle of particles) {
          particle.x += particle.vx * delta;
          particle.y += particle.vy * delta;

          if (pointer.active) {
            const dx = particle.x - pointer.x;
            const dy = particle.y - pointer.y;
            const distanceSq = dx * dx + dy * dy;

            if (distanceSq > 0.01 && distanceSq < 140 * 140) {
              const distance = Math.sqrt(distanceSq);
              const force = (1 - distance / 140) * 0.06 * delta;
              particle.x += (dx / distance) * force;
              particle.y += (dy / distance) * force;
            }
          }

          if (particle.x < -24) particle.x = width + 24;
          else if (particle.x > width + 24) particle.x = -24;

          if (particle.y < -24) particle.y = height + 24;
          else if (particle.y > height + 24) particle.y = -24;
        }
      }

      ctx.lineWidth = 0.7;

      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i];

        for (let j = i + 1; j < particles.length; j += 1) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distanceSq = dx * dx + dy * dy;

          if (distanceSq < maxDistanceSq) {
            const alpha =
              (1 - Math.sqrt(distanceSq) / maxDistance) * 0.22;
            ctx.strokeStyle = `rgba(129,140,248,${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const particle of particles) {
        const twinkle = animate
          ? 0.66 + Math.sin(time * 0.0012 + particle.phase) * 0.22
          : 0.75;
        const size = particle.radius * 12;

        ctx.globalAlpha = twinkle;
        ctx.drawImage(
          particle.sprite,
          particle.x - size / 2,
          particle.y - size / 2,
          size,
          size
        );
      }

      ctx.globalAlpha = 1;
    };

    const loop = (time) => {
      if (!running) return;

      const delta = lastFrame
        ? Math.min((time - lastFrame) / 16.667, 2.5)
        : 1;
      lastFrame = time;
      paint(time, true, delta);
      frameId = window.requestAnimationFrame(loop);
    };

    const start = () => {
      if (reduceMotion || running) return;
      running = true;
      lastFrame = 0;
      frameId = window.requestAnimationFrame(loop);
    };

    const stop = () => {
      running = false;
      window.cancelAnimationFrame(frameId);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(rect.width, 1);
      height = Math.max(rect.height, 1);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      resetParticles();

      if (reduceMotion) paint(0, false);
    };

    const scheduleResize = () => {
      window.cancelAnimationFrame(resizeFrameId);
      resizeFrameId = window.requestAnimationFrame(resize);
    };

    const onPointerMove = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };

    const onMotionPreferenceChange = () => {
      reduceMotion = motionQuery.matches;

      if (reduceMotion) {
        stop();
        paint(0, false);
      } else {
        start();
      }
    };

    resize();

    if (!reduceMotion) {
      frameId = window.requestAnimationFrame(loop);
    }

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(scheduleResize);
      resizeObserver.observe(canvas);
    } else {
      window.addEventListener("resize", scheduleResize);
    }

    if (pointerQuery.matches) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.addEventListener("pointerleave", onPointerLeave);
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    motionQuery.addEventListener("change", onMotionPreferenceChange);

    return () => {
      stop();
      window.cancelAnimationFrame(resizeFrameId);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", scheduleResize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motionQuery.removeEventListener("change", onMotionPreferenceChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full opacity-80"
    />
  );
}

export default function FuturisticBackground() {
  const reduceMotion = useReducedMotion();

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const glowX = useMotionValue(-900);
  const glowY = useMotionValue(-900);

  const smoothX = useSpring(pointerX, {
    stiffness: 45,
    damping: 20,
    mass: 0.6,
  });
  const smoothY = useSpring(pointerY, {
    stiffness: 45,
    damping: 20,
    mass: 0.6,
  });
  const smoothGlowX = useSpring(glowX, {
    stiffness: 55,
    damping: 24,
    mass: 0.7,
  });
  const smoothGlowY = useSpring(glowY, {
    stiffness: 55,
    damping: 24,
    mass: 0.7,
  });

  const orbOneX = useTransform(smoothX, [-0.5, 0.5], [26, -26]);
  const orbOneY = useTransform(smoothY, [-0.5, 0.5], [18, -18]);
  const orbTwoX = useTransform(smoothX, [-0.5, 0.5], [-20, 20]);
  const orbTwoY = useTransform(smoothY, [-0.5, 0.5], [-14, 14]);
  const orbThreeX = useTransform(smoothX, [-0.5, 0.5], [14, -14]);
  const orbThreeY = useTransform(smoothY, [-0.5, 0.5], [10, -10]);
  const circuitX = useTransform(smoothX, [-0.5, 0.5], [10, -10]);
  const circuitY = useTransform(smoothY, [-0.5, 0.5], [8, -8]);
  const shapeX = useTransform(smoothX, [-0.5, 0.5], [-14, 14]);
  const shapeY = useTransform(smoothY, [-0.5, 0.5], [-10, 10]);

  const mouseGlow = useMotionTemplate`radial-gradient(560px circle at ${smoothGlowX}px ${smoothGlowY}px, rgba(56,189,248,0.1), rgba(139,92,246,0.07) 42%, transparent 72%)`;

  useEffect(() => {
    if (reduceMotion) return undefined;
    if (!window.matchMedia("(pointer: fine)").matches) return undefined;

    const handlePointerMove = (event) => {
      pointerX.set(event.clientX / window.innerWidth - 0.5);
      pointerY.set(event.clientY / window.innerHeight - 0.5);
      glowX.set(event.clientX);
      glowY.set(event.clientY);
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [reduceMotion, pointerX, pointerY, glowX, glowY]);

  const parallax = (x, y) => (reduceMotion ? undefined : { x, y });

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Base navy-to-black wash */}
      <div className="absolute inset-0 bg-[#04060f]" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% -18%, #0b1836 0%, #060b1c 46%, #02040a 100%)",
        }}
      />

      {/* Digital grid */}
      <div className="absolute inset-0 opacity-70" style={gridStyle} />
      <div
        className="grid-pan absolute inset-0 opacity-60"
        style={accentGridStyle}
      />

      {/* Animated blue and violet light pools */}
      <motion.div
        style={parallax(orbOneX, orbOneY)}
        className="absolute -left-[20%] -top-[30%] h-[36rem] w-[36rem] sm:h-[48rem] sm:w-[48rem] lg:h-[56rem] lg:w-[56rem]"
      >
        <div
          className="aurora-orb aurora-orb--one h-full w-full rounded-full opacity-90"
          style={orbOneStyle}
        />
      </motion.div>

      <motion.div
        style={parallax(orbTwoX, orbTwoY)}
        className="absolute -right-[24%] top-[10%] h-[30rem] w-[30rem] sm:h-[42rem] sm:w-[42rem]"
      >
        <div
          className="aurora-orb aurora-orb--two h-full w-full rounded-full opacity-90"
          style={orbTwoStyle}
        />
      </motion.div>

      <motion.div
        style={parallax(orbThreeX, orbThreeY)}
        className="absolute -bottom-[30%] left-[16%] h-[32rem] w-[32rem] sm:h-[44rem] sm:w-[44rem]"
      >
        <div
          className="aurora-orb aurora-orb--three h-full w-full rounded-full opacity-80"
          style={orbThreeStyle}
        />
      </motion.div>

      {/* Floating particles and connected nodes */}
      <ParticleNetwork />

      {/* Circuit traces */}
      <motion.div
        style={parallax(circuitX, circuitY)}
        className="absolute inset-0"
      >
        <svg
          className="absolute -left-10 top-24 hidden w-[24rem] opacity-60 md:block"
          viewBox="0 0 380 260"
          fill="none"
        >
          <defs>
            <linearGradient
              id="circuit-a"
              x1="0"
              y1="0"
              x2="1"
              y2="0.65"
            >
              <stop stopColor="#38bdf8" stopOpacity="0" />
              <stop offset="0.42" stopColor="#60a5fa" stopOpacity="0.55" />
              <stop offset="1" stopColor="#a78bfa" stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <g
            stroke="url(#circuit-a)"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              className="circuit-line"
              d="M0 58H82L122 98H222L258 62H380"
            />
            <path
              className="circuit-line circuit-line--slow"
              d="M122 98V158L158 194H276"
            />
            <path className="circuit-line" d="M82 58V22L104 0" />
            <path className="circuit-line" d="M222 98L256 132H342" />
            <path className="circuit-line" d="M158 194V230" />
          </g>
          <g fill="#67e8f9">
            <circle className="circuit-node" cx="122" cy="98" r="2.6" />
            <circle className="circuit-node" cx="222" cy="98" r="2" />
            <circle className="circuit-node" cx="258" cy="62" r="2.4" />
            <circle className="circuit-node" cx="276" cy="194" r="2.2" />
            <circle className="circuit-node" cx="342" cy="132" r="2" />
          </g>
          <g stroke="#a78bfa" strokeOpacity="0.45">
            <rect x="116" y="92" width="12" height="12" rx="2" />
            <rect x="252" y="56" width="12" height="12" rx="2" />
          </g>
        </svg>

        <svg
          className="absolute -right-12 bottom-20 hidden w-[28rem] opacity-50 lg:block"
          viewBox="0 0 420 300"
          fill="none"
        >
          <defs>
            <linearGradient
              id="circuit-b"
              x1="1"
              y1="0"
              x2="0"
              y2="0.7"
            >
              <stop stopColor="#a78bfa" stopOpacity="0" />
              <stop offset="0.4" stopColor="#818cf8" stopOpacity="0.55" />
              <stop offset="1" stopColor="#22d3ee" stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <g
            stroke="url(#circuit-b)"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              className="circuit-line"
              d="M420 62H338L298 102H196L156 142H28"
            />
            <path
              className="circuit-line circuit-line--slow"
              d="M298 102V172L260 210H118"
            />
            <path className="circuit-line" d="M196 102L160 66H54" />
            <path className="circuit-line" d="M156 142V222L118 260H0" />
            <path className="circuit-line" d="M260 210L296 246H390" />
          </g>
          <g fill="#c4b5fd">
            <circle className="circuit-node" cx="298" cy="102" r="2.6" />
            <circle className="circuit-node" cx="196" cy="102" r="2" />
            <circle className="circuit-node" cx="156" cy="142" r="2.4" />
            <circle className="circuit-node" cx="260" cy="210" r="2.2" />
            <circle className="circuit-node" cx="118" cy="260" r="2" />
          </g>
          <g stroke="#67e8f9" strokeOpacity="0.35">
            <rect x="292" y="96" width="12" height="12" rx="2" />
            <rect x="150" y="136" width="12" height="12" rx="2" />
          </g>
        </svg>
      </motion.div>

      {/* Abstract geometric accents */}
      <motion.div
        style={parallax(shapeX, shapeY)}
        className="absolute inset-0"
      >
        <div className="absolute right-[6%] top-[18%] hidden h-48 w-48 lg:block">
          <div className="absolute inset-0 rounded-full border border-violet-400/20 shadow-[0_0_70px_rgba(124,58,237,0.12)]" />
          <div className="spin-slower absolute inset-4 rounded-full border border-dashed border-cyan-300/20" />
          <div className="absolute inset-12 rounded-full border border-blue-400/15" />
          <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.9)]" />
        </div>

        <svg
          className="float-slow absolute -left-8 bottom-[16%] hidden h-64 w-64 text-blue-400/15 sm:block"
          viewBox="0 0 200 200"
          fill="none"
        >
          <polygon
            points="100,10 173,52 173,148 100,190 27,148 27,52"
            stroke="currentColor"
            strokeWidth="1"
          />
          <polygon
            points="100,34 154,64 154,136 100,166 46,136 46,64"
            stroke="currentColor"
            strokeWidth="0.6"
            strokeDasharray="3 8"
          />
          <circle cx="100" cy="10" r="3" fill="rgba(96,165,250,0.55)" />
          <circle cx="173" cy="148" r="2.2" fill="rgba(167,139,250,0.5)" />
        </svg>

        <div className="absolute left-[11%] top-[22%] hidden h-20 w-20 rotate-45 border border-violet-400/15 lg:block">
          <span className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-violet-300/80 shadow-[0_0_10px_rgba(196,181,253,0.8)]" />
        </div>
      </motion.div>

      {/* Soft light that follows the cursor */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 hidden md:block"
        style={{ background: mouseGlow }}
      />

      {/* Readability scrims and texture */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, rgba(2,4,10,0.16) 58%, rgba(2,4,10,0.72) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(2,4,10,0.18) 0%, transparent 22%, transparent 72%, rgba(2,4,10,0.5) 100%)",
        }}
      />
      <div className="futuristic-noise absolute inset-0 opacity-[0.03]" />
    </div>
  );
}
