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

const TAU = Math.PI * 2;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

const palette = ["#67e8f9", "#38bdf8", "#818cf8", "#c084fc"];

function createGlowTexture() {
  const size = 128;
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
  gradient.addColorStop(0.16, "rgba(220,245,255,0.92)");
  gradient.addColorStop(0.38, "rgba(125,195,255,0.36)");
  gradient.addColorStop(0.7, "rgba(95,125,255,0.08)");
  gradient.addColorStop(1, "rgba(80,100,255,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
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
/* Shaders                                                                    */
/* -------------------------------------------------------------------------- */

const STAR_VERTEX = `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec2 uMouse;
  uniform float uSize;
  uniform float uOpacity;

  attribute float aScale;
  attribute float aPhase;
  attribute vec3 aColor;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 p = position;

    p.x += sin(uTime * 0.16 + aPhase) * 0.2;
    p.y += cos(uTime * 0.13 + aPhase * 1.7) * 0.16;
    p.z += sin(uTime * 0.09 + aPhase * 0.6) * 0.12;

    vec2 mouseWorld = uMouse * vec2(5.4, 3.2);
    vec2 delta = p.xy - mouseWorld;
    float distanceToMouse = length(delta);
    float influence = smoothstep(2.1, 0.0, distanceToMouse);

    p.xy += normalize(delta + vec2(0.0001)) * influence * 0.42;

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    gl_PointSize = uSize * aScale * uPixelRatio * (160.0 / max(1.0, -mvPosition.z));

    vColor = mix(aColor, vec3(0.78, 0.96, 1.0), influence * 0.75);
    vAlpha = uOpacity * (0.5 + influence * 0.5) * (0.62 + 0.38 * sin(uTime * 0.55 + aPhase));
  }
`;

const STAR_FRAGMENT = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float distanceToCenter = length(gl_PointCoord - 0.5);
    float glow = smoothstep(0.5, 0.0, distanceToCenter);
    glow = pow(glow, 2.1);

    gl_FragColor = vec4(vColor, glow * vAlpha);
  }
`;

const CORE_VERTEX = `
  uniform float uTime;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vWave;

  void main() {
    vec3 p = position;

    float wave =
      sin(p.y * 3.1 + uTime * 1.05) *
      sin(p.x * 2.8 + uTime * 0.82) *
      sin(p.z * 3.4 + uTime * 0.96);

    p += normal * wave * 0.085;
    vWave = wave;

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewPosition = -mvPosition.xyz;

    gl_Position = projectionMatrix * mvPosition;
  }
`;

const CORE_FRAGMENT = `
  uniform float uTime;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vWave;

  void main() {
    float fresnel = pow(
      1.0 - clamp(dot(normalize(vNormal), normalize(vViewPosition)), 0.0, 1.0),
      2.15
    );

    vec3 deepBlue = vec3(0.035, 0.19, 0.72);
    vec3 electricBlue = vec3(0.16, 0.48, 1.0);
    vec3 violet = vec3(0.56, 0.3, 1.0);

    vec3 color = mix(deepBlue, electricBlue, 0.55 + fresnel * 0.45);
    color = mix(color, violet, smoothstep(0.2, 1.0, fresnel) * 0.7);
    color += vec3(0.0, 0.5, 0.85) * (vWave * 0.5 + 0.5) * 0.35;

    float pulse = 0.85 + 0.15 * sin(uTime * 1.3);
    float alpha = (0.18 + fresnel * 0.82) * pulse;

    gl_FragColor = vec4(color, alpha);
  }
`;

const FLOOR_VERTEX = `
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = position;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FLOOR_FRAGMENT = `
  uniform float uTime;

  varying vec2 vUv;
  varying vec3 vPosition;

  float gridLine(vec2 uv, vec2 scale, float thickness) {
    vec2 coord = uv * scale;
    vec2 derivative = fwidth(coord);
    vec2 grid = abs(fract(coord - 0.5) - 0.5) / max(derivative, vec2(0.0001));
    float line = min(grid.x, grid.y);

    return 1.0 - min(line / thickness, 1.0);
  }

  void main() {
    vec2 uv = vUv;
    uv.y -= uTime * 0.012;

    float fine = gridLine(uv, vec2(42.0, 84.0), 1.25);
    float coarse = gridLine(uv, vec2(8.0, 16.0), 1.5);

    vec3 color = mix(vec3(0.05, 0.28, 0.68), vec3(0.28, 0.78, 1.0), fine);
    color = mix(color, vec3(0.45, 0.3, 0.95), coarse * 0.55);

    float radial = smoothstep(0.82, 0.12, distance(vUv, vec2(0.5, 0.64)));
    float horizon = smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
    float alpha = (fine * 0.2 + coarse * 0.22) * radial * horizon;

    if (alpha < 0.002) discard;

    gl_FragColor = vec4(color, alpha);
  }
`;

/* -------------------------------------------------------------------------- */
/* Ambient star field                                                         */
/* -------------------------------------------------------------------------- */

function Starfield({ pointerRef, reducedMotion, count, texture }) {
  const materialRef = useRef(null);
  const groupRef = useRef(null);
  const smoothPointer = useRef({ x: 0, y: 0 });

  const { geometry, uniforms } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const phases = new Float32Array(count);
    const random = createSeededRandom(1207 + count);

    const colorsPalette = palette.map((color) => new THREE.Color(color));

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;

      positions[i3] = (random() - 0.5) * 16;
      positions[i3 + 1] = (random() - 0.5) * 10;
      positions[i3 + 2] = -8 + random() * 10;

      const color = colorsPalette[Math.floor(random() * colorsPalette.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      scales[i] = 0.45 + random() * 1.35;
      phases[i] = random() * TAU;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

    return {
      geometry: geo,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uMouse: { value: new THREE.Vector2() },
        uSize: { value: 0.19 },
        uOpacity: { value: 0.92 },
      },
    };
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, delta) => {
    if (reducedMotion || !materialRef.current) return;

    const pointer = pointerRef.current;
    const smooth = smoothPointer.current;

    smooth.x = THREE.MathUtils.damp(smooth.x, pointer.tx, 3.2, delta);
    smooth.y = THREE.MathUtils.damp(smooth.y, pointer.ty, 3.2, delta);

    const material = materialRef.current;
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uPixelRatio.value = state.viewport.dpr;
    material.uniforms.uMouse.value.set(smooth.x, smooth.y);

    if (groupRef.current) {
      groupRef.current.position.x = smooth.x * 0.24;
      groupRef.current.position.y = smooth.y * 0.16;
      groupRef.current.rotation.z = smooth.x * 0.008;
    }
  });

  return (
    <group ref={groupRef}>
      <points geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={STAR_VERTEX}
          fragmentShader={STAR_FRAGMENT}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      {/* A second, coarser layer of near stars adds depth without many draw calls. */}
      <points geometry={geometry} position={[0, 0, 1.2]} scale={1.3} frustumCulled={false}>
        <pointsMaterial
          map={texture}
          color="#7dd3fc"
          size={0.035}
          sizeAttenuation
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Floating geometry                                                          */
/* -------------------------------------------------------------------------- */

const SHAPE_CONFIGS = [
  {
    geometry: "octahedron",
    position: [-4.9, 1.7, -3.4],
    rotation: [0.4, 0.2, 0.3],
    scale: 0.95,
    color: "#38bdf8",
    opacity: 0.11,
  },
  {
    geometry: "icosahedron",
    position: [-3.7, -2.2, -2.2],
    rotation: [0.7, 0.4, 0.1],
    scale: 0.58,
    color: "#a78bfa",
    opacity: 0.1,
  },
  {
    geometry: "tetrahedron",
    position: [4.9, 2.2, -3.8],
    rotation: [0.2, 0.7, 0.4],
    scale: 0.72,
    color: "#22d3ee",
    opacity: 0.1,
  },
  {
    geometry: "torus",
    position: [3.4, -2.5, -1.9],
    rotation: [0.5, 0.3, 0.8],
    scale: 0.82,
    color: "#818cf8",
    opacity: 0.08,
  },
];

function ShapeGeometry({ geometry }) {
  if (geometry === "octahedron") {
    return <octahedronGeometry args={[1, 0]} />;
  }

  if (geometry === "icosahedron") {
    return <icosahedronGeometry args={[1, 0]} />;
  }

  if (geometry === "tetrahedron") {
    return <tetrahedronGeometry args={[1, 0]} />;
  }

  return <torusGeometry args={[0.7, 0.22, 8, 32]} />;
}

function AmbientShapes({ pointerRef, reducedMotion, count }) {
  const groupRef = useRef(null);
  const smoothPointer = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    if (reducedMotion || !groupRef.current) return;

    const pointer = pointerRef.current;
    const smooth = smoothPointer.current;

    smooth.x = THREE.MathUtils.damp(smooth.x, pointer.tx, 2.2, delta);
    smooth.y = THREE.MathUtils.damp(smooth.y, pointer.ty, 2.2, delta);

    groupRef.current.position.x = smooth.x * -0.38;
    groupRef.current.position.y = smooth.y * -0.26;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.018 + smooth.x * 0.12;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.04;
  });

  return (
    <group ref={groupRef}>
      {SHAPE_CONFIGS.slice(0, count).map((shape, index) => (
        <mesh
          key={index}
          position={shape.position}
          rotation={shape.rotation}
          scale={shape.scale}
        >
          <ShapeGeometry geometry={shape.geometry} />
          <meshBasicMaterial
            color={shape.color}
            wireframe
            transparent
            opacity={shape.opacity}
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
/* Perspective floor grid                                                     */
/* -------------------------------------------------------------------------- */

function FloorGrid({ pointerRef, reducedMotion }) {
  const materialRef = useRef(null);
  const groupRef = useRef(null);
  const smoothPointer = useRef({ x: 0, y: 0 });

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((state, delta) => {
    if (reducedMotion) return;

    const pointer = pointerRef.current;
    const smooth = smoothPointer.current;

    smooth.x = THREE.MathUtils.damp(smooth.x, pointer.tx, 2.6, delta);
    smooth.y = THREE.MathUtils.damp(smooth.y, pointer.ty, 2.6, delta);

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }

    if (groupRef.current) {
      groupRef.current.position.x = smooth.x * 0.45;
      groupRef.current.position.z = -2.5 + smooth.y * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, -3.05, -2.5]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <planeGeometry args={[38, 28, 1, 1]} />
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={FLOOR_VERTEX}
          fragmentShader={FLOOR_FRAGMENT}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Orbital technology core                                                    */
/* -------------------------------------------------------------------------- */

function createCoreData(count) {
  const radius = 1.9;
  const nodes = [];
  const nodeColors = [];
  const colors = palette.map((color) => new THREE.Color(color));

  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / Math.max(count - 1, 1)) * 2;
    const ringRadius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = GOLDEN_ANGLE * i;

    nodes.push(
      new THREE.Vector3(
        Math.cos(theta) * ringRadius * radius,
        y * radius,
        Math.sin(theta) * ringRadius * radius
      )
    );
    nodeColors.push(colors[i % colors.length]);
  }

  const threshold = radius * (3.35 / Math.sqrt(count));
  const thresholdSquared = threshold * threshold;
  const edges = [];

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      if (nodes[i].distanceToSquared(nodes[j]) <= thresholdSquared) {
        edges.push([i, j]);
      }
    }
  }

  const nodePositions = new Float32Array(nodes.length * 3);
  const nodeColorData = new Float32Array(nodes.length * 3);

  nodes.forEach((node, index) => {
    const i3 = index * 3;
    nodePositions[i3] = node.x;
    nodePositions[i3 + 1] = node.y;
    nodePositions[i3 + 2] = node.z;

    const color = nodeColors[index];
    nodeColorData[i3] = color.r;
    nodeColorData[i3 + 1] = color.g;
    nodeColorData[i3 + 2] = color.b;
  });

  const nodeGeometry = new THREE.BufferGeometry();
  nodeGeometry.setAttribute("position", new THREE.BufferAttribute(nodePositions, 3));
  nodeGeometry.setAttribute("color", new THREE.BufferAttribute(nodeColorData, 3));

  const linePositions = new Float32Array(edges.length * 6);
  const lineColors = new Float32Array(edges.length * 6);

  edges.forEach(([a, b], index) => {
    const i6 = index * 6;
    const nodeA = nodes[a];
    const nodeB = nodes[b];

    linePositions[i6] = nodeA.x;
    linePositions[i6 + 1] = nodeA.y;
    linePositions[i6 + 2] = nodeA.z;
    linePositions[i6 + 3] = nodeB.x;
    linePositions[i6 + 4] = nodeB.y;
    linePositions[i6 + 5] = nodeB.z;

    const colorA = nodeColors[a];
    const colorB = nodeColors[b];

    lineColors[i6] = colorA.r;
    lineColors[i6 + 1] = colorA.g;
    lineColors[i6 + 2] = colorA.b;
    lineColors[i6 + 3] = colorB.r;
    lineColors[i6 + 4] = colorB.g;
    lineColors[i6 + 5] = colorB.b;
  });

  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
  lineGeometry.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));

  const pulseCount = Math.min(16, Math.max(6, Math.floor(edges.length / 14)));
  const pulseGeometry = new THREE.BufferGeometry();
  pulseGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(pulseCount * 3), 3)
  );

  const random = createSeededRandom(count * 31 + 7);
  const pulses = Array.from({ length: pulseCount }, () => ({
    edge: edges[Math.floor(random() * edges.length)] ?? [0, 0],
    t: random(),
    speed: 0.16 + random() * 0.22,
  }));

  // Seed the pulse positions so the static reduced-motion frame looks complete.
  pulses.forEach((pulse, index) => {
    const [a, b] = pulse.edge;
    const start = nodes[a];
    const end = nodes[b];

    if (!start || !end) return;

    pulseGeometry.attributes.position.setXYZ(
      index,
      start.x + (end.x - start.x) * pulse.t,
      start.y + (end.y - start.y) * pulse.t,
      start.z + (end.z - start.z) * pulse.t
    );
  });

  return {
    nodes,
    edges,
    nodeGeometry,
    lineGeometry,
    pulseGeometry,
    pulses,
  };
}

