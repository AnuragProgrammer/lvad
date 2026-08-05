import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useSimulationStore } from '../store/useSimulationStore'

interface TooltipProps {
  title: string
  description: string
  visible: boolean
}

function Tooltip({ title, description, visible }: TooltipProps) {
  if (!visible) return null
  return (
    <Html center distanceFactor={10} style={{ pointerEvents: 'none' }}>
      <div className="w-56 bg-neutral-900/95 border border-neutral-700 rounded px-3 py-2 shadow-lg">
        <p className="text-[11px] font-medium text-white mb-0.5">{title}</p>
        <p className="text-[10px] text-neutral-400 leading-relaxed">{description}</p>
      </div>
    </Html>
  )
}

function HoverGroup({
  children,
  title,
  description,
  tooltipOffset = [0, 1, 0],
  ...props
}: {
  children: React.ReactNode
  title: string
  description: string
  tooltipOffset?: [number, number, number]
} & JSX.IntrinsicElements['group']) {
  const [hovered, setHovered] = useState(false)

  return (
    <group {...props}>
      <group
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto' }}
      >
        {children}
      </group>
      <group position={tooltipOffset}>
        <Tooltip title={title} description={description} visible={hovered} />
      </group>
    </group>
  )
}

function TubeMesh({ points, radius = 0.06, color = '#8899a0', metalness = 0.8, roughness = 0.25 }: {
  points: THREE.Vector3[]
  radius?: number
  color?: string
  metalness?: number
  roughness?: number
}) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points)
    return new THREE.TubeGeometry(curve, 24, radius, 12, false)
  }, [points, radius])

  return (
    <mesh geometry={geometry}>
      <meshPhysicalMaterial color={color} metalness={metalness} roughness={roughness} clearcoat={0.2} />
    </mesh>
  )
}

