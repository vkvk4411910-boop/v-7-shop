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

// ─── Vivid fallback gradients (never dark/black) ──────────────────────────────
const FALLBACK_GRADIENTS = [
  ["#FF006E", "#FF6B35", "#FFBE0B"], // hot pink → orange → yellow
  ["#9B5DE5", "#7C4DFF", "#00B4D8"], // purple → violet → blue
  ["#00B4D8", "#06D6A0", "#00BCD4"], // sky → teal → cyan
  ["#FF006E", "#E91E63", "#FF8F00"], // pink → rose → amber
  ["#06D6A0", "#43A047", "#00BCD4"], // mint → green → cyan
  ["#FF8F00", "#F77F00", "#FF006E"], // amber → coral → pink
];

// ─── Face configuration — 5 Picsum images per face (IDs always available) ─────
// Picsum format: https://picsum.photos/id/{ID}/512/512
// Using portrait/fashion-appropriate IDs from Picsum's curated library
const FACES = [
  {
    label: "70% OFF",
    sub: "On All Brands",
    accent: "#FF6B35",
    attenuation: "#ffe8d6",
    slides: [
      "https://picsum.photos/id/64/512/512",
      "https://picsum.photos/id/177/512/512",
      "https://picsum.photos/id/338/512/512",
      "https://picsum.photos/id/96/512/512",
      "https://picsum.photos/id/247/512/512",
    ],
  },
  {
    label: "50% OFF",
    sub: "Flash Sale",
    accent: "#7C4DFF",
    attenuation: "#ede8ff",
    slides: [
      "https://picsum.photos/id/1/512/512",
      "https://picsum.photos/id/10/512/512",
      "https://picsum.photos/id/20/512/512",
      "https://picsum.photos/id/30/512/512",
      "https://picsum.photos/id/37/512/512",
    ],
  },
  {
    label: "60% OFF",
    sub: "Limited Time",
    accent: "#00BCD4",
    attenuation: "#d6f7ff",
    slides: [
      "https://picsum.photos/id/48/512/512",
      "https://picsum.photos/id/57/512/512",
      "https://picsum.photos/id/74/512/512",
      "https://picsum.photos/id/83/512/512",
      "https://picsum.photos/id/91/512/512",
    ],
  },
  {
    label: "40% OFF",
    sub: "Top Picks",
    accent: "#E91E63",
    attenuation: "#ffe8f0",
    slides: [
      "https://picsum.photos/id/103/512/512",
      "https://picsum.photos/id/111/512/512",
      "https://picsum.photos/id/119/512/512",
      "https://picsum.photos/id/122/512/512",
      "https://picsum.photos/id/137/512/512",
    ],
  },
  {
    label: "30% OFF",
    sub: "New Arrivals",
    accent: "#43A047",
    attenuation: "#d6f7e0",
    slides: [
      "https://picsum.photos/id/145/512/512",
      "https://picsum.photos/id/152/512/512",
      "https://picsum.photos/id/159/512/512",
      "https://picsum.photos/id/162/512/512",
      "https://picsum.photos/id/191/512/512",
    ],
  },
  {
    label: "MEGA SALE",
    sub: "Biggest Deals",
    accent: "#FF8F00",
    attenuation: "#fff3d6",
    slides: [
      "https://picsum.photos/id/200/512/512",
      "https://picsum.photos/id/213/512/512",
      "https://picsum.photos/id/217/512/512",
      "https://picsum.photos/id/237/512/512",
      "https://picsum.photos/id/248/512/512",
    ],
  },
];

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
  const fallbackColors = FALLBACK_GRADIENTS[faceIndex];
  const totalSlides = face.slides.length;

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
    // Vivid fallback gradient — never dark/black
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, fallbackColors[0]);
    grad.addColorStop(0.5, fallbackColors[1]);
    grad.addColorStop(1, fallbackColors[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Add a circular highlight to make it look intentional
    const highlight = ctx.createRadialGradient(
      size * 0.35,
      size * 0.3,
      0,
      size * 0.5,
      size * 0.5,
      size * 0.7,
    );
    highlight.addColorStop(0, "rgba(255,255,255,0.35)");
    highlight.addColorStop(1, "rgba(0,0,0,0.2)");
    ctx.fillStyle = highlight;
    ctx.fillRect(0, 0, size, size);
  }

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

  ctx.fillStyle = `${face.accent}55`;
  ctx.fillRect(0, 0, size, size);

  const topEdge = ctx.createLinearGradient(0, 0, 0, 70);
  topEdge.addColorStop(0, "rgba(255,255,255,0.70)");
  topEdge.addColorStop(0.5, "rgba(255,255,255,0.25)");
  topEdge.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = topEdge;
  ctx.fillRect(0, 0, size, 70);

  const leftEdge = ctx.createLinearGradient(0, 0, 45, 0);
  leftEdge.addColorStop(0, "rgba(255,255,255,0.45)");
  leftEdge.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = leftEdge;
  ctx.fillRect(0, 0, 45, size);

  const bottomEdge = ctx.createLinearGradient(0, size, 0, size - 35);
  bottomEdge.addColorStop(0, "rgba(255,255,255,0.20)");
  bottomEdge.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = bottomEdge;
  ctx.fillRect(0, size - 35, size, 35);

  const rightEdge = ctx.createLinearGradient(size, 0, size - 28, 0);
  rightEdge.addColorStop(0, "rgba(255,255,255,0.25)");
  rightEdge.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = rightEdge;
  ctx.fillRect(size - 28, 0, 28, size);

  const shimmer = ctx.createRadialGradient(80, 80, 0, 80, 80, 120);
  shimmer.addColorStop(0, "rgba(255,255,255,0.30)");
  shimmer.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = shimmer;
  ctx.fillRect(0, 0, 200, 200);

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

  const labelY = size * 0.64;
  const fontSize = face.label.length > 6 ? size * 0.18 : size * 0.22;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.font = `900 ${fontSize}px 'Arial Black', Arial, sans-serif`;
  ctx.shadowColor = face.accent;
  ctx.shadowBlur = 28;
  ctx.fillStyle = face.accent;
  ctx.fillText(face.label, size / 2, labelY);

  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(face.label, size / 2, labelY);
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 0;

  ctx.font = `600 ${size * 0.075}px Arial, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 8;
  ctx.fillText(face.sub, size / 2, labelY + fontSize * 0.72);
  ctx.shadowBlur = 0;

  ctx.textAlign = "left";
  ctx.font = `bold ${size * 0.055}px Arial, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = 6;
  ctx.fillText("V-7 SHOP", 22, 36);
  ctx.shadowBlur = 0;

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
              img.onload = () => {
                if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                  resolve(img);
                } else {
                  console.warn(
                    `[CrystalCube] Image loaded with zero dimensions: ${url}`,
                  );
                  resolve(null);
                }
              };
              img.onerror = () => {
                console.warn(`[CrystalCube] Failed to load image: ${url}`);
                resolve(null);
              };
              img.src = url;
            }),
        ),
      ),
    ),
  );
}

