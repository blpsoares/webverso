import { create } from 'zustand'

interface PingPongScore {
  left: number
  right: number
}

interface GameStoreState {
  pingPongScore: PingPongScore
  pingPongPlaying: boolean
  airplaneScore: number
  airplanePlaying: boolean
  airplaneRingsPassed: number

  setPingPongScore: (score: PingPongScore) => void
  incrementPingPongScore: (side: 'left' | 'right') => void
  setPingPongPlaying: (value: boolean) => void
  resetPingPong: () => void

  setAirplanePlaying: (value: boolean) => void
  incrementAirplaneRings: () => void
  resetAirplane: () => void
}

export const useGameStore = create<GameStoreState>()((set) => ({
  pingPongScore: { left: 0, right: 0 },
  pingPongPlaying: false,
  airplaneScore: 0,
  airplanePlaying: false,
  airplaneRingsPassed: 0,

  setPingPongScore: (score) => set({ pingPongScore: score }),
  incrementPingPongScore: (side) =>
    set((state) => ({
      pingPongScore: {
        ...state.pingPongScore,
        [side]: state.pingPongScore[side] + 1,
      },
    })),
  setPingPongPlaying: (value) => set({ pingPongPlaying: value }),
  resetPingPong: () => set({ pingPongScore: { left: 0, right: 0 }, pingPongPlaying: false }),

  setAirplanePlaying: (value) => set({ airplanePlaying: value }),
  incrementAirplaneRings: () =>
    set((state) => ({
      airplaneRingsPassed: state.airplaneRingsPassed + 1,
      airplaneScore: state.airplaneScore + 100,
    })),
  resetAirplane: () => set({ airplaneScore: 0, airplanePlaying: false, airplaneRingsPassed: 0 }),
}))
