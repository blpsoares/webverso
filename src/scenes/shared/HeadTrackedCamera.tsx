import { useFrame, useThree } from '@react-three/fiber'
import { useTrackingStore } from '../../store/trackingStore'
import { useSceneStore } from '../../store/sceneStore'

interface HeadTrackedCameraProps {
  sensitivity?: number
}

export function HeadTrackedCamera({ sensitivity = 1.5 }: HeadTrackedCameraProps) {
  const { camera } = useThree()
  const { activeSpace } = useSceneStore()

  const enabled = true // todos os espaços usam head tracking na câmera
  void activeSpace

  useFrame(() => {
    if (!enabled) return

    const { headOrientation } = useTrackingStore.getState()
    camera.rotation.order = 'YXZ'

    // yaw: virar cabeça para lado → câmera gira para o mesmo lado
    // Sinal negativo porque yaw positivo (rosto virado à direita) → câmera deve girar à direita (rotation.y negativo em YXZ)
    camera.rotation.y += (-headOrientation.yaw * sensitivity - camera.rotation.y) * 0.1

    // pitch: olhar para baixo → câmera deve olhar para baixo (rotation.x positivo em Three.js)
    // matrixToEuler retorna pitch positivo ao olhar para CIMA → não invertemos aqui
    camera.rotation.x += (headOrientation.pitch * sensitivity - camera.rotation.x) * 0.1
  })

  return null
}
