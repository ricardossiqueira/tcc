"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const SEPARATION = 100;
const AMOUNTX = 160;
const AMOUNTY = 80;
const WAVE_SPEED = 0.0125;

const GLITCH_DURATION = 120; // Duration of glitch effect in milliseconds
const GLITCH_INTENSITY = 0.4; // Intensity of the chromatic shift

interface WaveParticlesProps {
  rotation?: { x: number; y: number; z: number }; // Rotation parameter
}

const WaveParticles: React.FC<WaveParticlesProps> = ({
  rotation = { x: 0, y: 0, z: 0 },
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const countRef = useRef(0);
  const chromaticShiftRef = useRef(false);
  const shiftStartRef = useRef(0);
  const distortions = useRef(new Float32Array(AMOUNTX * AMOUNTY));

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Update window dimensions state on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clean up previous renderer if it exists
    if (rendererRef.current) {
      rendererRef.current.dispose();
      if (rendererRef.current.domElement.parentNode === container) {
        container.removeChild(rendererRef.current.domElement);
      }
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(windowSize.width, windowSize.height);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const camera = new THREE.PerspectiveCamera(
      75,
      windowSize.width / windowSize.height,
      1,
      10000,
    );
    camera.position.set(0, 600, 1200);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const numParticles = AMOUNTX * AMOUNTY;
    const positions = new Float32Array(numParticles * 3);
    const colorOffsets = new Float32Array(numParticles * 3); // Per-particle color offsets

    let i = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        positions[i] = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
        positions[i + 1] = 0;
        positions[i + 2] = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

        // Random offsets for each particle's RGB channels
        colorOffsets[i] = Math.random() * 0.4 - 0.2; // Red offset
        colorOffsets[i + 1] = Math.random() * 0.4 - 0.2; // Green offset
        colorOffsets[i + 2] = Math.random() * 0.4 - 0.2; // Blue offset

        i += 3;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute(
      "colorOffset",
      new THREE.BufferAttribute(colorOffsets, 3),
    );

    const material = new THREE.ShaderMaterial({
      uniforms: {
        color1: { value: new THREE.Color(0x333333) },
        color2: { value: new THREE.Color(0x999999) },
        chromaticShift: { value: 0 },
      },
      vertexShader: `
        attribute vec3 colorOffset; // Per-particle color offset
        varying float vYPosition;
        varying vec3 vColorOffset;

        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 4.0;
          vYPosition = position.y;
          vColorOffset = colorOffset; // Pass offset to fragment shader
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        uniform float chromaticShift;
        varying float vYPosition;
        varying vec3 vColorOffset;

        void main() {
          float gradientFactor = smoothstep(-250.0, 250.0, vYPosition);
          vec3 gradientColor = mix(color1, color2, gradientFactor);

          // Apply color glitch effect with per-particle offsets
          vec3 color;
          color.r = gradientColor.r + chromaticShift * vColorOffset.r;
          color.g = gradientColor.g + chromaticShift * vColorOffset.g;
          color.b = gradientColor.b + chromaticShift * vColorOffset.b;

          if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.475) discard;
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    const particles = new THREE.Points(geometry, material);
    particles.rotation.set(rotation.x, rotation.y, rotation.z); // Apply initial rotation
    scene.add(particles);
    particlesRef.current = particles;

    const onClick = () => {
      chromaticShiftRef.current = true;
      shiftStartRef.current = performance.now();
      distortions.current = distortions.current.map(
        () => Math.random() * 30 - 15,
      );
    };
    window.addEventListener("click", onClick);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      render();
    };

    const render = () => {
      const elapsedTime = performance.now() - shiftStartRef.current;
      const positions = particles.geometry.attributes.position
        .array as Float32Array;

      let i = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          const distortion =
            chromaticShiftRef.current && elapsedTime < GLITCH_DURATION
              ? distortions.current[i / 3]
              : 0;
          positions[i + 1] =
            Math.sin((ix + countRef.current) * 0.3) * 50 +
            Math.sin((iy + countRef.current) * 0.5) * 50 +
            distortion;
          i += 3;
        }
      }

      particles.geometry.attributes.position.needsUpdate = true;

      if (chromaticShiftRef.current) {
        if (elapsedTime < GLITCH_DURATION) {
          material.uniforms.chromaticShift.value =
            Math.sin(elapsedTime * 0.03) * GLITCH_INTENSITY;
        } else {
          chromaticShiftRef.current = false;
          material.uniforms.chromaticShift.value = 0;
        }
      }

      renderer.render(scene, camera);
      countRef.current += WAVE_SPEED;
    };

    animate();

    return () => {
      window.removeEventListener("click", onClick);
      cancelAnimationFrame(animationId); // Stop previous animation loop
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [rotation, windowSize]); // Re-run effect when window size changes

  return (
    <div
      ref={containerRef}
      style={{ touchAction: "none" }}
      className="fixed inset-0 w-full h-full"
    />
  );
};

export default WaveParticles;
