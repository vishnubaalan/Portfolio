import { Suspense, useCallback, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Float,
  MeshDistortMaterial,
  Sparkles,
  Environment,
  OrbitControls,
} from '@react-three/drei';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppSelector } from '../../hooks/redux';

const REACTIONS = [
  'Systems thinking, always.',
  'Building Jarvis, one commit at a time.',
  'Fullstack. Fullbrained.',
  'GOAP > guesswork.',
  "Learning is my long-term strategy.",
  'Ship, then polish.',
];

function Core({ pulsing, onPointerDown }) {
  const mesh = useRef(null);
  const targetScale = useRef(1);
  const currentScale = useRef(1);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += delta * 0.15;
    targetScale.current = pulsing ? 1.15 : 1;
    currentScale.current += (targetScale.current - currentScale.current) * 0.15;
    mesh.current.scale.setScalar(currentScale.current);
  });

  const resolved = useAppSelector((s) => s.theme.resolved);
  const isDark = resolved === 'dark';

  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={1.2}>
      <mesh
        ref={mesh}
        castShadow
        onPointerDown={onPointerDown}
        onPointerOver={() => (document.body.style.cursor = 'grab')}
        onPointerOut={() => (document.body.style.cursor = '')}
      >
        <icosahedronGeometry args={[1.35, 8]} />
        <MeshDistortMaterial
          color={isDark ? '#4F84EE' : '#3059D8'}
          emissive={isDark ? '#3E6BD8' : '#1F3FA8'}
          emissiveIntensity={isDark ? 0.4 : 0.18}
          roughness={0.15}
          metalness={0.7}
          distort={pulsing ? 0.5 : 0.32}
          speed={pulsing ? 3 : 1.4}
        />
      </mesh>
      <mesh scale={1.7}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial
          color={isDark ? '#DCB674' : '#A88044'}
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>
    </Float>
  );
}

export function AICore() {
  const resolved = useAppSelector((s) => s.theme.resolved);
  const [pulsing, setPulsing] = useState(false);
  const [message, setMessage] = useState(null);
  const timers = useRef([]);

  const handleClick = useCallback(() => {
    setPulsing(true);
    setMessage(REACTIONS[Math.floor(Math.random() * REACTIONS.length)]);
    timers.current.forEach(clearTimeout);
    timers.current = [
      setTimeout(() => setPulsing(false), 500),
      setTimeout(() => setMessage(null), 2600),
    ];
  }, []);

  return (
    <div className="absolute inset-0" data-lenis-prevent>
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={resolved === 'dark' ? 0.4 : 0.8} />
          <pointLight position={[5, 5, 5]} intensity={1.2} color="#4F84EE" />
          <pointLight position={[-5, -3, -2]} intensity={0.8} color="#DCB674" />
          <Core pulsing={pulsing} onPointerDown={handleClick} />
          <Sparkles
            count={70}
            scale={5}
            size={2}
            speed={0.3}
            color={resolved === 'dark' ? '#DCB674' : '#4F84EE'}
          />
          <Environment preset="night" />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            rotateSpeed={0.6}
            dampingFactor={0.08}
            enableDamping
            autoRotate
            autoRotateSpeed={0.4}
          />
        </Suspense>
      </Canvas>

      {/* Floating reaction chip */}
      <AnimatePresence>
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
            className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 whitespace-nowrap rounded-full glass px-3 py-1.5 text-xs font-medium text-text shadow-elevated"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint chip (fades once user has interacted) */}
      {!message && (
        <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-surface/40 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-text-subtle backdrop-blur">
          drag · click
        </div>
      )}
    </div>
  );
}
