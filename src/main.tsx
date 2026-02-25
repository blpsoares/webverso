import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// StrictMode removido: causa double-mount que interfere com MediaStream e WebGL
createRoot(document.getElementById('root')!).render(<App />)
