interface LoadingScreenProps {
  progress?: number
  message?: string
  error?: string | null
}

export function LoadingScreen({
  progress = 0,
  message = 'Carregando modelos de IA...',
  error = null,
}: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black via-slate-950 to-black flex flex-col items-center justify-center z-[100] overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-32 right-10 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-xl px-8">
        {/* Animated icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 border-r-purple-400 animate-spin" />
            <div className="absolute inset-2 rounded-full border border-cyan-500/30" />
            <div className="absolute inset-0 flex items-center justify-center text-3xl">
              🌐
            </div>
          </div>
        </div>

        {/* Logo/Title with gradient */}
        <h1 className="text-5xl font-black mb-2 tracking-tighter bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          Metaverso Web
        </h1>
        <p className="text-sm text-gray-300 mb-2">Rastreamento de Mão & Cabeça</p>
        <p className="text-xs text-gray-500 mb-12">Powered by MediaPipe + Three.js</p>

        {error ? (
          <div className="bg-gradient-to-r from-red-900/40 to-red-800/40 border border-red-500/50 rounded-xl p-6 text-red-300 backdrop-blur">
            <p className="font-bold mb-2">❌ Erro de Carregamento</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <>
            {/* Progress indicator */}
            <div className="mb-6">
              <div className="relative h-1 bg-gradient-to-r from-slate-800 to-slate-700 rounded-full overflow-hidden backdrop-blur">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 rounded-full shadow-lg shadow-cyan-500/50 transition-all duration-500"
                  style={{ width: `${Math.max(progress, 3)}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 px-1">
                <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
                <span className="text-xs text-gray-500">{message}</span>
              </div>
            </div>

            {/* Loading steps */}
            <div className="space-y-3 mb-12">
              <div className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${progress > 10 ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-slate-900/30 border border-slate-700/30'}`}>
                <span className={`text-lg ${progress > 10 ? '✓' : '◦'}`}>
                  {progress > 10 ? '✓' : progress > 0 ? '⟳' : '◦'}
                </span>
                <span className={`text-sm ${progress > 10 ? 'text-cyan-300' : 'text-gray-400'}`}>MediaPipe Models</span>
              </div>

              <div className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${progress > 35 ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-slate-900/30 border border-slate-700/30'}`}>
                <span className={`text-lg ${progress > 35 ? '✓' : progress > 15 ? '⟳' : '◦'}`}>
                  {progress > 35 ? '✓' : progress > 15 ? '⟳' : '◦'}
                </span>
                <span className={`text-sm ${progress > 35 ? 'text-blue-300' : 'text-gray-400'}`}>Câmera & Permissões</span>
              </div>

              <div className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${progress > 70 ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-slate-900/30 border border-slate-700/30'}`}>
                <span className={`text-lg ${progress > 70 ? '✓' : progress > 40 ? '⟳' : '◦'}`}>
                  {progress > 70 ? '✓' : progress > 40 ? '⟳' : '◦'}
                </span>
                <span className={`text-sm ${progress > 70 ? 'text-purple-300' : 'text-gray-400'}`}>Inicializando Cena</span>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-gradient-to-br from-slate-900/40 to-slate-900/20 backdrop-blur border border-slate-700/30 rounded-xl p-6">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">Requisitos</p>
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <span className="text-emerald-400 text-lg">✓</span>
                  <span>Chrome / Edge / Firefox (WebGL 2.0 + WASM)</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <span className="text-emerald-400 text-lg">✓</span>
                  <span>Câmera frontal permitida</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <span className="text-emerald-400 text-lg">✓</span>
                  <span>Ambiente bem iluminado</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <span className="text-emerald-400 text-lg">✓</span>
                  <span>Desktop ou tablet (não mobile)</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-xs text-gray-600">
        Hand Tracking × Head Tracking × Physics Engine
      </div>
    </div>
  )
}