function CoreNetwork({ pointerRef, reducedMotion, count, texture }) {
  const networkRef = useRef(null);
  const ringsRef = useRef(null);
  const pulsesRef = useRef(null);
  const coreMaterialRef = useRef(null);
  const smoothPointer = useRef({ x: 0, y: 0 });
  const { size, viewport } = useThree();

  const isMobile = size.width < 768;
  const isTablet = size.width < 1024;
  const scale = isMobile ? 0.5 : isTablet ? 0.72 : 0.92;
  const baseX = isMobile ? 0.1 : viewport.width * (isTablet ? 0.18 : 0.21);
  const baseY = isMobile ? -0.85 : isTablet ? 0.05 : 0.12;

  const core = useMemo(() => createCoreData(count), [count]);
  const pulseStateRef = useRef(core.pulses);
  const pulseGeometryRef = useRef(core.pulseGeometry);

  useEffect(() => {
    pulseStateRef.current = core.pulses;
    pulseGeometryRef.current = core.pulseGeometry;
  }, [core]);

  useEffect(
    () => () => {
      core.nodeGeometry.dispose();
      core.lineGeometry.dispose();
      core.pulseGeometry.dispose();
    },
    [core]
  );

  useFrame((state, delta) => {
    if (reducedMotion) return;

    const pointer = pointerRef.current;
    const smooth = smoothPointer.current;

    smooth.x = THREE.MathUtils.damp(smooth.x, pointer.tx, 3.4, delta);
    smooth.y = THREE.MathUtils.damp(smooth.y, pointer.ty, 3.4, delta);

    const time = state.clock.elapsedTime;

    if (networkRef.current) {
      networkRef.current.rotation.y = time * 0.075 + smooth.x * 0.34;
      networkRef.current.rotation.x =
        Math.sin(time * 0.17) * 0.07 + smooth.y * 0.24;
      networkRef.current.rotation.z = Math.sin(time * 0.11) * 0.04;
    }

    if (ringsRef.current) {
      ringsRef.current.rotation.y = time * 0.09 + smooth.x * 0.22;
      ringsRef.current.rotation.x =
        Math.sin(time * 0.12) * 0.12 + smooth.y * 0.16;
    }

    if (pulsesRef.current) {
      pulsesRef.current.rotation.y = -time * 0.035;
    }

    if (coreMaterialRef.current) {
      coreMaterialRef.current.uniforms.uTime.value = time;
    }

    const positions = pulseGeometryRef.current.attributes.position;
    const pulses = pulseStateRef.current;

    pulses.forEach((pulse, index) => {
      pulse.t += delta * pulse.speed;

      if (pulse.t > 1) {
        pulse.t = 0;
        pulse.edge =
          core.edges[Math.floor(Math.random() * core.edges.length)] ?? [0, 0];
      }

      const [a, b] = pulse.edge;
      const start = core.nodes[a];
      const end = core.nodes[b];

      if (!start || !end) return;

      positions.setXYZ(
        index,
        start.x + (end.x - start.x) * pulse.t,
        start.y + (end.y - start.y) * pulse.t,
        start.z + (end.z - start.z) * pulse.t
      );
    });

    positions.needsUpdate = true;
  });

  return (
    <group
      position={[baseX, baseY, 0]}
      scale={scale}
      rotation={[0.12, 0.35, 0.02]}
    >
      {/* Soft bloom-style halos. Sprites avoid post-processing entirely. */}
      <sprite scale={[8.6, 8.6, 1]}>
        <spriteMaterial
          map={texture}
          color="#4338ca"
          transparent
          opacity={0.2}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
      <sprite scale={[5.4, 5.4, 1]}>
        <spriteMaterial
          map={texture}
          color="#0ea5e9"
          transparent
          opacity={0.34}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>

      {/* Distorted fresnel energy sphere. */}
      <mesh>
        <icosahedronGeometry args={[1.26, 4]} />
        <shaderMaterial
          ref={coreMaterialRef}
          uniforms={{ uTime: { value: 0 } }}
          vertexShader={CORE_VERTEX}
          fragmentShader={CORE_FRAGMENT}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Wireframe shell behind the node network. */}
      <mesh rotation={[0.4, 0.2, 0.1]}>
        <icosahedronGeometry args={[1.48, 1]} />
        <meshBasicMaterial
          color="#1d4ed8"
          wireframe
          transparent
          opacity={0.16}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      <group ref={networkRef} rotation={[0.12, 0.35, 0.02]}>
        <lineSegments geometry={core.lineGeometry} frustumCulled={false}>
          <lineBasicMaterial
            vertexColors
            transparent
            opacity={0.36}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </lineSegments>

        <points geometry={core.nodeGeometry} frustumCulled={false}>
          <pointsMaterial
            map={texture}
            vertexColors
            size={0.072}
            sizeAttenuation
            transparent
            opacity={0.95}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </points>

        <points
          ref={pulsesRef}
          geometry={core.pulseGeometry}
          frustumCulled={false}
        >
          <pointsMaterial
            map={texture}
            color="#e0f2fe"
            size={0.11}
            sizeAttenuation
            transparent
            opacity={0.95}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </points>
      </group>

      <group ref={ringsRef}>
        <mesh rotation={[1.16, 0.2, 0.38]}>
          <torusGeometry args={[2.48, 0.006, 6, 220]} />
          <meshBasicMaterial
            color="#22d3ee"
            transparent
            opacity={0.55}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
        <mesh rotation={[0.32, 1.12, -0.22]}>
          <torusGeometry args={[2.72, 0.005, 6, 220]} />
          <meshBasicMaterial
            color="#818cf8"
            transparent
            opacity={0.42}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
        <mesh rotation={[-0.58, 0.48, 1.18]}>
          <torusGeometry args={[3.02, 0.004, 6, 220]} />
          <meshBasicMaterial
            color="#c084fc"
            transparent
            opacity={0.32}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>

        <DottedOrbit texture={texture} />
      </group>
    </group>
  );
}

