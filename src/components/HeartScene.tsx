import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { DeviceModel } from './DeviceModel'
import { BloodParticles } from './BloodParticles'
import { Suspense } from 'react'

export function HeartScene() {
  return (
    <Canvas
      camera={{ position: [4, 1.5, 5.5], fov: 40 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={['#101216']} />
      <fog attach="fog" args={['#101216', 12, 24]} />

      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 7, 4]} intensity={0.9} castShadow />
      <directionalLight position={[-3, 4, -2]} intensity={0.2} color="#aabbcc" />
      <pointLight position={[0, 2, 5]} intensity={0.35} />
      <spotLight position={[0, 10, 2]} angle={0.2} penumbra={1} intensity={0.4} castShadow />

      <Suspense fallback={null}>
        <DeviceModel />
        <BloodParticles />
        <ContactShadows
          position={[0, -3.8, 0]}
          opacity={0.3}
          scale={10}
          blur={2}
          far={5}
        />
        <Environment preset="studio" />
      </Suspense>

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3.5}
        maxDistance={16}
        autoRotate
        autoRotateSpeed={0.2}
        target={[0, -0.5, 0]}
        maxPolarAngle={Math.PI * 0.85}
      />
    </Canvas>
  )
}
