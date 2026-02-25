import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

export function MouseController() {
  const { camera, scene, gl } = useThree()
  const heldObjectRef = useRef<THREE.Object3D | null>(null)
  const cursorRef = useRef<THREE.Group | null>(null)

  useEffect(() => {
    // Create cursor ring
    const group = new THREE.Group()
    const ringGeom = new THREE.TorusGeometry(0.02, 0.003, 16, 8)
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ffff })
    const ring = new THREE.Mesh(ringGeom, ringMat)
    ring.position.z = -0.1
    group.add(ring)

    // Cross hairs
    const lineGeom = new THREE.BufferGeometry()
    lineGeom.setAttribute('position', new THREE.BufferAttribute(
      new Float32Array([-0.025, 0, 0, 0.025, 0, 0, 0, -0.025, 0, 0, 0.025, 0]),
      3
    ))
    const lineMat = new THREE.LineBasicMaterial({ color: 0x00ffff })
    const lines = new THREE.LineSegments(lineGeom, lineMat)
    lines.position.z = -0.1
    group.add(lines)

    camera.add(group)
    cursorRef.current = group

    const canvas = gl.domElement
    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = (event.clientX - rect.left) / rect.width * 2 - 1
      mouse.y = -(event.clientY - rect.top) / rect.height * 2 + 1
    }

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return // Only left click

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(scene.children, true)

      for (const intersection of intersects) {
        // Find parent with userData
        let obj: THREE.Object3D | null = intersection.object
        while (obj && !obj.userData.interactiveId) {
          obj = obj.parent
        }

        if (obj && obj.userData.interactiveId) {
          // Check if object is grabbable (e.g., lightsaber, ball)
          if (obj.userData.isGrabbable) {
            heldObjectRef.current = obj
            obj.userData.isGrabbed = true
            if (obj.userData.onGrabStart) obj.userData.onGrabStart()
          } else if (obj.userData.onActivate) {
            // Trigger interactive action (door, teleporter)
            obj.userData.onActivate()
          }
          break
        }
      }
    }

    const handleMouseUp = () => {
      if (heldObjectRef.current) {
        heldObjectRef.current.userData.isGrabbed = false
        if (heldObjectRef.current.userData.onGrabEnd) {
          heldObjectRef.current.userData.onGrabEnd()
        }
        heldObjectRef.current = null
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      camera.remove(group)
    }
  }, [camera, scene, gl])

  useFrame(() => {
    if (heldObjectRef.current) {
      raycaster.setFromCamera(mouse, camera)
      const holdDistance = 1.5
      const holdPoint = camera.position.clone().add(raycaster.ray.direction.multiplyScalar(holdDistance))

      heldObjectRef.current.position.lerp(holdPoint, 0.2)
    }
  })

  return null
}