// ─── Pre-build all textures for every face × slide ────────────────────────────
// Returns textures[faceIndex][slideIndex]
function buildAllTextures(
  images: (HTMLImageElement | null)[][],
): THREE.CanvasTexture[][] {
  return FACES.map((_, fi) =>
    FACES[fi].slides.map((__, si) =>
      makeFaceTexture(fi, si, images[fi]?.[si] ?? null),
    ),
  );
}

// ─── Inner 3D Scene ───────────────────────────────────────────────────────────
function CrystalMesh({ slideIndices }: { slideIndices: number[] }) {
  const meshRef = useRef<Mesh>(null);
  const isDragging = useRef(false);
  const lastDrag = useRef(0);
  const autoRotateSpeed = useRef(0);
  const { gl } = useThree();

  // Cached textures: [faceIndex][slideIndex]
  const textureCache = useRef<THREE.CanvasTexture[][] | null>(null);
  const materialsRef = useRef<THREE.MeshPhysicalMaterial[]>([]);

  // Build initial materials (fallback gradient while images load)
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

  // On mount: preload ALL images → build ALL textures at once → apply slide 0
  useEffect(() => {
    let cancelled = false;
    preloadImages().then((loaded) => {
      if (cancelled) return;
      // Build full texture cache (all slides × all faces)
      const cache = buildAllTextures(loaded);
      textureCache.current = cache;
      // Apply initial textures (slide 0 per face)
      FACES.forEach((_, fi) => {
        const mat = materialsRef.current[fi];
        if (!mat) return;
        const oldTex = mat.map;
        mat.map = cache[fi][0];
        mat.needsUpdate = true;
        oldTex?.dispose();
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Swap texture from cache — no canvas regeneration on slide change
  useEffect(() => {
    if (!textureCache.current) return;
    FACES.forEach((_, fi) => {
      const mat = materialsRef.current[fi];
      if (!mat) return;
      const cached = textureCache.current![fi]?.[slideIndices[fi]];
      if (cached && mat.map !== cached) {
        mat.map = cached;
        mat.needsUpdate = true;
      }
    });
  }, [slideIndices]);

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

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const elapsed = performance.now() - lastDrag.current;
    const shouldRotate = !isDragging.current && elapsed > 2000;

    const targetSpeed = shouldRotate ? 0.3 : 0;
    autoRotateSpeed.current +=
      (targetSpeed - autoRotateSpeed.current) * Math.min(delta * 2.5, 1);

    if (autoRotateSpeed.current > 0.001) {
      meshRef.current.rotation.y += delta * autoRotateSpeed.current;
      meshRef.current.rotation.x +=
        (Math.sin(meshRef.current.rotation.y * 0.4) *
          0.15 *
          delta *
          autoRotateSpeed.current) /
        0.3;
    }
  });

  return (
    <mesh ref={meshRef} material={materials} castShadow receiveShadow>
      <boxGeometry args={[2.4, 2.4, 2.4]} />
    </mesh>
  );
}

// ─── Full scene — 3 lights, no background plane ───────────────────────────────
function Scene({ slideIndices }: { slideIndices: number[] }) {
  return (
    <>
      {/* Environment map — improves glass realism without extra lights */}
      <Environment preset="studio" />

      {/* 1. Ambient — base illumination */}
      <ambientLight intensity={0.6} />

      {/* 2. Key light — primary specular */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={2.8}
        color="#ffffff"
        castShadow
      />

      {/* 3. Colored fill — adds chromatic glass look */}
      <pointLight position={[-5, 4, -3]} intensity={2.0} color="#a78bfa" />

      <CrystalMesh slideIndices={slideIndices} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
        dampingFactor={0.11}
        enableDamping={true}
        rotateSpeed={0.7}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI - 0.3}
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
  const [slideIndices, setSlideIndices] = useState<number[]>([
    0, 0, 0, 0, 0, 0,
  ]);

  useEffect(() => {
    const timers: ReturnType<typeof setInterval>[] = [];
    const delays: ReturnType<typeof setTimeout>[] = [];

    FACES.forEach((face, faceIdx) => {
      const totalSlides = face.slides.length;
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
