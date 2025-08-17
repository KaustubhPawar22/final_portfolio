"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform float u_theme; // 0 = light, 1 = dark

  void main() {
    vec3 bgColor = mix(vec3(1.0), vec3(0.0), u_theme); // white or black
    gl_FragColor = vec4(bgColor, 1.0);
  }
`;

const ShaderPlane = ({ themeValue }: { themeValue: number }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_theme.value = themeValue;
    }
  }, [themeValue]);

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          u_theme: { value: themeValue },
        }}
      />
    </mesh>
  );
};

export default function BackgroundCanvas() {
  const [themeValue, setThemeValue] = useState<number>(
    typeof window !== "undefined" &&
      document.documentElement.classList.contains("dark")
      ? 1
      : 0
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setThemeValue(
        document.documentElement.classList.contains("dark") ? 1 : 0
      );
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        pointerEvents: "none",
        background: "transparent",
      }}
    >
      <Canvas>
        <ShaderPlane themeValue={themeValue} />
      </Canvas>
    </div>
  );
}
