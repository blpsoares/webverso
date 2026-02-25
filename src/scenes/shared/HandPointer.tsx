import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useTrackingStore } from '../../store/trackingStore'
import { useGestureStore } from '../../store/gestureStore'

const CURSOR_DEPTH = 0.92

function HandRay({ side }: { side: 'left' | 'right' }) {
  const { camera, scene } = useThree()
  const cursorRef   = useRef<THREE.Mesh>(null)
  const lineRef     = useRef<THREE.Line | null>(null)
  const raycaster   = useRef(new THREE.Raycaster())
  const wasPinch    = useRef(false)

  const color = side === 'left' ? '#4488ff' : '#ff8844'

  // Cria o objeto Line imperativamente para evitar problemas de tipagem JSX
  const lineObj = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(6)
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.25, depthTest: false })
    const line = new THREE.Line(geo, mat)
    line.visible = false
    line.frustumCulled = false
    return line
  }, [color])

  useFrame(() => {
    const { handLandmarks } = useTrackingStore.getState()
    const { leftGesture, rightGesture } = useGestureStore.getState()
    const gesture   = side === 'left' ? leftGesture : rightGesture

    // Usa a ponta do índice como ponto de raycasting (landmark 8)
    const landmarks = handLandmarks[side]
    const indexTipLandmark = landmarks[8]
    const screenPos = indexTipLandmark ? { x: 1 - indexTipLandmark.x, y: indexTipLandmark.y } : null

    const pinching    = gesture === 'PINCH'
    const justPinched = pinching && !wasPinch.current
    wasPinch.current  = pinching

    const cursor = cursorRef.current
    if (!cursor) return

    if (!screenPos) {
      cursor.visible   = false
      lineObj.visible  = false
      return
    }

    cursor.visible  = true
    lineObj.visible = true

    const ndcX =  screenPos.x * 2 - 1
    const ndcY = -(screenPos.y * 2 - 1)

    raycaster.current.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera)

    const interactables: THREE.Object3D[] = []
    scene.traverse((obj) => { if (obj.userData.interactiveId) interactables.push(obj) })
    const hits = raycaster.current.intersectObjects(interactables, true)

    let hitPoint: THREE.Vector3
    let hitObj: THREE.Object3D | null = null

    if (hits.length > 0) {
      hitPoint = hits[0].point.clone()
      let obj: THREE.Object3D | null = hits[0].object
      while (obj) {
        if (obj.userData.interactiveId) { hitObj = obj; break }
        obj = obj.parent
      }
    } else {
      hitPoint = new THREE.Vector3(ndcX, ndcY, CURSOR_DEPTH).unproject(camera)
    }

    if (hitObj) hitObj.userData.onHoverChange?.(true)
    if (justPinched && hitObj) hitObj.userData.onActivate?.()

    // Cursor
    cursor.position.copy(hitPoint)
    cursor.lookAt(camera.position)
    cursor.scale.setScalar(pinching ? 1.6 : (hitObj ? 1.2 : 1.0))
    if (cursor.material instanceof THREE.MeshBasicMaterial) {
      cursor.material.color.set(pinching ? '#ffffff' : (hitObj ? '#ffffff' : color))
    }

    // Raio-guia
    const posAttr = lineObj.geometry.attributes.position as THREE.BufferAttribute
    const origin  = camera.position
    posAttr.setXYZ(0, origin.x, origin.y, origin.z)
    posAttr.setXYZ(1, hitPoint.x, hitPoint.y, hitPoint.z)
    posAttr.needsUpdate = true
    if (lineObj.material instanceof THREE.LineBasicMaterial) {
      lineObj.material.opacity = pinching ? 0.9 : (hitObj ? 0.55 : 0.25)
      lineObj.material.color.set(pinching ? '#ffffff' : color)
    }
  })

  return (
    <>
      {/* Cursor ring */}
      <mesh ref={cursorRef} visible={false}>
        <ringGeometry args={[0.035, 0.065, 24]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.85} depthTest={false} />
      </mesh>
      {/* Raio-guia como primitive */}
      <primitive object={lineObj} />
    </>
  )
}

export function HandPointer() {
  return (
    <>
      <HandRay side="left" />
      <HandRay side="right" />
    </>
  )
}
