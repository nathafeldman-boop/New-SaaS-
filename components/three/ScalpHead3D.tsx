"use client";

// ──────────────────────────────────────────────────────────────────────────
//  Tête 3D interactive (react-three-fiber) pour le suivi de calvitie.
//  - Tête + nuque + oreilles construites procéduralement (aucun asset externe).
//  - Les cheveux sont une coque sphérique pilotée par un shader : la ligne
//    frontale recule et le vertex se dégarnit à mesure que le stade augmente.
//  - Rotatable au doigt (OrbitControls). Le stade est lissé image par image.
//  Chargé en ssr:false depuis ScalpTracker.
// ──────────────────────────────────────────────────────────────────────────

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const HAIR_VERT = /* glsl */ `
  varying vec3 vDir;
  varying vec3 vWorldNormal;
  void main() {
    vDir = normalize(position);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// uStage : 1.0 → 7.0. Détermine la présence de cheveux par direction.
const HAIR_FRAG = /* glsl */ `
  precision highp float;
  uniform float uStage;
  uniform vec3  uHairColor;
  uniform vec3  uScalpColor;
  uniform vec3  uLightDir;
  varying vec3  vDir;
  varying vec3  vWorldNormal;

  // bruit léger pour une texture de cheveux non plastique
  float hash(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719))) * 43758.5453); }

  void main() {
    vec3 d = normalize(vDir);
    float up    = d.y;          // sommet du crâne
    float front = d.z;          // +avant / -arrière
    float sx    = abs(d.x);     // latéralité (tempes)

    float s = clamp((uStage - 1.0) / 6.0, 0.0, 1.0);

    // Ligne de cheveux de base : plus haute à l'avant (front) qu'à l'arrière.
    float lowBound = mix(0.02, 0.34, clamp(front, 0.0, 1.0));

    // 1) Recul frontal : la ligne remonte avec le stade.
    float frontRecede = mix(0.0, 0.50, s) * smoothstep(0.0, 0.65, front);
    // 2) « M » des golfes : les tempes reculent davantage.
    float temple = mix(0.0, 0.28, s) * smoothstep(0.28, 0.85, sx) * smoothstep(0.0, 0.55, front);

    float hairlineHere = lowBound + frontRecede + temple;
    float frontMask = smoothstep(hairlineHere - 0.05, hairlineHere + 0.07, up);

    // 3) Dégarnissement du vertex : tache circulaire au sommet-arrière qui grandit.
    vec3  crownDir   = normalize(vec3(0.0, 0.92, -0.40));
    float crownDist  = distance(d, crownDir);
    float crownR     = mix(0.0, 1.05, smoothstep(0.20, 1.0, s));
    float crownMask  = smoothstep(crownR - 0.14, crownR + 0.10, crownDist);

    float presence = frontMask * crownMask;

    // Anti-aliasing du bord : on garde un dégradé court vers le cuir chevelu.
    if (presence < 0.5) {
      discard;
    }

    // Ombrage doux + micro-texture de mèches.
    vec3  n = normalize(vWorldNormal);
    float lambert = clamp(dot(n, normalize(uLightDir)), 0.0, 1.0) * 0.65 + 0.4;
    float strand = 0.92 + 0.08 * hash(floor(d * 70.0));
    vec3  col = uHairColor * lambert * strand;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function Hair({ stageRef }: { stageRef: React.MutableRefObject<number> }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uStage: { value: 1 },
      uHairColor: { value: new THREE.Color("#3a2a1d") },
      uScalpColor: { value: new THREE.Color("#e7d3bd") },
      uLightDir: { value: new THREE.Vector3(0.4, 1.0, 0.7).normalize() },
    }),
    [],
  );

  // Lissage du stade image par image.
  useFrame(() => {
    const cur = uniforms.uStage.value;
    uniforms.uStage.value = cur + (stageRef.current - cur) * 0.12;
    if (matRef.current) matRef.current.uniformsNeedUpdate = true;
  });

  return (
    <mesh scale={[1.03, 1.2, 1.11]}>
      <sphereGeometry args={[1, 96, 64]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={HAIR_VERT}
        fragmentShader={HAIR_FRAG}
        uniforms={uniforms}
      />
    </mesh>
  );
}

function Head() {
  const skin = "#e7d3bd";
  return (
    <group>
      {/* Crâne / visage */}
      <mesh scale={[1, 1.18, 1.08]}>
        <sphereGeometry args={[1, 64, 48]} />
        <meshStandardMaterial color={skin} roughness={0.85} metalness={0} />
      </mesh>
      {/* Oreilles (repères d'orientation) */}
      <mesh position={[1.0, -0.05, 0.12]} scale={[0.16, 0.3, 0.22]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color={skin} roughness={0.85} />
      </mesh>
      <mesh position={[-1.0, -0.05, 0.12]} scale={[0.16, 0.3, 0.22]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color={skin} roughness={0.85} />
      </mesh>
      {/* Nuque / cou */}
      <mesh position={[0, -1.5, -0.05]}>
        <cylinderGeometry args={[0.42, 0.5, 0.9, 32]} />
        <meshStandardMaterial color={skin} roughness={0.9} />
      </mesh>
    </group>
  );
}

export default function ScalpHead3D({ stage }: { stage: number }) {
  const stageRef = useRef(stage);
  stageRef.current = stage;

  return (
    <Canvas
      camera={{ position: [0, 0.45, 3.5], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ touchAction: "none" }}
    >
      <ambientLight intensity={0.75} color="#fff4e6" />
      <directionalLight position={[2.5, 4, 3]} intensity={1.0} color="#fff1dd" />
      <directionalLight position={[-3, 1, -2]} intensity={0.35} color="#d8bd9d" />

      {/* Léger basculement pour révéler le sommet du crâne. */}
      <group rotation={[-0.16, 0, 0]} position={[0, 0.15, 0]}>
        <Head />
        <Hair stageRef={stageRef} />
      </group>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={0.55}
        maxPolarAngle={2.1}
        rotateSpeed={0.7}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
}
