import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { useSceneStore } from '../store/sceneStore'
import { useTrackingStore } from '../store/trackingStore'
import { HeadTrackedCamera } from './shared/HeadTrackedCamera'
import { RealisticHandModel } from './shared/RealisticHandModel'
import { HandPointer } from './shared/HandPointer'
import { MouseController } from './shared/MouseController'
import { PlayerController } from './shared/PlayerController'
import { GalaxyHubSpace } from './spaces/GalaxyHubSpace'
import { DeathStarSpace } from './spaces/DeathStarSpace'

function Canvas3DContent() {
  const handTrackingEnabled = useTrackingStore(s => s.handTrackingEnabled)

  return (
    <>
      <HeadTrackedCamera />
      <PlayerController />
      {handTrackingEnabled ? (
        <>
          <RealisticHandModel side="left" />
          <RealisticHandModel side="right" />
          <HandPointer />
        </>
      ) : (
        <MouseController />
      )}
      <ActiveSpace />
    </>
  )
}

function ActiveSpace() {
  const { activeSpace } = useSceneStore()
  switch (activeSpace) {
    case 'hub':       return <GalaxyHubSpace />
    case 'deathstar': return <DeathStarSpace />
    default:          return <GalaxyHubSpace />
  }
}

export function MetaverseCanvas() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.6, 5], fov: 75, near: 0.1, far: 1000 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <Canvas3DContent />
      </Suspense>
    </Canvas>
  )
}
