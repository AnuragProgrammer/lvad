import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSimulationStore } from '../store/useSimulationStore'

const PARTICLE_COUNT = 120

interface ParticlePath {
  points: THREE.Vector3[]
  color: THREE.Color
  speed: number
}

function createPaths(): ParticlePath[] {
  const paths: ParticlePath[] = []

  // LV → LVAD → Outflow → Aorta (oxygenated, red)
  for (let i = 0; i < 5; i++) {
    paths.push({
      points: [
        new THREE.Vector3(0.25 + 0, -0.45 + 0.5, 0),
        new THREE.Vector3(0.6, -0.4, 0.3),
        new THREE.Vector3(0.9, -0.9, 0.4),
        new THREE.Vector3(1.0, -0.5, 0.2),
        new THREE.Vector3(0.7, 0.3, -0.05),
        new THREE.Vector3(0.3, 1.0 + 0.5, -0.1),
      ],
      color: new THREE.Color('#cc3333'),
      speed: 1.3 + Math.random() * 0.3,
    })
  }

  // Body → SVC → RA (deoxygenated, blue)
  for (let i = 0; i < 4; i++) {
    paths.push({
      points: [
        new THREE.Vector3(-0.5, 2.0 + 0.5, 0.15),
        new THREE.Vector3(-0.5, 1.6 + 0.5, 0.15),
        new THREE.Vector3(-0.45, 1.0 + 0.5, 0.2),
        new THREE.Vector3(-0.35, 0.4 + 0.5, 0.2),
      ],
      color: new THREE.Color('#3355aa'),
      speed: 0.9 + Math.random() * 0.3,
    })
  }

  // RA → RVAD → PA (blue, through pump)
  for (let i = 0; i < 4; i++) {
    paths.push({
      points: [
        new THREE.Vector3(-0.45, 0.35 + 0.5, 0.25),
        new THREE.Vector3(-0.8, 0.2 + 0.5, 0.4),
        new THREE.Vector3(-1.5, -0.1 + 0.5, 0.5),
        new THREE.Vector3(-1.2, 0.4 + 0.5, 0.4),
        new THREE.Vector3(-0.35, 1.0 + 0.5, 0.25),
      ],
      color: new THREE.Color('#4477cc'),
      speed: 1.0 + Math.random() * 0.3,
    })
  }

  // PA → Lungs (blue to red transition area)
  for (let i = 0; i < 3; i++) {
    paths.push({
      points: [
        new THREE.Vector3(-0.2, 0.95 + 0.5, 0.2),
        new THREE.Vector3(-0.3, 1.4 + 0.5, 0.25),
        new THREE.Vector3(-0.1, 1.8 + 0.5, 0.2),
      ],
      color: new THREE.Color('#5566aa'),
      speed: 0.8 + Math.random() * 0.2,
    })
  }

  // Pulm Veins → LA (oxygenated, red)
  for (let i = 0; i < 3; i++) {
    paths.push({
      points: [
        new THREE.Vector3(0.7, 1.1 + 0.5, -0.2),
        new THREE.Vector3(0.5, 0.7 + 0.5, -0.1),
        new THREE.Vector3(0.3, 0.45 + 0.5, -0.05),
      ],
      color: new THREE.Color('#aa3333'),
      speed: 0.8 + Math.random() * 0.2,
    })
  }

  return paths
}

export function BloodParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const lvadFlow = useSimulationStore((s) => s.lvadFlow)
  const running = useSimulationStore((s) => s.running)

  const paths = useMemo(createPaths, [])

  const particles = useMemo(() => {
    const arr: { pathIdx: number; progress: number; offset: number }[] = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr.push({
        pathIdx: i % paths.length,
        progress: Math.random(),
        offset: Math.random() * 10,
      })
    }
    return arr
  }, [paths])

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const tempColor = useMemo(() => new THREE.Color(), [])

  useEffect(() => {
    if (!meshRef.current) return
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const path = paths[particles[i].pathIdx]
      meshRef.current.setColorAt(i, tempColor.copy(path.color))
      // Position off-screen initially so there's no visible cluster
      dummy.position.set(0, -100, 0)
      dummy.scale.setScalar(0)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }
  }, [paths, particles, tempColor, dummy])

  useFrame((_, delta) => {
    if (!meshRef.current || !running) return

    const flowMult = Math.max(0.3, lvadFlow / 4.8)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i]
      const path = paths[p.pathIdx]
      p.progress += delta * path.speed * flowMult * 0.25

      if (p.progress > 1) p.progress -= 1

      const segCount = path.points.length - 1
      const segF = p.progress * segCount
      const segIdx = Math.min(Math.floor(segF), segCount - 1)
      const t = segF - segIdx

      const start = path.points[segIdx]
      const end = path.points[Math.min(segIdx + 1, path.points.length - 1)]

      dummy.position.lerpVectors(start, end, t)
      dummy.position.x += Math.sin(p.progress * Math.PI * 3 + p.offset) * 0.03
      dummy.position.z += Math.cos(p.progress * Math.PI * 2.5 + p.offset) * 0.03

      const scale = 0.025 + Math.sin(p.progress * Math.PI) * 0.012
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]} frustumCulled={false}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  )
}
