import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import type { Mesh } from "three";

// ─── Face configuration ────────────────────────────────────────────────────────
const FACES = [
  {
    label: "70% OFF",
    sub: "On All Brands",
    accent: "#FF6B35",
    attenuation: "#ffe8d6",
    slides: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=512&q=80",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=512&q=80",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=512&q=80",
    ],
  },
  {
    label: "50% OFF",
    sub: "Flash Sale",
    accent: "#7C4DFF",
    attenuation: "#ede8ff",
    slides: [
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=512&q=80",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=512&q=80",
      "https://images.unsplash.com/photo-1495385794356-15371f348c31?w=512&q=80",
    ],
  },
  {
    label: "60% OFF",
    sub: "Limited Time",
    accent: "#00BCD4",
    attenuation: "#d6f7ff",
    slides: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=512&q=80",
      "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=512&q=80",
      "https://images.unsplash.com/photo-1566206091558-7f218b696731?w=512&q=80",
    ],
  },
  {
    label: "40% OFF",
    sub: "Top Picks",
    accent: "#E91E63",
    attenuation: "#ffe8f0",
    slides: [
      "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=512&q=80",
      "https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=512&q=80",
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=512&q=80",
    ],
  },
  {
    label: "30% OFF",
    sub: "New Arrivals",
    accent: "#43A047",
    attenuation: "#d6f7e0",
    slides: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=512&q=80",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=512&q=80",
      "https://images.unsplash.com/photo-1588099768531-a72d4a198538?w=512&q=80",
    ],
  },
  {
    label: "MEGA SALE",
    sub: "Biggest Deals",
    accent: "#FF8F00",
    attenuation: "#fff3d6",
    slides: [
      "https://images.unsplash.com/photo-1496217590455-aa63a8350eea?w=512&q=80",
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=512&q=80",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=512&q=80",
    ],
  },
] as const;

