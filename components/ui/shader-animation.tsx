"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ShaderAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    camera: THREE.Camera;
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    uniforms: any;
    animationId: number;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const vertexShader = `
      void main() {
        gl_Position = vec4( position, 1.0 );
      }
    `;

    // Fragment shader — cyan / violet / orange channels tuned to match
    // CarSpotter's premium palette. Smooth lines, mid-tempo animation.
    const fragmentShader = `
      #define TWO_PI 6.2831853072
      #define PI 3.14159265359

      precision highp float;
      uniform vec2 resolution;
      uniform float time;

      void main(void) {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        float t = time * 0.04;
        float lineWidth = 0.0018;

        vec3 color = vec3(0.0);
        for (int j = 0; j < 3; j++) {
          for (int i = 0; i < 5; i++) {
            color[j] += lineWidth * float(i*i) /
              abs(fract(t - 0.01*float(j) + float(i)*0.01)*5.0 - length(uv) + mod(uv.x + uv.y, 0.2));
          }
        }

        // Re-channel: cyan (R), violet (G→B), accent orange (B→R+G).
        // Original shader emits roughly (R, G, B) lines — we remap to
        // shift hue toward cyan-violet to match the brand.
        vec3 tinted = vec3(
          color.r * 0.35 + color.b * 0.85,   // R: faint orange tint
          color.r * 0.55 + color.g * 0.30,   // G: drives cyan mid
          color.g * 0.95 + color.b * 0.55    // B: violet + cyan core
        );

        gl_FragColor = vec4(tinted, 1.0);
      }
    `;

    const camera = new THREE.Camera();
    camera.position.z = 1;
    const scene = new THREE.Scene();
    const geometry = new THREE.PlaneGeometry(2, 2);
    const uniforms = {
      time: { type: "f", value: 1.0 },
      resolution: { type: "v2", value: new THREE.Vector2() },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      uniforms.resolution.value.x = renderer.domElement.width;
      uniforms.resolution.value.y = renderer.domElement.height;
    };
    onResize();
    window.addEventListener("resize", onResize, false);

    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      uniforms.time.value += 0.05;
      renderer.render(scene, camera);
      if (sceneRef.current) sceneRef.current.animationId = animationId;
    };

    sceneRef.current = { camera, scene, renderer, uniforms, animationId: 0 };
    animate();

    return () => {
      window.removeEventListener("resize", onResize);
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId);
        if (container && sceneRef.current.renderer.domElement.parentNode === container) {
          container.removeChild(sceneRef.current.renderer.domElement);
        }
        sceneRef.current.renderer.dispose();
        geometry.dispose();
        material.dispose();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: "#000", overflow: "hidden" }}
    />
  );
}
