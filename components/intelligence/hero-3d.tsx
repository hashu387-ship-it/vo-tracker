'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Cinematic 3D hero — a rotating point-cloud sphere wrapped in a faint
 * wireframe icosahedron, with cursor parallax. Raw Three.js, rendered behind
 * the hero content. Loaded client-only (no SSR) and fully disposed on unmount.
 */
export function Hero3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    let W = parent.clientWidth || 800;
    let H = parent.clientHeight || 240;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H, false);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
    camera.position.z = 5;

    const group = new THREE.Group();
    scene.add(group);

    // Fibonacci-sphere point cloud, coloured emerald → gold by latitude.
    const COUNT = 1100;
    const R = 2.15;
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const cA = new THREE.Color('#9E875D');
    const cB = new THREE.Color('#E1CFA6');
    for (let i = 0; i < COUNT; i++) {
      const t = i / COUNT;
      const phi = Math.acos(1 - 2 * t);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const x = R * Math.sin(phi) * Math.cos(theta);
      const y = R * Math.sin(phi) * Math.sin(theta);
      const z = R * Math.cos(phi);
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      const c = cA.clone().lerp(cB, (y / R + 1) / 2);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geo, mat);
    group.add(points);

    // Faint wireframe shell.
    const edgeGeo = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(R, 1));
    const edgeMat = new THREE.LineBasicMaterial({ color: '#C5A065', transparent: true, opacity: 0.16 });
    const shell = new THREE.LineSegments(edgeGeo, edgeMat);
    group.add(shell);

    const mouse = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      const r = parent.getBoundingClientRect();
      mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.y = ((e.clientY - r.top) / r.height) * 2 - 1;
    };
    parent.addEventListener('mousemove', onMove);

    const clock = new THREE.Clock();
    let raf = 0;
    const animate = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      group.rotation.y += dt * 0.14;
      shell.rotation.y -= dt * 0.06;
      shell.rotation.x += dt * 0.03;
      group.rotation.x += (mouse.y * 0.3 - group.rotation.x) * 0.04;
      camera.position.x += (mouse.x * 0.7 - camera.position.x) * 0.04;
      camera.position.y += (-mouse.y * 0.5 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const ro = new ResizeObserver(() => {
      W = parent.clientWidth || W;
      H = parent.clientHeight || H;
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    });
    ro.observe(parent);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      parent.removeEventListener('mousemove', onMove);
      geo.dispose();
      mat.dispose();
      edgeGeo.dispose();
      edgeMat.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full opacity-80" />;
}
