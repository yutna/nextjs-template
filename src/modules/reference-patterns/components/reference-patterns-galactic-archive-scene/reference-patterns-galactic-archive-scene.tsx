"use client";

import { Box } from "@chakra-ui/react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useImmer } from "use-immer";

import type { ReferencePatternsGalacticArchiveSceneProps } from "./types";

const FRAGMENT_SHADER = `
  varying vec2 vUv;
  uniform float uBurst;
  uniform float uMix;
  uniform float uTime;

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    float radius = length(uv);
    float swirl = sin((uv.x + uTime * 0.22) * 12.0) * cos((uv.y - uTime * 0.18) * 10.0);
    float ripple = sin(radius * 18.0 - uTime * 7.0) * exp(-radius * 3.2);
    float burst = uBurst * smoothstep(1.1, 0.0, radius);
    float nebula = 0.5 + 0.5 * swirl + ripple * 0.2 + burst * 0.45;

    vec3 lightA = vec3(0.01, 0.08, 0.17);
    vec3 lightB = vec3(0.56, 0.93, 1.0);
    vec3 darkA = vec3(0.15, 0.01, 0.03);
    vec3 darkB = vec3(1.0, 0.28, 0.22);

    vec3 lightColor = mix(lightA, lightB, clamp(nebula, 0.0, 1.0));
    vec3 darkColor = mix(darkA, darkB, clamp(nebula + 0.08, 0.0, 1.0));
    vec3 color = mix(lightColor, darkColor, clamp(uMix, 0.0, 1.0));
    float alpha = clamp(0.22 + ripple * 0.08 + burst * 0.2, 0.15, 0.7);

    gl_FragColor = vec4(color, alpha);
  }
`;

const LIGHT_COLOR = "#9df1ff";
const DARK_COLOR = "#ff6b6b";
const VERTEX_SHADER = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

function getSeededUnit(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43_758.5453;

  return value - Math.floor(value);
}

function hasWebGlSupport() {
  if (typeof window === "undefined") {
    return false;
  }

  const canvas = window.document.createElement("canvas");
  const context =
    canvas.getContext("webgl") ?? canvas.getContext("experimental-webgl");

  if (context && "getExtension" in context) {
    context.getExtension("WEBGL_lose_context")?.loseContext();
  }

  return Boolean(context);
}

function EnergyPlane({ side }: Readonly<ReferencePatternsGalacticArchiveSceneProps>) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const burstRef = useRef(0);
  const mixRef = useRef(side === "dark" ? 1 : 0);
  const uniforms = useMemo(
    () => ({
      uBurst: { value: 0 },
      uMix: { value: side === "dark" ? 1 : 0 },
      uTime: { value: 0 },
    }),
    [side],
  );

  useEffect(() => {
    burstRef.current = 1;
  }, [side]);

  useFrame((state, delta) => {
    const material = materialRef.current;

    if (!material) {
      return;
    }

    const targetMix = side === "dark" ? 1 : 0;

    mixRef.current = THREE.MathUtils.lerp(
      mixRef.current,
      targetMix,
      1 - Math.exp(-delta * 4),
    );
    burstRef.current = Math.max(0, burstRef.current - delta * 0.9);
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uMix.value = mixRef.current;
    material.uniforms.uBurst.value = burstRef.current;
  });

  return (
    <mesh position={[0, 0, -0.15]} scale={[2.8, 2.8, 1]}>
      <planeGeometry args={[2.5, 2.5]} />
      <shaderMaterial
        depthWrite={false}
        fragmentShader={FRAGMENT_SHADER}
        ref={materialRef}
        transparent
        uniforms={uniforms}
        vertexShader={VERTEX_SHADER}
      />
    </mesh>
  );
}

interface StarfieldProps extends ReferencePatternsGalacticArchiveSceneProps {
  reducedMotion: boolean;
}

function Starfield({ reducedMotion, side }: Readonly<StarfieldProps>) {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const starCount = reducedMotion ? 120 : 260;
    const starPositions = new Float32Array(starCount * 3);

    for (let index = 0; index < starCount; index += 1) {
      const offset = index * 3;
      starPositions[offset] = (getSeededUnit(index + 1) - 0.5) * 4.2;
      starPositions[offset + 1] = (getSeededUnit(index + 101) - 0.5) * 3.2;
      starPositions[offset + 2] = (getSeededUnit(index + 201) - 0.5) * 1.4;
    }

    return starPositions;
  }, [reducedMotion]);

  useFrame((_, delta) => {
    if (!pointsRef.current) {
      return;
    }

    pointsRef.current.rotation.z += delta * (side === "light" ? 0.01 : 0.045);
    pointsRef.current.rotation.y = THREE.MathUtils.lerp(
      pointsRef.current.rotation.y,
      side === "light" ? -0.08 : 0.12,
      1 - Math.exp(-delta * 2),
    );
  });

  return (
    <points position={[0, 0, -0.6]} ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          args={[positions, 3]}
          attach="attributes-position"
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={side === "light" ? LIGHT_COLOR : DARK_COLOR}
        opacity={side === "light" ? 0.78 : 0.92}
        size={side === "light" ? 0.018 : 0.022}
        sizeAttenuation
        transparent
      />
    </points>
  );
}

function EnergyCore({ side }: Readonly<ReferencePatternsGalacticArchiveSceneProps>) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) {
      return;
    }

    meshRef.current.rotation.x += delta * 0.24;
    meshRef.current.rotation.y += delta * (side === "light" ? 0.2 : 0.38);
    meshRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.35) * 0.08;
    meshRef.current.position.y = Math.cos(state.clock.elapsedTime * 0.28) * 0.06;
  });

  return (
    <mesh
      position={side === "light" ? [0.9, 0.45, 0.25] : [-0.95, 0.3, 0.25]}
      ref={meshRef}
    >
      <icosahedronGeometry args={[side === "light" ? 0.2 : 0.24, 4]} />
      <meshStandardMaterial
        color={side === "light" ? LIGHT_COLOR : DARK_COLOR}
        emissive={side === "light" ? LIGHT_COLOR : DARK_COLOR}
        emissiveIntensity={side === "light" ? 2.1 : 2.8}
        roughness={0.2}
        wireframe={side === "dark"}
      />
    </mesh>
  );
}

export function ReferencePatternsGalacticArchiveScene({
  side,
}: Readonly<ReferencePatternsGalacticArchiveSceneProps>) {
  const reducedMotion = useReducedMotion();
  const [hasWebGl, updateHasWebGl] = useImmer<boolean | null>(null);

  useEffect(() => {
    updateHasWebGl(hasWebGlSupport());
  }, [updateHasWebGl]);

  if (hasWebGl !== true) {
    return <Box aria-hidden inset={0} position="absolute" />;
  }

  return (
    <Canvas
      camera={{ fov: 50, position: [0, 0, 1.8] }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={side === "light" ? 0.75 : 0.38} />
      <pointLight
        color={side === "light" ? LIGHT_COLOR : DARK_COLOR}
        intensity={side === "light" ? 10 : 14}
        position={side === "light" ? [1.4, 1.6, 1.8] : [-1.5, 1.2, 1.7]}
      />
      <EnergyPlane side={side} />
      <Starfield reducedMotion={Boolean(reducedMotion)} side={side} />
      <EnergyCore side={side} />
    </Canvas>
  );
}