// Pump component — capsule shape with visible impeller inside
function Pump({ radius, height, impellerRef, color = '#b0b8c0', glowColor, glowIntensity = 0 }: {
  radius: number
  height: number
  impellerRef?: React.RefObject<THREE.Group>
  color?: string
  glowColor?: string
  glowIntensity?: number
}) {
  const halfH = height / 2
  return (
    <group>
      {/* Body cylinder — semi-transparent so impeller is visible */}
      <mesh>
        <cylinderGeometry args={[radius, radius, height, 28]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.6}
          roughness={0.2}
          clearcoat={0.5}
          transparent
          opacity={0.55}
        />
      </mesh>
      {/* Top cap */}
      <mesh position={[0, halfH, 0]}>
        <sphereGeometry args={[radius, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color={color} metalness={0.86} roughness={0.16} clearcoat={0.3} />
      </mesh>
      {/* Bottom cap */}
      <mesh position={[0, -halfH, 0]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[radius, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color={color} metalness={0.86} roughness={0.18} clearcoat={0.25} />
      </mesh>
      {/* Seam ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius + 0.015, 0.01, 8, 36]} />
        <meshStandardMaterial color="#707880" metalness={0.9} roughness={0.15} />
      </mesh>
      {/* Status glow ring */}
      {glowColor && (
        <mesh position={[0, halfH * 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius + 0.015, 0.009, 8, 32]} />
          <meshStandardMaterial color={glowColor} emissive={glowColor} emissiveIntensity={glowIntensity} />
        </mesh>
      )}
      {/* Impeller — large, multi-blade, bright so it's clearly visible */}
      {impellerRef && (
        <group ref={impellerRef}>
          {/* Central hub */}
          <mesh>
            <cylinderGeometry args={[radius * 0.15, radius * 0.15, height * 0.3, 12]} />
            <meshStandardMaterial color="#e0e8f0" metalness={0.95} roughness={0.05} />
          </mesh>
          {/* 4 blades */}
          {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
            <mesh key={i} position={[Math.cos(angle) * radius * 0.45, 0, Math.sin(angle) * radius * 0.45]} rotation={[0, -angle, 0]}>
              <boxGeometry args={[radius * 0.5, height * 0.15, 0.02]} />
              <meshStandardMaterial color="#e8f0f8" metalness={0.9} roughness={0.1} />
            </mesh>
          ))}
          {/* Outer ring connecting blades */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius * 0.7, 0.015, 8, 24]} />
            <meshStandardMaterial color="#d0dce8" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      )}
    </group>
  )
}

export function DeviceModel() {
  const heartRef = useRef<THREE.Group>(null)
  const lvadImpellerRef = useRef<THREE.Group>(null)
  const rvImpellerRef = useRef<THREE.Group>(null)
  const aiCoreRef = useRef<THREE.Mesh>(null)

  const lvadRpm = useSimulationStore((s) => s.lvadRpm)
  const rvPumpRpm = useSimulationStore((s) => s.rvPumpRpm)
  const rvPumpState = useSimulationStore((s) => s.rvPumpState)
  const running = useSimulationStore((s) => s.running)
  const heartRate = useSimulationStore((s) => s.heartRate)

  const rvFailureSeverity = useSimulationStore((s) => s.rvFailureSeverity)

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    const severity = rvFailureSeverity / 100

    if (heartRef.current) {
      if (running) {
        const bps = heartRate / 60
        const phase = (t * bps * Math.PI * 2) % (Math.PI * 2)
        const beat = Math.sin(phase)
        // RV side beats weaker when failing
        const rvWeakness = 1 - severity * 0.4
        const squeeze = 1 - Math.max(0, beat) * 0.05 * rvWeakness
        const stretch = 1 + Math.max(0, -beat) * 0.025 * rvWeakness
        heartRef.current.scale.set(squeeze, stretch, squeeze)
      } else {
        heartRef.current.scale.set(1, 1, 1)
      }
    }

    if (lvadImpellerRef.current && running) {
      lvadImpellerRef.current.rotation.y += (lvadRpm / 9000) * 20 * delta
    }

    if (rvImpellerRef.current) {
      if (running && rvPumpState !== 'OFF') {
        rvImpellerRef.current.rotation.y += (rvPumpRpm / 7000) * 22 * delta
      }
    }

    if (aiCoreRef.current) {
      const speed = rvPumpState === 'Emergency' ? 2.0 : rvPumpState === 'Active' ? 1.2 : 0.5
      aiCoreRef.current.rotation.y = t * speed
      const mat = aiCoreRef.current.material as THREE.MeshStandardMaterial
      const baseIntensity = rvPumpState === 'OFF' ? 0.4 : rvPumpState === 'Emergency' ? 2.0 : 1.0
      mat.emissiveIntensity = baseIntensity + Math.sin(t * 2) * 0.3
    }
  })

  const rvGlowColor = rvPumpState === 'OFF' ? '#444' : rvPumpState === 'Emergency' ? '#cc2244' : rvPumpState === 'Standby' ? '#bb8822' : '#2299cc'
  const rvGlowIntensity = rvPumpState === 'OFF' ? 0.1 : rvPumpState === 'Emergency' ? 2.5 : rvPumpState === 'Active' ? 1.5 : 0.5

  // Tube paths
  const lvadInflowPath = useMemo(() => [
    new THREE.Vector3(0.3, -0.4, 0.15),
    new THREE.Vector3(0.55, -0.75, 0.3),
    new THREE.Vector3(0.8, -1.1, 0.35),
  ], [])

  const lvadOutflowPath = useMemo(() => [
    new THREE.Vector3(0.8, -0.8, 0.3),
    new THREE.Vector3(0.85, -0.3, 0.15),
    new THREE.Vector3(0.6, 0.3, 0.0),
    new THREE.Vector3(0.3, 0.85, -0.1),
  ], [])

  const rvadInflowPath = useMemo(() => [
    new THREE.Vector3(-0.4, 0.4, 0.3),
    new THREE.Vector3(-0.7, 0.25, 0.4),
    new THREE.Vector3(-1.05, 0.0, 0.45),
    new THREE.Vector3(-1.3, -0.2, 0.45),
  ], [])

  const rvadOutflowPath = useMemo(() => [
    new THREE.Vector3(-1.3, 0.05, 0.4),
    new THREE.Vector3(-1.0, 0.4, 0.35),
    new THREE.Vector3(-0.6, 0.7, 0.3),
    new THREE.Vector3(-0.25, 0.9, 0.22),
  ], [])

  const drivelinePath = useMemo(() => [
    new THREE.Vector3(0.8, -1.5, 0.35),
    new THREE.Vector3(0.65, -2.0, 0.3),
    new THREE.Vector3(0.5, -2.6, 0.25),
    new THREE.Vector3(0.4, -3.1, 0.2),
  ], [])

  return (
    <group position={[0, 0.5, 0]}>
      {/* ============ HEART ============ */}
      <group ref={heartRef}>
        <HoverGroup
          title="Heart"
          description="The left ventricle fails in advanced heart failure, requiring mechanical support to maintain systemic circulation."
          tooltipOffset={[0, 1.8, 0]}
        >
          {/* Left Ventricle */}
          <mesh position={[0.2, -0.4, 0]}>
            <sphereGeometry args={[0.6, 28, 28]} />
            <meshPhysicalMaterial color="#d4bfb5" roughness={0.55} metalness={0.02} clearcoat={0.08} />
          </mesh>
          <mesh position={[0.4, -0.6, 0.15]}>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshPhysicalMaterial color="#c8b0a5" roughness={0.6} metalness={0.02} />
          </mesh>

          {/* Right Ventricle */}
          <mesh position={[-0.25, -0.3, 0.2]}>
            <sphereGeometry args={[0.48, 24, 24]} />
            <meshPhysicalMaterial color="#d0bab0" roughness={0.55} metalness={0.02} />
          </mesh>
          <mesh position={[-0.5, -0.15, 0.32]}>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshPhysicalMaterial color="#c8b0a8" roughness={0.6} metalness={0.02} />
          </mesh>

          {/* Left Atrium */}
          <mesh position={[0.25, 0.45, -0.05]}>
            <sphereGeometry args={[0.38, 22, 22]} />
            <meshPhysicalMaterial color="#d8c4ba" roughness={0.5} metalness={0.02} />
          </mesh>

          {/* Right Atrium */}
          <mesh position={[-0.3, 0.4, 0.2]}>
            <sphereGeometry args={[0.35, 22, 22]} />
            <meshPhysicalMaterial color="#d4bcb2" roughness={0.5} metalness={0.02} />
          </mesh>

          {/* Septum */}
          <mesh position={[0, -0.1, 0.1]} rotation={[0, 0.08, 0]}>
            <boxGeometry args={[0.06, 1.0, 0.45]} />
            <meshPhysicalMaterial color="#c8b5ab" roughness={0.55} metalness={0.02} transparent opacity={0.6} />
          </mesh>

          {/* Aorta — continuous tube from heart up and arching over */}
          <TubeMesh
            points={[
              new THREE.Vector3(0.1, 0.5, -0.05),
              new THREE.Vector3(0.12, 0.8, -0.08),
              new THREE.Vector3(0.1, 1.1, -0.1),
              new THREE.Vector3(0.0, 1.35, -0.15),
              new THREE.Vector3(-0.15, 1.45, -0.18),
              new THREE.Vector3(-0.3, 1.35, -0.2),
              new THREE.Vector3(-0.35, 1.1, -0.2),
            ]}
            radius={0.13}
            color="#bb4a3a"
            metalness={0.08}
            roughness={0.45}
          />

          {/* Pulmonary Artery — exits RV, curves up and splits */}
          <TubeMesh
            points={[
              new THREE.Vector3(-0.15, 0.5, 0.2),
              new THREE.Vector3(-0.12, 0.8, 0.22),
              new THREE.Vector3(-0.1, 1.05, 0.22),
              new THREE.Vector3(-0.2, 1.2, 0.2),
            ]}
            radius={0.1}
            color="#4466aa"
            metalness={0.08}
            roughness={0.45}
          />
          {/* PA left branch */}
          <TubeMesh
            points={[
              new THREE.Vector3(-0.2, 1.2, 0.2),
              new THREE.Vector3(-0.35, 1.3, 0.2),
              new THREE.Vector3(-0.5, 1.35, 0.18),
            ]}
            radius={0.06}
            color="#3d5d9a"
            metalness={0.06}
            roughness={0.5}
          />
          {/* PA right branch */}
          <TubeMesh
            points={[
              new THREE.Vector3(-0.2, 1.2, 0.2),
              new THREE.Vector3(-0.05, 1.3, 0.18),
              new THREE.Vector3(0.1, 1.35, 0.16),
            ]}
            radius={0.06}
            color="#3d5d9a"
            metalness={0.06}
            roughness={0.5}
          />

          {/* Superior Vena Cava */}
          <TubeMesh
            points={[
              new THREE.Vector3(-0.4, 1.4, 0.15),
              new THREE.Vector3(-0.42, 1.1, 0.16),
              new THREE.Vector3(-0.38, 0.7, 0.18),
              new THREE.Vector3(-0.32, 0.5, 0.2),
            ]}
            radius={0.08}
            color="#3b5599"
            metalness={0.06}
            roughness={0.5}
          />

          {/* Inferior Vena Cava */}
          <TubeMesh
            points={[
              new THREE.Vector3(-0.32, 0.2, 0.2),
              new THREE.Vector3(-0.35, -0.2, 0.18),
              new THREE.Vector3(-0.35, -0.6, 0.15),
              new THREE.Vector3(-0.33, -0.9, 0.12),
            ]}
            radius={0.08}
            color="#3b5599"
            metalness={0.06}
            roughness={0.5}
          />

          {/* Pulmonary Veins — entering LA */}
          <TubeMesh
            points={[
              new THREE.Vector3(0.6, 0.65, -0.2),
              new THREE.Vector3(0.45, 0.55, -0.12),
              new THREE.Vector3(0.3, 0.48, -0.06),
            ]}
            radius={0.04}
            color="#994444"
            metalness={0.06}
            roughness={0.5}
          />
          <TubeMesh
            points={[
              new THREE.Vector3(0.55, 0.4, -0.25),
              new THREE.Vector3(0.4, 0.4, -0.15),
              new THREE.Vector3(0.28, 0.42, -0.08),
            ]}
            radius={0.04}
            color="#994444"
            metalness={0.06}
            roughness={0.5}
          />

          {/* Coronary artery on surface */}
          <TubeMesh
            points={[
              new THREE.Vector3(0.1, 0.35, 0.35),
              new THREE.Vector3(0.25, 0.1, 0.42),
              new THREE.Vector3(0.3, -0.2, 0.4),
              new THREE.Vector3(0.2, -0.5, 0.35),
            ]}
            radius={0.015}
            color="#993838"
            metalness={0.1}
            roughness={0.6}
          />
        </HoverGroup>
      </group>

      {/* ============ LVAD INFLOW CANNULA ============ */}
      <HoverGroup
        title="Inflow Cannula"
        description="Inserted into the LV apex. Draws blood into the pump."
        tooltipOffset={[0.6, 0.4, 0]}
      >
        <TubeMesh points={lvadInflowPath} radius={0.065} color="#a0aab4" />
        <mesh position={[0.3, -0.4, 0.15]} rotation={[0.4, 0, -0.25]}>
          <torusGeometry args={[0.09, 0.022, 8, 16]} />
          <meshStandardMaterial color="#707880" metalness={0.85} roughness={0.2} />
        </mesh>
      </HoverGroup>

      {/* ============ LVAD PUMP ============ */}
      <HoverGroup
        position={[0.8, -1.3, 0.35]}
        title="LVAD Pump"
        description="Continuous-flow rotary pump. Impeller spins at up to 9,000 RPM to maintain systemic output."
        tooltipOffset={[0, 0.8, 0]}
      >
        <Pump radius={0.35} height={0.7} impellerRef={lvadImpellerRef} />
      </HoverGroup>

      {/* ============ LVAD OUTFLOW GRAFT ============ */}
      <HoverGroup
        title="Outflow Graft"
        description="Connects the LVAD to the ascending aorta."
        tooltipOffset={[0.6, 0.3, 0]}
      >
        <TubeMesh points={lvadOutflowPath} radius={0.055} color="#bbb" metalness={0.25} roughness={0.55} />
        <mesh position={[0.3, 0.85, -0.1]} rotation={[0.2, 0, 0.1]}>
          <torusGeometry args={[0.07, 0.016, 8, 14]} />
          <meshStandardMaterial color="#707880" metalness={0.85} roughness={0.2} />
        </mesh>
      </HoverGroup>

      {/* ============ RVAD INFLOW (from RA) ============ */}
      <HoverGroup
        title="RVAD Inflow"
        description="Drains blood from the right atrium, bypassing the failing RV."
        tooltipOffset={[-0.5, 0.5, 0]}
      >
        <TubeMesh points={rvadInflowPath} radius={0.05} color="#8899a0" />
        <mesh position={[-0.4, 0.4, 0.3]} rotation={[0, 0.3, 0.2]}>
          <torusGeometry args={[0.07, 0.018, 8, 14]} />
          <meshStandardMaterial color="#607080" metalness={0.8} roughness={0.25} />
        </mesh>
      </HoverGroup>

      {/* ============ RVAD PUMP ============ */}
      <HoverGroup
        position={[-1.3, -0.1, 0.45]}
        title="RV Assist Pump"
        description="AI-activated centrifugal pump. Supports pulmonary circulation when RV fails."
        tooltipOffset={[0, 0.7, 0]}
      >
        <Pump
          radius={0.26}
          height={0.48}
          impellerRef={rvImpellerRef}
          color="#a8b4be"
          glowColor={rvGlowColor}
          glowIntensity={rvGlowIntensity}
        />
        {/* Active light — clearly shows when pump is working */}
        {rvPumpState !== 'OFF' && (
          <pointLight
            color={rvGlowColor}
            intensity={rvPumpState === 'Emergency' ? 3 : rvPumpState === 'Active' ? 1.5 : 0.5}
            distance={2.5}
          />
        )}
      </HoverGroup>

      {/* ============ RVAD OUTFLOW (to PA) ============ */}
      <HoverGroup
        title="RVAD Outflow"
        description="Returns blood to the pulmonary artery for oxygenation in the lungs."
        tooltipOffset={[-0.5, 0.4, 0]}
      >
        <TubeMesh points={rvadOutflowPath} radius={0.045} color="#8899a0" />
        <mesh position={[-0.25, 0.9, 0.22]} rotation={[0.2, 0.1, 0]}>
          <torusGeometry args={[0.06, 0.015, 8, 14]} />
          <meshStandardMaterial color="#607080" metalness={0.8} roughness={0.25} />
        </mesh>
      </HoverGroup>

      {/* ============ DRIVELINE ============ */}
      <HoverGroup
        title="Driveline"
        description="Exits through the abdomen. Carries power and data to the external controller."
        tooltipOffset={[0.5, 0.3, 0]}
      >
        <TubeMesh points={drivelinePath} radius={0.022} color="#2a2a2a" metalness={0.15} roughness={0.75} />
        <mesh position={[0.77, -1.6, 0.34]}>
          <cylinderGeometry args={[0.035, 0.025, 0.18, 10]} />
          <meshStandardMaterial color="#333" roughness={0.7} metalness={0.15} />
        </mesh>
      </HoverGroup>

      {/* ============ EXTERNAL CONTROLLER ============ */}
      <HoverGroup
        position={[0.4, -3.4, 0.2]}
        title="Controller"
        description="External unit managing both pumps and running the adaptive balancing algorithm."
        tooltipOffset={[0.5, 0.4, 0]}
      >
        <mesh>
          <boxGeometry args={[0.65, 0.38, 0.14]} />
          <meshPhysicalMaterial color="#1a1e24" metalness={0.4} roughness={0.3} clearcoat={0.5} />
        </mesh>
        <mesh position={[0, 0.01, 0.071]}>
          <planeGeometry args={[0.5, 0.25]} />
          <meshStandardMaterial color="#0a0e14" metalness={0.1} roughness={0.1} />
        </mesh>
        <mesh ref={aiCoreRef} position={[0, 0, 0.08]}>
          <octahedronGeometry args={[0.035, 1]} />
          <meshStandardMaterial color="#3388aa" emissive="#3388aa" emissiveIntensity={0.8} />
        </mesh>
        {[-0.16, -0.07, 0.02, 0.11].map((x, i) => (
          <mesh key={i} position={[x, -0.13, 0.071]}>
            <circleGeometry args={[0.01, 10]} />
            <meshStandardMaterial
              color={i < 3 ? '#44884a' : '#338888'}
              emissive={i < 3 ? '#44884a' : '#338888'}
              emissiveIntensity={0.8}
            />
          </mesh>
        ))}
      </HoverGroup>
    </group>
  )
}
