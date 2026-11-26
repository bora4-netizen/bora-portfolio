import {
  Component,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function createGlowTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.25, "rgba(255,236,190,0.8)");
  gradient.addColorStop(0.55, "rgba(255,180,90,0.22)");
  gradient.addColorStop(1, "rgba(255,150,60,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
}

function createEarthTexture() {
  const width = 512;
  const height = 256;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  const ocean = ctx.createLinearGradient(0, 0, 0, height);
  ocean.addColorStop(0, "#0a2a5e");
  ocean.addColorStop(0.5, "#12489c");
  ocean.addColorStop(1, "#0a2a5e");
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, width, height);

  let seed = 1;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const landColors = ["#2f7d32", "#3f9142", "#6b8e23", "#8a7a3c"];
  for (let c = 0; c < 7; c += 1) {
    const cx = random() * width;
    const cy = height * 0.2 + random() * height * 0.6;
    const blobs = 14 + Math.floor(random() * 12);

    for (let b = 0; b < blobs; b += 1) {
      const angle = random() * Math.PI * 2;
      const dist = random() * 46;
      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist * 0.6;
      const r = 6 + random() * 16;

      ctx.beginPath();
      ctx.fillStyle = landColors[Math.floor(random() * landColors.length)];
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.fillStyle = "rgba(245,250,255,0.95)";
  ctx.fillRect(0, 0, width, 14);
  ctx.fillRect(0, height - 14, width, 14);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;

  return texture;
}

function createBandedTexture(colors) {
  const width = 256;
  const height = 128;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  const bandHeight = height / colors.length;
  colors.forEach((color, index) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, index * bandHeight, width, bandHeight + 1);
  });

  let seed = 7;
  const random = () => {
    seed = (seed * 48271) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < 60; i += 1) {
    ctx.fillStyle = `rgba(255,255,255,${0.03 + random() * 0.05})`;
    ctx.fillRect(0, random() * height, width, 1 + random() * 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;

  return texture;
}

function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);

      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

function createSeededRandom(seed) {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);

    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

/* -------------------------------------------------------------------------- */
/* Atmosphere rim shader                                                      */
/* -------------------------------------------------------------------------- */

const ATMO_VERTEX = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const ATMO_FRAGMENT = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    float fresnel = pow(
      1.0 - clamp(dot(normalize(vNormal), normalize(vViewPosition)), 0.0, 1.0),
      2.6
    );
    vec3 color = mix(vec3(0.15, 0.45, 1.0), vec3(0.6, 0.85, 1.0), fresnel);
    gl_FragColor = vec4(color, fresnel * 0.9);
  }
`;

/* -------------------------------------------------------------------------- */
/* Sun surface shaders                                                        */
/* -------------------------------------------------------------------------- */

const SUN_VERTEX = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vPos;

  void main() {
    vPos = position;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const SUN_FRAGMENT = `
  uniform float uTime;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vPos;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i + vec3(0, 0, 0)), hash(i + vec3(1, 0, 0)), f.x),
          mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x),
          mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
      f.z);
  }

  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 p = normalize(vPos);
    float t = uTime * 0.22;

    float n1 = fbm(p * 3.0 + vec3(0.0, 0.0, t));
    float n2 = fbm(p * 6.5 - vec3(t * 0.7, t * 0.4, 0.0));
    float plasma = n1 * 0.62 + n2 * 0.38;

    vec3 deep = vec3(1.0, 0.42, 0.08);
    vec3 mid = vec3(1.0, 0.74, 0.24);
    vec3 hot = vec3(1.0, 0.96, 0.78);

    vec3 color = mix(deep, mid, smoothstep(0.18, 0.58, plasma));
    color = mix(color, hot, smoothstep(0.54, 0.92, plasma));

    float fresnel = pow(
      1.0 - clamp(dot(normalize(vNormal), normalize(vViewPosition)), 0.0, 1.0),
      2.0
    );
    color += vec3(1.0, 0.55, 0.18) * fresnel * 0.7;
    color *= 0.82 + 0.34 * plasma;

    gl_FragColor = vec4(color, 1.0);
  }
