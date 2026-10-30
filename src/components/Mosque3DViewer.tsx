"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Mosque3DViewer() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 360;
    const height = container.clientHeight || 360;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4.2, 7.5);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. Base Pedestal (Marble Plinth with Gold Edge)
    const baseGeo = new THREE.CylinderGeometry(2.4, 2.6, 0.25, 48);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x052e16, // deep emerald
      roughness: 0.3,
      metalness: 0.6,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.12;
    baseMesh.receiveShadow = true;
    rootGroup.add(baseMesh);

    // Base Gold Ring
    const ringGeo = new THREE.TorusGeometry(2.42, 0.04, 16, 64);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37, // Royal gold
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x5a4505,
      emissiveIntensity: 0.2,
    });
    const goldRing = new THREE.Mesh(ringGeo, goldMat);
    goldRing.rotation.x = Math.PI / 2;
    goldRing.position.y = 0.02;
    rootGroup.add(goldRing);

    // 2. Kaaba Cube
    const cubeSize = 1.6;
    const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize * 1.15, cubeSize);
    const cubeMat = new THREE.MeshStandardMaterial({
      color: 0x111315, // Kiswah Dark Charcoal
      roughness: 0.5,
      metalness: 0.2,
    });
    const kaaba = new THREE.Mesh(cubeGeo, cubeMat);
    kaaba.position.y = (cubeSize * 1.15) / 2 + 0.05;
    kaaba.castShadow = true;
    kaaba.receiveShadow = true;
    rootGroup.add(kaaba);

    // Kaaba Gold Band (Hizam)
    const bandWidth = 0.18;
    const bandGeo = new THREE.BoxGeometry(cubeSize + 0.02, bandWidth, cubeSize + 0.02);
    const bandMesh = new THREE.Mesh(bandGeo, goldMat);
    bandMesh.position.y = kaaba.position.y + 0.32;
    rootGroup.add(bandMesh);

    // Kaaba Door (Bab ar-Rahmah) in Gold
    const doorGeo = new THREE.PlaneGeometry(0.35, 0.7);
    const doorMesh = new THREE.Mesh(doorGeo, goldMat);
    doorMesh.position.set(0, kaaba.position.y - 0.1, cubeSize / 2 + 0.015);
    rootGroup.add(doorMesh);

    // 3. Orbiting Prayer Time Rings (Fajr, Dhuhr, Asr, Maghrib, Isha)
    const orbitCount = 5;
    const orbitGroup = new THREE.Group();
    rootGroup.add(orbitGroup);

    const orbitMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x6ee7b7, emissive: 0x059669, emissiveIntensity: 0.6 }), // Fajr
      new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xeab308, emissiveIntensity: 0.6 }), // Dhuhr
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xd97706, emissiveIntensity: 0.6 }), // Asr
      new THREE.MeshStandardMaterial({ color: 0xf87171, emissive: 0xdc2626, emissiveIntensity: 0.6 }), // Maghrib
      new THREE.MeshStandardMaterial({ color: 0x818cf8, emissive: 0x4f46e5, emissiveIntensity: 0.6 }), // Isha
    ];

    const orbs: THREE.Mesh[] = [];

    for (let i = 0; i < orbitCount; i++) {
      const radius = 2.05 + i * 0.22;
      const trackGeo = new THREE.RingGeometry(radius - 0.006, radius + 0.006, 64);
      const trackMat = new THREE.MeshBasicMaterial({
        color: 0x34d399,
        transparent: true,
        opacity: 0.25 - i * 0.03,
        side: THREE.DoubleSide,
      });
      const track = new THREE.Mesh(trackGeo, trackMat);
      track.rotation.x = Math.PI / 2;
      track.position.y = 0.05 + i * 0.12;
      orbitGroup.add(track);

      // Glowing Sphere on each track
      const orbGeo = new THREE.SphereGeometry(0.065, 16, 16);
      const orb = new THREE.Mesh(orbGeo, orbitMaterials[i]);
      orb.userData = { radius, speed: 0.4 + i * 0.12, offset: (i * Math.PI * 2) / orbitCount, y: track.position.y };
      orbitGroup.add(orb);
      orbs.push(orb);
    }

    // 4. Subtle Floating Particle Dust (ambient barakah atmosphere)
    const particleCount = 70;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 6;
      positions[i + 1] = Math.random() * 4;
      positions[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xd4af37,
      size: 0.035,
      transparent: true,
      opacity: 0.5,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5db, 2.2);
    dirLight.position.set(5, 8, 4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const goldPointLight = new THREE.PointLight(0xf59e0b, 1.8, 8);
    goldPointLight.position.set(0, 1.8, 1.8);
    scene.add(goldPointLight);

    const emeraldPointLight = new THREE.PointLight(0x10b981, 1.5, 6);
    emeraldPointLight.position.set(-2, 0.5, -2);
    scene.add(emeraldPointLight);

    // Interactive Drag / Rotation
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      previousMousePosition = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - previousMousePosition.x;
      const deltaY = clientY - previousMousePosition.y;

      rootGroup.rotation.y += deltaX * 0.01;
      rootGroup.rotation.x = Math.max(-0.2, Math.min(0.5, rootGroup.rotation.x + deltaY * 0.005));

      previousMousePosition = { x: clientX, y: clientY };
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);

    domEl.addEventListener("touchstart", handlePointerDown, { passive: true });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    window.addEventListener("touchend", handlePointerUp);

    // Responsive Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Slow gentle auto-rotation when user is not dragging
      if (!isDragging) {
        rootGroup.rotation.y += 0.005;
      }

      // Orbiting Prayer Lights
      orbs.forEach((orb) => {
        const { radius, speed, offset, y } = orb.userData;
        const angle = elapsedTime * speed + offset;
        orb.position.x = Math.cos(angle) * radius;
        orb.position.z = Math.sin(angle) * radius;
        orb.position.y = y;
      });

      // Float particles
      particles.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      domEl.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      domEl.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[340px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none">
      <div ref={mountRef} className="w-full h-full flex items-center justify-center" />
      {/* Interactive Helper Hint */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/20 backdrop-blur-md text-[10px] text-emerald-300 font-mono tracking-wider flex items-center gap-1.5 pointer-events-none shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-ping inline-block" />
        <span>3D Kaaba &amp; Celestial Orbit • Drag to Rotate</span>
      </div>
    </div>
  );
}
