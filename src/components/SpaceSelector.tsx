import { useSceneStore } from '../store/sceneStore'
import type { SpaceId } from '../types/scene'

interface SpaceSelectorProps {
  onClose: () => void
}

const spaces: { id: SpaceId; name: string; description: string; emoji: string }[] = [
  { id: 'hub',       name: 'Nave Galáctica',   description: 'Lobby com sabres de luz e a Estrela da Morte', emoji: '🚀' },
  { id: 'deathstar', name: 'Estrela da Morte',  description: 'Interior do Death Star — explore os corredores', emoji: '💀' },
]

export function SpaceSelector({ onClose }: SpaceSelectorProps) {
  const { activeSpace, setActiveSpace } = useSceneStore()

  const handleSelect = (id: SpaceId) => {
    setActiveSpace(id)
    onClose()
  }

  return (
    <div
      className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center pointer-events-auto"
      style={{ zIndex: 60 }}
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-lg">Destinos</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="space-y-3">
          {spaces.map((space) => (
            <button
              key={space.id}
              onClick={() => handleSelect(space.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                activeSpace === space.id
                  ? 'border-green-500/50 bg-green-900/30 text-white'
                  : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/30 hover:bg-white/10'
              }`}
            >
              <span className="text-2xl">{space.emoji}</span>
              <div>
                <p className="font-medium">{space.name}</p>
                <p className="text-xs text-gray-400">{space.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