// ─── Canvas texture generator ───────────────────────────────────────────────
function makeFaceTexture(
  faceIndex: number,
  slideIndex: number,
  img: HTMLImageElement | null,
): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const face = FACES[faceIndex];
  const totalSlides = face.slides.length;

  // ── 1. Draw image (cover) ────────────────────────────────────────────────
  if (img?.complete && img.naturalWidth > 0) {
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(size / iw, size / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (size - dw) / 2;
    const dy = (size - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  } else {
    // fallback gradient when image hasn't loaded
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, `${face.accent}cc`);
    grad.addColorStop(1, "#111111");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }

  // ── 2. Radial vignette — frames image inside the glass ───────────────────
  const radial = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.2,
    size / 2,
    size / 2,
    size * 0.72,
  );
  radial.addColorStop(0, "rgba(0,0,0,0.08)");
  radial.addColorStop(1, "rgba(0,0,0,0.62)");
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, size, size);

  // ── 3. Accent color tint (glass color) ─────────────────────────────────
  ctx.fillStyle = `${face.accent}55`; // ~33% opacity tint
  ctx.fillRect(0, 0, size, size);

  // ── 4. Glass edge reflections ────────────────────────────────────────────
  // Top edge highlight (strongest)
  const topEdge = ctx.createLinearGradient(0, 0, 0, 70);
  topEdge.addColorStop(0, "rgba(255,255,255,0.70)");
  topEdge.addColorStop(0.5, "rgba(255,255,255,0.25)");
  topEdge.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = topEdge;
  ctx.fillRect(0, 0, size, 70);

  // Left edge highlight
  const leftEdge = ctx.createLinearGradient(0, 0, 45, 0);
  leftEdge.addColorStop(0, "rgba(255,255,255,0.45)");
  leftEdge.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = leftEdge;
  ctx.fillRect(0, 0, 45, size);

  // Bottom edge subtle
  const bottomEdge = ctx.createLinearGradient(0, size, 0, size - 35);
  bottomEdge.addColorStop(0, "rgba(255,255,255,0.20)");
  bottomEdge.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = bottomEdge;
  ctx.fillRect(0, size - 35, size, 35);

  // Right edge subtle
  const rightEdge = ctx.createLinearGradient(size, 0, size - 28, 0);
  rightEdge.addColorStop(0, "rgba(255,255,255,0.25)");
  rightEdge.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = rightEdge;
  ctx.fillRect(size - 28, 0, 28, size);

  // Diagonal inner shimmer (top-left corner sparkle)
  const shimmer = ctx.createRadialGradient(80, 80, 0, 80, 80, 120);
  shimmer.addColorStop(0, "rgba(255,255,255,0.30)");
  shimmer.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = shimmer;
  ctx.fillRect(0, 0, 200, 200);

  // ── 5. Dark vignette on all edges ────────────────────────────────────────
  const vignette = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.3,
    size / 2,
    size / 2,
    size * 0.75,
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.38)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, size, size);

  // ── 6. Main discount label with glow ────────────────────────────────────
  const labelY = size * 0.64;
  const fontSize = face.label.length > 6 ? size * 0.18 : size * 0.22;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Glow pass 1 — colored halo
  ctx.font = `900 ${fontSize}px 'Arial Black', Arial, sans-serif`;
  ctx.shadowColor = face.accent;
  ctx.shadowBlur = 28;
  ctx.fillStyle = face.accent;
  ctx.fillText(face.label, size / 2, labelY);

  // Glow pass 2 — white on top
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(face.label, size / 2, labelY);
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 0;

  // ── 7. Sub-label ─────────────────────────────────────────────────────────
  ctx.font = `600 ${size * 0.075}px Arial, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 8;
  ctx.fillText(face.sub, size / 2, labelY + fontSize * 0.72);
  ctx.shadowBlur = 0;

  // ── 8. V-7 SHOP branding (top-left) ─────────────────────────────────────
  ctx.textAlign = "left";
  ctx.font = `bold ${size * 0.055}px Arial, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = 6;
  ctx.fillText("V-7 SHOP", 22, 36);
  ctx.shadowBlur = 0;

  // ── 9. Slide indicator dots ──────────────────────────────────────────────
  const dotRadius = 6;
  const dotSpacing = 22;
  const dotsStartX = size / 2 - ((totalSlides - 1) * dotSpacing) / 2;
  const dotsY = size - 24;
  for (let i = 0; i < totalSlides; i++) {
    const dotX = dotsStartX + i * dotSpacing;
    ctx.beginPath();
    ctx.arc(dotX, dotsY, dotRadius, 0, Math.PI * 2);
    if (i === slideIndex) {
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.fill();
    } else {
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// ─── Pre-load all images ──────────────────────────────────────────────────────
function preloadImages(): Promise<(HTMLImageElement | null)[][]> {
  return Promise.all(
    FACES.map((face) =>
      Promise.all(
        face.slides.map(
          (url) =>
            new Promise<HTMLImageElement | null>((resolve) => {
              const img = new Image();
              img.crossOrigin = "anonymous";
              img.onload = () => resolve(img);
              img.onerror = () => resolve(null);
              img.src = url;
            }),
        ),
      ),
    ),
  );
}

// ─── Inner 3D Scene ───────────────────────────────────────────────────────────
function CrystalMesh({
  slideIndices,
}: {
  slideIndices: number[];
}) {
  const meshRef = useRef<Mesh>(null);
  const isDragging = useRef(false);
  const lastDrag = useRef(0);
  const { gl } = useThree();

  // Loaded images: [faceIndex][slideIndex] = HTMLImageElement | null
  const imagesRef = useRef<(HTMLImageElement | null)[][]>(
    FACES.map((f) => f.slides.map(() => null)),
  );
  const imagesReady = useRef(false);

  // Materials array ref so we can update textures imperatively
  const materialsRef = useRef<THREE.MeshPhysicalMaterial[]>([]);

  // Build initial materials once
  const materials = useMemo(() => {
    const mats = FACES.map((face, i) => {
      const tex = makeFaceTexture(i, 0, null);
      const mat = new THREE.MeshPhysicalMaterial({
        map: tex,
        transparent: true,
        opacity: 0.92,
        roughness: 0.0,
        metalness: 0.0,
        transmission: 0.85,
        thickness: 1.8,
        envMapIntensity: 3.0,
        reflectivity: 1.0,
        ior: 1.72,
        clearcoat: 1.0,
        clearcoatRoughness: 0.0,
        attenuationDistance: 0.5,
        attenuationColor: new THREE.Color(face.attenuation),
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      return mat;
    });
    materialsRef.current = mats;
    return mats;
  }, []);

  // Preload images on mount (slideIndices are all 0 on first mount, use 0 directly)
  useEffect(() => {
    let cancelled = false;
    preloadImages().then((loaded) => {
      if (cancelled) return;
      imagesRef.current = loaded;
      imagesReady.current = true;
      // Refresh all face textures with loaded images (initial slide = 0)
      FACES.forEach((_, i) => {
        const mat = materialsRef.current[i];
        if (!mat) return;
        const oldTex = mat.map;
        mat.map = makeFaceTexture(i, 0, loaded[i]?.[0] ?? null);
        mat.needsUpdate = true;
        oldTex?.dispose();
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Update texture when slideIndex changes for a given face
  useEffect(() => {
    if (!imagesReady.current) return;
    FACES.forEach((_, i) => {
      const mat = materialsRef.current[i];
      if (!mat) return;
      const img = imagesRef.current[i]?.[slideIndices[i]] ?? null;
      const oldTex = mat.map;
      mat.map = makeFaceTexture(i, slideIndices[i], img);
      mat.needsUpdate = true;
      oldTex?.dispose();
    });
  }, [slideIndices]);

  // Pointer / touch handlers
  const onPointerDown = useCallback(() => {
    isDragging.current = true;
  }, []);

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
    lastDrag.current = performance.now();
  }, []);

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("touchstart", onPointerDown, { passive: true });
    canvas.addEventListener("touchend", onPointerUp, { passive: true });
    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("touchstart", onPointerDown);
      canvas.removeEventListener("touchend", onPointerUp);
    };
  }, [gl.domElement, onPointerDown, onPointerUp]);

  // Auto-rotate after idle
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const elapsed = performance.now() - lastDrag.current;
    if (!isDragging.current && elapsed > 2000) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x +=
        Math.sin(meshRef.current.rotation.y * 0.45) * delta * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} material={materials} castShadow receiveShadow>
      <boxGeometry args={[2.4, 2.4, 2.4]} />
    </mesh>
  );
}

// ─── Background plane (gives the glass something to refract against) ──────────
function BackgroundPlane() {
  return (
    <mesh position={[0, 0, -4]} receiveShadow>
      <planeGeometry args={[20, 12]} />
      <meshBasicMaterial color="#050510" transparent opacity={0.92} />
    </mesh>
  );
}

// ─── Full scene ───────────────────────────────────────────────────────────────
function Scene({ slideIndices }: { slideIndices: number[] }) {
  // Slowly orbiting accent point light for moving specular highlights
  const orbitLight = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (!orbitLight.current) return;
    const t = clock.getElapsedTime();
    orbitLight.current.position.set(
      Math.sin(t * 0.55) * 5,
      Math.cos(t * 0.32) * 4,
      Math.cos(t * 0.55) * 5,
    );
  });

  return (
    <>
      {/* Environment map — massively improves glass realism */}
      <Environment preset="studio" />

      {/* Ambient */}
      <ambientLight intensity={0.5} />

      {/* Key light — strong specular */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={2.8}
        color="#ffffff"
        castShadow
      />

      {/* Fill lights with colored tints */}
      <pointLight position={[-5, 4, -3]} intensity={2.0} color="#a78bfa" />
      <pointLight position={[5, -4, 4]} intensity={1.5} color="#fb923c" />
      <pointLight position={[0, 6, 0]} intensity={1.2} color="#38bdf8" />
      <pointLight position={[-3, -5, 3]} intensity={1.0} color="#f472b6" />

      {/* Rim light from behind */}
      <spotLight
        position={[-4, 2, -6]}
        target-position={[0, 0, 0]}
        intensity={3.5}
        color="#ffffff"
        angle={0.4}
        penumbra={0.7}
      />

      {/* Orbiting specular highlight */}
      <pointLight ref={orbitLight} intensity={1.8} color="#e8f4ff" />

      <BackgroundPlane />
      <CrystalMesh slideIndices={slideIndices} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
        dampingFactor={0.06}
        enableDamping={true}
        rotateSpeed={0.8}
      />
    </>
  );
}

function Fallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-primary/10 rounded-xl">
      <div className="text-primary-foreground/60 text-sm animate-pulse">
        Loading 3D Cube…
      </div>
    </div>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────
export function CrystalCube() {
  // Per-face slide indices, staggered cycling
  const [slideIndices, setSlideIndices] = useState<number[]>([
    0, 0, 0, 0, 0, 0,
  ]);

  useEffect(() => {
    const timers: ReturnType<typeof setInterval>[] = [];
    const delays: ReturnType<typeof setTimeout>[] = [];

    FACES.forEach((face, faceIdx) => {
      const totalSlides = face.slides.length;
      // Stagger start by faceIndex * 700ms
      const delay = setTimeout(() => {
        const interval = setInterval(() => {
          setSlideIndices((prev) => {
            const next = [...prev];
            next[faceIdx] = (next[faceIdx] + 1) % totalSlides;
            return next;
          });
        }, 2500);
        timers.push(interval);
      }, faceIdx * 700);
      delays.push(delay);
    });

    return () => {
      delays.forEach(clearTimeout);
      timers.forEach(clearInterval);
    };
  }, []);

  return (
    <div
      className="w-full rounded-xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
      style={{ height: "clamp(260px, 35vw, 340px)" }}
      aria-label="3D rotating crystal cube showing discount offers"
    >
      <Suspense fallback={<Fallback />}>
        <Canvas
          camera={{ position: [0, 0, 5.5], fov: 42 }}
          gl={{
            antialias: true,
            alpha: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.4,
          }}
          style={{ background: "transparent" }}
          shadows
        >
          <Scene slideIndices={slideIndices} />
        </Canvas>
      </Suspense>
    </div>
  );
}
