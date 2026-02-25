export type SpaceId = 'hub' | 'deathstar'

export interface GameState {
  isPlaying: boolean
  score: { left: number; right: number }
  timeElapsed: number
}
