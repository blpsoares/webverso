import { useRef, useEffect } from 'react'
import { RigidBody } from '@react-three/rapier'
import { Ball } from './Ball'
import { Paddle } from './Paddle'
import { Table } from './Table'
import { Net } from './Net'
import { ScoreBoard } from './ScoreBoard'
import { useGameStore } from '../../store/gameStore'
import type { BallHandle } from './Ball'

export function PingPongGame() {
  const ballRef = useRef<BallHandle>(null)
  const { incrementPingPongScore, setPingPongPlaying } = useGameStore()
  const servingRef = useRef<'left' | 'right'>('left')
  const lastScoreRef = useRef(0)

  useEffect(() => {
    setPingPongPlaying(true)
    return () => setPingPongPlaying(false)
  }, [setPingPongPlaying])

  const serve = () => {
    const side = servingRef.current
    const x = side === 'left' ? -0.8 : 0.8
    ballRef.current?.reset([x, 0.3, 0])
    // Give initial impulse
    const impulseX = side === 'left' ? 0.001 : -0.001
    setTimeout(() => {
      ballRef.current?.applyImpulse({ x: impulseX, y: 0.001, z: 0 })
    }, 100)
  }

  useEffect(() => {
    serve()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleScore = (scorer: 'left' | 'right') => {
    const now = Date.now()
    if (now - lastScoreRef.current < 1500) return
    lastScoreRef.current = now

    incrementPingPongScore(scorer)
    servingRef.current = scorer === 'left' ? 'right' : 'left'
    setTimeout(() => serve(), 1000)
  }

  return (
    <group position={[0, 0.8, 0]}>
      <Table />
      <Net />
      <Ball ref={ballRef} initialPosition={[-0.8, 0.3, 0]} />

      {/* Paddles */}
      <Paddle side="left" defaultPosition={[-1.1, 0.2, 0]} />
      <Paddle side="right" defaultPosition={[1.1, 0.2, 0]} />

      {/* Scoring zones - invisible sensors behind each side */}
      <RigidBody
        type="fixed"
        position={[-1.5, 0.2, 0]}
        sensor
        onIntersectionEnter={() => handleScore('right')}
        name="score_zone_left"
      >
        <mesh visible={false}>
          <boxGeometry args={[0.1, 1, 2]} />
        </mesh>
      </RigidBody>
      <RigidBody
        type="fixed"
        position={[1.5, 0.2, 0]}
        sensor
        onIntersectionEnter={() => handleScore('left')}
        name="score_zone_right"
      >
        <mesh visible={false}>
          <boxGeometry args={[0.1, 1, 2]} />
        </mesh>
      </RigidBody>

      {/* Floor to catch ball */}
      <RigidBody type="fixed" position={[0, -1, 0]} name="floor">
        <mesh visible={false}>
          <boxGeometry args={[10, 0.1, 10]} />
        </mesh>
      </RigidBody>

      <ScoreBoard />
    </group>
  )
}
