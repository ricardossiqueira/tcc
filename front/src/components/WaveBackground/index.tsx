"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';

const SEPARATION = 100;
const AMOUNTX = 160;
const AMOUNTY = 80;
const WAVE_SPEED = 0.0125; // Macro to control wave speed

const WaveParticles: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<Stats | null>(null);
  const countRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set up camera with an isometric perspective
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 600, 1200); // Move camera to an isometric angle
    camera.lookAt(0, 0, 0); // Center the camera on the origin

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Set background to black for dark theme

    // Particle grid setup
    const numParticles = AMOUNTX * AMOUNTY;
    const positions = new Float32Array(numParticles * 3);

    let i = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        positions[i] = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
        positions[i + 1] = 0;
        positions[i + 2] = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;
        i += 3;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        color1: { value: new THREE.Color(0x333333) },
        color2: { value: new THREE.Color(0x999999) },
      },
      vertexShader: `
        varying float vYPosition;

        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 4.0; // Set a fixed point size for the particles
          vYPosition = position.y; // Pass y position to fragment shader
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        varying float vYPosition;

        void main() {
          // Define gradient based on the y position of each particle
          float gradientFactor = smoothstep(-250.0, 250.0, vYPosition);
          vec3 gradientColor = mix(color1, color2, gradientFactor);

          if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.475) discard;
          gl_FragColor = vec4(gradientColor, 1.0);
        }
      `,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const stats = new Stats();
    statsRef.current = stats;
    container.appendChild(stats.dom);

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onWindowResize);

    const animate = () => {
      requestAnimationFrame(animate);
      render();
      stats.update();
    };

    const render = () => {
      const positions = particles.geometry.attributes.position.array as Float32Array;
      let i = 0;

      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          positions[i + 1] = (Math.sin((ix + countRef.current) * 0.3) * 50) +
            (Math.sin((iy + countRef.current) * 0.5) * 50);
          i += 3;
        }
      }

      particles.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      countRef.current += WAVE_SPEED; // Use WAVE_SPEED macro to control wave speed
    };

    animate();

    return () => {
      window.removeEventListener('resize', onWindowResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ touchAction: 'none' }}
      className="fixed inset-0 w-full h-full -z-10"
    >
      <div id="info"></div>
    </div>
  );
};

export default WaveParticles;
