import { create } from 'zustand'
import type { SpaceId } from '../types/scene'

interface SceneState {
  activeSpace: SpaceId
  isTransitioning: boolean

  setActiveSpace: (space: SpaceId) => void
  setIsTransitioning: (value: boolean) => void
}

export const useSceneStore = create<SceneState>()((set) => ({
  activeSpace: 'hub',
  isTransitioning: false,

  setActiveSpace: (space) => set({ activeSpace: space }),
  setIsTransitioning: (value) => set({ isTransitioning: value }),
}))