function DottedOrbit({ texture }) {
  const { geometry } = useMemo(() => {
    const count = 18;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * TAU;
      positions[i * 3] = Math.cos(angle) * 2.86;
      positions[i * 3 + 1] = Math.sin(angle) * 2.86;
      positions[i * 3 + 2] = 0;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    return { geometry: geo };
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <points geometry={geometry} rotation={[1.05, 0.25, 0.15]} frustumCulled={false}>
      <pointsMaterial
        map={texture}
        color="#a5f3fc"
        size={0.065}
        sizeAttenuation
        transparent
        opacity={0.8}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

/* -------------------------------------------------------------------------- */
/* Cursor light                                                               */
/* -------------------------------------------------------------------------- */

function CursorLight({ pointerRef, reducedMotion, texture }) {
  const spriteRef = useRef(null);
  const smoothPointer = useRef({ x: 0, y: 0 });
  const { camera } = useThree();

  useFrame((state, delta) => {
    if (reducedMotion || !spriteRef.current) return;

    const pointer = pointerRef.current;
    const smooth = smoothPointer.current;

    smooth.x = THREE.MathUtils.damp(smooth.x, pointer.tx, 5.2, delta);
    smooth.y = THREE.MathUtils.damp(smooth.y, pointer.ty, 5.2, delta);

    const distance = camera.position.z - 1.4;
    const height = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance;
    const width = height * camera.aspect;

    spriteRef.current.position.x = smooth.x * width * 0.5;
    spriteRef.current.position.y = smooth.y * height * 0.5;
    spriteRef.current.position.z = 1.4;
  });

  return (
    <sprite ref={spriteRef} scale={[2.4, 2.4, 1]} position={[0, 0, 1.4]}>
      <spriteMaterial
        map={texture}
        color="#38bdf8"
        transparent
        opacity={0.16}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </sprite>
  );
}

/* -------------------------------------------------------------------------- */
/* Scene                                                                      */
/* -------------------------------------------------------------------------- */

function Scene({ pointerRef, reducedMotion }) {
  const { size } = useThree();

  const isMobile = size.width < 768;
  const isTablet = size.width < 1024;

  const glowTexture = useMemo(() => createGlowTexture(), []);
  useEffect(() => () => glowTexture.dispose(), [glowTexture]);

  const starCount = isMobile ? 72 : isTablet ? 130 : 190;
  const nodeCount = isMobile ? 42 : isTablet ? 64 : 88;
  const shapeCount = isMobile ? 2 : 4;

  return (
    <>
      <Starfield
        pointerRef={pointerRef}
        reducedMotion={reducedMotion}
        count={starCount}
        texture={glowTexture}
      />

      <AmbientShapes
        pointerRef={pointerRef}
        reducedMotion={reducedMotion}
        count={shapeCount}
      />

      {!isMobile && (
        <FloorGrid pointerRef={pointerRef} reducedMotion={reducedMotion} />
      )}

      <CoreNetwork
        pointerRef={pointerRef}
        reducedMotion={reducedMotion}
        count={nodeCount}
        texture={glowTexture}
      />

      {!isMobile && (
        <CursorLight
          pointerRef={pointerRef}
          reducedMotion={reducedMotion}
          texture={glowTexture}
        />
      )}
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
    "linear-gradient(rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.07) 1px, transparent 1px)",
  backgroundSize: "64px 64px",
  maskImage: "radial-gradient(ellipse at 50% 45%, black 8%, transparent 78%)",
  WebkitMaskImage:
    "radial-gradient(ellipse at 50% 45%, black 8%, transparent 78%)",
};

const accentGridStyle = {
  backgroundImage:
    "linear-gradient(rgba(96,165,250,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.045) 1px, transparent 1px)",
  backgroundSize: "256px 256px",
  maskImage:
    "linear-gradient(to bottom, transparent 0%, black 16%, black 84%, transparent 100%)",
  WebkitMaskImage:
    "linear-gradient(to bottom, transparent 0%, black 16%, black 84%, transparent 100%)",
};

const orbOneStyle = {
  background:
    "radial-gradient(circle at center, rgba(37,99,235,0.36) 0%, rgba(37,99,235,0.14) 40%, transparent 70%)",
};

const orbTwoStyle = {
  background:
    "radial-gradient(circle at center, rgba(124,58,237,0.34) 0%, rgba(88,28,135,0.12) 42%, transparent 72%)",
};

const orbThreeStyle = {
  background:
    "radial-gradient(circle at center, rgba(14,165,233,0.24) 0%, rgba(59,130,246,0.09) 46%, transparent 72%)",
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
    stiffness: 52,
    damping: 22,
    mass: 0.65,
  });
  const smoothGlowY = useSpring(glowY, {
    stiffness: 52,
    damping: 22,
    mass: 0.65,
  });

  const orbOneX = useTransform(smoothX, [-1, 1], [30, -30]);
  const orbOneY = useTransform(smoothY, [-1, 1], [22, -22]);
  const orbTwoX = useTransform(smoothX, [-1, 1], [-24, 24]);
  const orbTwoY = useTransform(smoothY, [-1, 1], [-16, 16]);
  const orbThreeX = useTransform(smoothX, [-1, 1], [16, -16]);
  const orbThreeY = useTransform(smoothY, [-1, 1], [12, -12]);
  const circuitX = useTransform(smoothX, [-1, 1], [12, -12]);
  const circuitY = useTransform(smoothY, [-1, 1], [9, -9]);

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
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [reduceMotion, glowX, glowY, pointerX, pointerY, smoothGlowX, smoothGlowY]);

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
      <div className="absolute inset-0 opacity-60" style={gridStyle} />
      <div
        className="grid-pan absolute inset-0 opacity-40"
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

      {/* Circuit traces sit behind the 3D layer for extra depth. */}
      <motion.div
        style={parallax(circuitX, circuitY)}
        className="absolute inset-0 opacity-70"
      >
        <svg
          className="absolute -left-10 top-24 hidden w-[24rem] opacity-50 md:block"
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
          className="absolute -right-12 bottom-20 hidden w-[28rem] opacity-40 lg:block"
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

      {/* The 3D environment. It fades back as the hero scrolls away. */}
      {webgl && (
        <motion.div
          className="absolute inset-0"
          style={{ opacity: reduceMotion ? 0.72 : sceneOpacity }}
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
              camera={{ position: [0, 0, 9], fov: 42, near: 0.1, far: 60 }}
              flat
              style={{ pointerEvents: "none" }}
              onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
            >
              <Scene pointerRef={pointerRef} reducedMotion={reduceMotion} />
            </Canvas>
          </SceneErrorBoundary>
        </motion.div>
      )}

      {/* Soft light that follows the cursor. Transform-only, so it stays cheap. */}
      {!reduceMotion && (
        <motion.div
          className="absolute left-[-23rem] top-[-23rem] hidden h-[46rem] w-[46rem] rounded-full md:block"
          style={{
            x: smoothGlowX,
            y: smoothGlowY,
            background:
              "radial-gradient(circle, rgba(56,189,248,0.12) 0%, rgba(129,140,248,0.08) 34%, rgba(124,58,237,0.05) 52%, transparent 70%)",
            mixBlendMode: "screen",
            willChange: "transform",
          }}
        />
      )}

      {!reduceMotion && (
        <motion.div
          className="absolute left-[-7rem] top-[-7rem] hidden h-56 w-56 rounded-full md:block"
          style={{
            x: smoothGlowX,
            y: smoothGlowY,
            background:
              "radial-gradient(circle, rgba(186,230,253,0.16) 0%, rgba(56,189,248,0.08) 42%, transparent 70%)",
            mixBlendMode: "screen",
            willChange: "transform",
          }}
        />
      )}

      {/* Readability scrims and texture */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, rgba(2,4,10,0.14) 58%, rgba(2,4,10,0.7) 100%)",
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