`;

/* -------------------------------------------------------------------------- */
/* Planet data                                                                */
/* -------------------------------------------------------------------------- */

const PLANETS = [
  { name: "Mercury", radius: 1.5, size: 0.09, color: "#9c8b7a", speed: 1.62, roughness: 0.95 },
  { name: "Venus", radius: 1.95, size: 0.15, color: "#d9a066", speed: 1.18, roughness: 0.9 },
  { name: "Earth", radius: 2.4, size: 0.16, color: "#2f6fd0", speed: 1.0, roughness: 0.82, earth: true },
  { name: "Mars", radius: 2.85, size: 0.12, color: "#c1440e", speed: 0.8, roughness: 0.95 },
  {
    name: "Jupiter",
    radius: 3.6,
    size: 0.33,
    speed: 0.44,
    roughness: 0.9,
    bands: ["#d8a47f", "#c98f63", "#e6c39a", "#b97f52", "#e0b98f"],
  },
  {
    name: "Saturn",
    radius: 4.35,
    size: 0.27,
    speed: 0.32,
    roughness: 0.9,
    bands: ["#e3c9a0", "#d8b98a", "#efe0c0", "#cbaa78"],
    ring: true,
  },
  { name: "Uranus", radius: 4.85, size: 0.19, color: "#9fe3e3", speed: 0.22, roughness: 0.85 },
  { name: "Neptune", radius: 5.3, size: 0.18, color: "#3b66d6", speed: 0.17, roughness: 0.85 },
];

/* -------------------------------------------------------------------------- */
/* Sun                                                                        */
/* -------------------------------------------------------------------------- */

function Sun({ texture, reducedMotion }) {
  const surfaceRef = useRef(null);
  const materialRef = useRef(null);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }

    if (reducedMotion || !surfaceRef.current) return;
    surfaceRef.current.rotation.y += delta * 0.05;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.4) * 0.015;
    surfaceRef.current.scale.setScalar(pulse);
  });

  return (
    <group>
      <pointLight color="#fff2cc" intensity={3.4} distance={0} decay={0} />

      <mesh ref={surfaceRef}>
        <sphereGeometry args={[1.05, 64, 64]} />
        <shaderMaterial
          ref={materialRef}
          uniforms={{ uTime: { value: 0 } }}
          vertexShader={SUN_VERTEX}
          fragmentShader={SUN_FRAGMENT}
        />
      </mesh>

      <sprite scale={[7.5, 7.5, 1]}>
        <spriteMaterial map={texture} color="#ff9d3c" transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      <sprite scale={[4.2, 4.2, 1]}>
        <spriteMaterial map={texture} color="#ffd98a" transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      <sprite scale={[2.4, 2.4, 1]}>
        <spriteMaterial map={texture} color="#fff6e0" transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Planet                                                                     */
/* -------------------------------------------------------------------------- */

function Planet({ config, reducedMotion, meshesRef, hoveredRef }) {
  const pivotRef = useRef(null);
  const bodyRef = useRef(null);
  const scaleRef = useRef(null);

  const texture = useMemo(() => {
    if (config.earth) return createEarthTexture();
    if (config.bands) return createBandedTexture(config.bands);
    return null;
  }, [config]);

  useEffect(() => () => texture?.dispose(), [texture]);

  useEffect(() => {
    const mesh = bodyRef.current;
    const meshes = meshesRef.current;

    if (mesh && !meshes.includes(mesh)) {
      mesh.userData.name = config.name;
      meshes.push(mesh);
    }

    return () => {
      if (!mesh) return;
      const index = meshes.indexOf(mesh);
      if (index >= 0) meshes.splice(index, 1);
    };
  }, [meshesRef, config.name]);

  useFrame((state, delta) => {
    if (scaleRef.current) {
      const target = hoveredRef.current === config.name ? 2.2 : 1;
      const next = THREE.MathUtils.damp(scaleRef.current.scale.x, target, 9, delta);
      scaleRef.current.scale.setScalar(next);
    }

    if (reducedMotion) return;

    if (pivotRef.current) {
      pivotRef.current.rotation.y = state.clock.elapsedTime * 0.22 * config.speed;
    }
    if (bodyRef.current) {
      bodyRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group ref={pivotRef}>
      <group ref={scaleRef} position={[config.radius, 0, 0]}>
        <mesh ref={bodyRef}>
          <sphereGeometry args={[config.size, 40, 40]} />
          <meshStandardMaterial
            map={texture ?? undefined}
            color={texture ? "#ffffff" : config.color}
            roughness={config.roughness ?? 0.9}
            metalness={0.05}
          />
        </mesh>

        {config.earth && (
          <mesh scale={1.15}>
            <sphereGeometry args={[config.size, 40, 40]} />
            <shaderMaterial
              vertexShader={ATMO_VERTEX}
              fragmentShader={ATMO_FRAGMENT}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}

        {config.ring && (
          <mesh rotation={[Math.PI / 2.4, 0, 0]}>
            <ringGeometry args={[config.size * 1.4, config.size * 2.3, 64]} />
            <meshBasicMaterial
              color="#e8d6b0"
              transparent
              opacity={0.55}
              side={THREE.DoubleSide}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Orbit paths                                                                */
/* -------------------------------------------------------------------------- */

function OrbitPaths() {
  return (
    <group>
      {PLANETS.map((planet) => (
        <mesh key={planet.name} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[planet.radius, 0.006, 6, 160]} />
          <meshBasicMaterial
            color="#3b82f6"
            transparent
            opacity={0.18}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Distant stars                                                              */
/* -------------------------------------------------------------------------- */

function DistantStars({ reducedMotion, count, texture, pointerRef }) {
  const groupRef = useRef(null);
  const materialRef = useRef(null);
  const brightMaterialRef = useRef(null);
  const smoothPointer = useRef({ x: 0, y: 0 });

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const random = createSeededRandom(777 + count);

    const palette = ["#ffffff", "#cfe3ff", "#a5b4fc", "#e9d5ff", "#fde68a"].map(
      (color) => new THREE.Color(color)
    );

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      positions[i3] = (random() - 0.5) * 32;
      positions[i3 + 1] = (random() - 0.5) * 20;
      positions[i3 + 2] = -8 - random() * 18;

      const color = palette[Math.floor(random() * palette.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    return geo;
  }, [count]);

  const brightGeometry = useMemo(() => {
    const brightCount = Math.round(count * 0.12);
    const positions = new Float32Array(brightCount * 3);
    const random = createSeededRandom(4242 + count);

    for (let i = 0; i < brightCount; i += 1) {
      const i3 = i * 3;
      positions[i3] = (random() - 0.5) * 30;
      positions[i3 + 1] = (random() - 0.5) * 18;
      positions[i3 + 2] = -6 - random() * 14;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    return geo;
  }, [count]);

  useEffect(
    () => () => {
      geometry.dispose();
      brightGeometry.dispose();
    },
    [geometry, brightGeometry]
  );

  useFrame((state, delta) => {
    const pointer = pointerRef.current;
    const smooth = smoothPointer.current;

    smooth.x = THREE.MathUtils.damp(smooth.x, pointer.tx, 1.0, delta);
    smooth.y = THREE.MathUtils.damp(smooth.y, pointer.ty, 1.0, delta);

    if (reducedMotion) return;

    const time = state.clock.elapsedTime;

    if (groupRef.current) {
      groupRef.current.position.x = smooth.x * 0.25;
      groupRef.current.position.y = smooth.y * 0.18;
      groupRef.current.rotation.z = time * 0.004;
    }

    if (materialRef.current) {
      materialRef.current.opacity = 0.85 + Math.sin(time * 0.9) * 0.1;
    }
    if (brightMaterialRef.current) {
      brightMaterialRef.current.opacity = 0.7 + Math.sin(time * 1.7) * 0.28;
    }
  });

  return (
    <group ref={groupRef}>
      <points geometry={geometry} frustumCulled={false}>
        <pointsMaterial
          ref={materialRef}
          map={texture}
          vertexColors
          size={0.08}
          sizeAttenuation
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>

      <points geometry={brightGeometry} frustumCulled={false}>
        <pointsMaterial
          ref={brightMaterialRef}
          map={texture}
          color="#ffffff"
          size={0.22}
          sizeAttenuation
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Scene                                                                      */
/* -------------------------------------------------------------------------- */

function Scene({ pointerRef, reducedMotion }) {
  const { size, camera } = useThree();
  const systemRef = useRef(null);
  const smoothPointer = useRef({ x: 0, y: 0 });
  const meshesRef = useRef([]);
  const hoveredRef = useRef(null);

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const pointerNdc = useMemo(() => new THREE.Vector2(), []);

  const isMobile = size.width < 768;
  const isTablet = size.width < 1024;

  const glowTexture = useMemo(() => createGlowTexture(), []);
  useEffect(() => () => glowTexture.dispose(), [glowTexture]);

  const starCount = isMobile ? 320 : isTablet ? 620 : 950;
  const systemScale = isMobile ? 0.6 : isTablet ? 0.74 : 0.86;

  useFrame((state, delta) => {
    const pointer = pointerRef.current;
    const smooth = smoothPointer.current;

    smooth.x = THREE.MathUtils.damp(smooth.x, pointer.tx, 1.6, delta);
    smooth.y = THREE.MathUtils.damp(smooth.y, pointer.ty, 1.6, delta);

    pointerNdc.set(pointer.tx, pointer.ty);
    raycaster.setFromCamera(pointerNdc, camera);
    const hits = raycaster.intersectObjects(meshesRef.current, false);
    hoveredRef.current = hits[0]?.object.userData.name ?? null;

    if (reducedMotion || !systemRef.current) return;

    systemRef.current.rotation.x = 0.5 + smooth.y * 0.14;
    systemRef.current.rotation.y = smooth.x * 0.22;
    systemRef.current.position.x = smooth.x * 0.25;
    systemRef.current.position.y = smooth.y * 0.18;
  });

  return (
    <>
      <DistantStars
        reducedMotion={reducedMotion}
        count={starCount}
        texture={glowTexture}
        pointerRef={pointerRef}
      />

      <ambientLight intensity={0.35} />

      <group ref={systemRef} rotation={[0.5, 0, 0]} scale={systemScale}>
        <Sun texture={glowTexture} reducedMotion={reducedMotion} />
        <OrbitPaths />
        {PLANETS.map((planet) => (
          <Planet
            key={planet.name}
            config={planet}
            reducedMotion={reducedMotion}
            meshesRef={meshesRef}
            hoveredRef={hoveredRef}
          />
        ))}
      </group>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Error boundary                                                             */
/* -------------------------------------------------------------------------- */

class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

function supportsWebGL() {
  if (typeof window === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/* Static CSS layers                                                          */
/* -------------------------------------------------------------------------- */

const gridStyle = {
  backgroundImage:
    "linear-gradient(rgba(148,163,184,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.04) 1px, transparent 1px)",
  backgroundSize: "84px 84px",
  maskImage: "radial-gradient(ellipse at 50% 45%, black 4%, transparent 70%)",
  WebkitMaskImage:
    "radial-gradient(ellipse at 50% 45%, black 4%, transparent 70%)",
};

const orbOneStyle = {
  background:
    "radial-gradient(circle at center, rgba(251,146,60,0.22) 0%, rgba(180,83,9,0.09) 42%, transparent 72%)",
};

const orbTwoStyle = {
  background:
    "radial-gradient(circle at center, rgba(59,130,246,0.26) 0%, rgba(37,99,235,0.09) 44%, transparent 74%)",
};

const orbThreeStyle = {
  background:
    "radial-gradient(circle at center, rgba(14,165,233,0.22) 0%, rgba(37,99,235,0.08) 48%, transparent 74%)",
};

/* -------------------------------------------------------------------------- */
/* Background                                                                 */
/* -------------------------------------------------------------------------- */

export default function FuturisticBackground() {
  const reduceMotion = useReducedMotion() ?? false;
  const isMobile = useMediaQuery("(max-width: 767px)");
  const webgl = useMemo(() => supportsWebGL(), []);

  const pointerRef = useRef({ tx: 0, ty: 0 });
  const hasPointer = useRef(false);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const glowX = useMotionValue(-1200);
  const glowY = useMotionValue(-1200);
  const glowAngle = useMotionValue(0);
  const lastPointer = useRef({ x: 0, y: 0 });

  const smoothX = useSpring(pointerX, {
    stiffness: 42,
    damping: 20,
    mass: 0.7,
  });
  const smoothY = useSpring(pointerY, {
    stiffness: 42,
    damping: 20,
    mass: 0.7,
  });
  const smoothGlowX = useSpring(glowX, {
    stiffness: 220,
    damping: 20,
    mass: 0.3,
  });
  const smoothGlowY = useSpring(glowY, {
    stiffness: 220,
    damping: 20,
    mass: 0.3,
  });

  const orbOneX = useTransform(smoothX, [-1, 1], [30, -30]);
  const orbOneY = useTransform(smoothY, [-1, 1], [20, -20]);
  const orbTwoX = useTransform(smoothX, [-1, 1], [-22, 22]);
  const orbTwoY = useTransform(smoothY, [-1, 1], [-15, 15]);
  const orbThreeX = useTransform(smoothX, [-1, 1], [15, -15]);
  const orbThreeY = useTransform(smoothY, [-1, 1], [11, -11]);

  const { scrollY } = useScroll();
  const sceneOpacity = useTransform(scrollY, [0, 480, 1000], [1, 0.72, 0.18]);

  useEffect(() => {
    if (reduceMotion) return undefined;
    if (!window.matchMedia("(pointer: fine)").matches) return undefined;

    const onPointerMove = (event) => {
      const nx = (event.clientX / window.innerWidth) * 2 - 1;
      const ny = -((event.clientY / window.innerHeight) * 2 - 1);

      pointerRef.current.tx = nx;
      pointerRef.current.ty = ny;
      pointerX.set(nx);
      pointerY.set(ny);

      if (!hasPointer.current) {
        hasPointer.current = true;
        smoothGlowX.jump(event.clientX);
        smoothGlowY.jump(event.clientY);
      }

      glowX.set(event.clientX);
      glowY.set(event.clientY);

      const dx = event.clientX - lastPointer.current.x;
      const dy = event.clientY - lastPointer.current.y;
      if (dx !== 0 || dy !== 0) {
        glowAngle.set((Math.atan2(dy, dx) * 180) / Math.PI);
      }
      lastPointer.current.x = event.clientX;
      lastPointer.current.y = event.clientY;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [reduceMotion, glowX, glowY, glowAngle, pointerX, pointerY, smoothGlowX, smoothGlowY]);

  const parallax = (x, y) => (reduceMotion ? undefined : { x, y });

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Base deep-space wash */}
      <div className="absolute inset-0 bg-[#03030b]" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% -10%, #0c0a24 0%, #060514 46%, #010106 100%)",
        }}
      />

      {/* Faint star grid */}
      <div className="absolute inset-0 opacity-40" style={gridStyle} />

      {/* Nebula light pools */}
      <motion.div
        style={parallax(orbOneX, orbOneY)}
        className="absolute -left-[22%] -top-[28%] h-[38rem] w-[38rem] sm:h-[52rem] sm:w-[52rem] lg:h-[60rem] lg:w-[60rem]"
      >
        <div className="aurora-orb aurora-orb--one h-full w-full rounded-full opacity-90" style={orbOneStyle} />
      </motion.div>

      <motion.div
        style={parallax(orbTwoX, orbTwoY)}
        className="absolute -right-[24%] top-[8%] h-[32rem] w-[32rem] sm:h-[44rem] sm:w-[44rem]"
      >
        <div className="aurora-orb aurora-orb--two h-full w-full rounded-full opacity-90" style={orbTwoStyle} />
      </motion.div>

      <motion.div
        style={parallax(orbThreeX, orbThreeY)}
        className="absolute -bottom-[30%] left-[14%] h-[34rem] w-[34rem] sm:h-[46rem] sm:w-[46rem]"
      >
        <div className="aurora-orb aurora-orb--three h-full w-full rounded-full opacity-80" style={orbThreeStyle} />
      </motion.div>

      {/* The 3D solar system. It fades back as the hero scrolls away. */}
      {webgl && (
        <motion.div
          className="absolute inset-0"
          style={{ opacity: reduceMotion ? 0.92 : sceneOpacity }}
        >
          <SceneErrorBoundary>
            <Canvas
              dpr={isMobile ? [1, 1.4] : [1, 1.75]}
              frameloop={reduceMotion ? "demand" : "always"}
              gl={{
                alpha: true,
                antialias: !isMobile,
                powerPreference: "high-performance",
              }}
              camera={{ position: [0, 0, 11], fov: 45, near: 0.1, far: 60 }}
              style={{ pointerEvents: "none" }}
              onCreated={({ gl }) => {
                gl.setClearColor(0x000000, 0);
                gl.toneMapping = THREE.ACESFilmicToneMapping;
                gl.toneMappingExposure = 1.1;
              }}
            >
              <Scene pointerRef={pointerRef} reducedMotion={reduceMotion} />
            </Canvas>
          </SceneErrorBoundary>
        </motion.div>
      )}

      {/* Missile that follows and points toward the cursor. Transform-only. */}
      {!reduceMotion && (
        <motion.div
          className="pointer-events-none absolute left-[-2rem] top-[-1rem] hidden h-8 w-16 md:block"
          style={{
            x: smoothGlowX,
            y: smoothGlowY,
            rotate: glowAngle,
            willChange: "transform",
          }}
        >
          <svg viewBox="0 0 72 28" className="h-full w-full overflow-visible">
            <path
              className="missile-flame"
              d="M12 14 L-8 7 L-3 14 L-8 21 Z"
              fill="#fb923c"
            />
            <path
              className="missile-flame missile-flame--inner"
              d="M12 14 L2 10 L5 14 L2 18 Z"
              fill="#fde68a"
            />
            <path d="M14 9 L6 1 L20 9 Z" fill="#94a3b8" />
            <path d="M14 19 L6 27 L20 19 Z" fill="#94a3b8" />
            <rect x="10" y="9" width="42" height="10" rx="5" fill="#e2e8f0" />
            <path d="M50 9 L68 14 L50 19 Z" fill="#f87171" />
            <circle cx="40" cy="14" r="2.6" fill="#38bdf8" stroke="#0ea5e9" strokeWidth="0.6" />
          </svg>
        </motion.div>
      )}

      {/* Readability scrims and texture */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, rgba(2,2,8,0.14) 58%, rgba(2,2,8,0.68) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(2,2,8,0.18) 0%, transparent 22%, transparent 72%, rgba(2,2,8,0.5) 100%)",
        }}
      />
      <div className="futuristic-noise absolute inset-0 opacity-[0.03]" />
    </div>
  );
}