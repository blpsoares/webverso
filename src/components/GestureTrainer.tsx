import { useState, useRef, useCallback } from 'react'
import { useTrackingStore } from '../store/trackingStore'
import { KNNClassifier } from '../tracking/algorithms/knnClassifier'
import '../styles/gesture-trainer.css'

interface GestureTrainerProps {
  isOpen: boolean
  onClose: () => void
}

const SAMPLE_RECORD_TIME = 1000 // ms

export function GestureTrainer({ isOpen, onClose }: GestureTrainerProps) {
  const handLandmarks = useTrackingStore(s => s.handLandmarks)
  const [classifier, setClassifier] = useState(() => new KNNClassifier())
  const [currentLabel, setCurrentLabel] = useState('')
  const [newLabelInput, setNewLabelInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const recordingTimerRef = useRef<NodeJS.Timeout>()
  const recordingCountRef = useRef(0)

  const startRecording = useCallback(async () => {
    if (!currentLabel || !handLandmarks.left || handLandmarks.left.length < 21) {
      alert('Selecione um rótulo e levante a mão')
      return
    }

    setIsRecording(true)
    recordingCountRef.current = 0

    const recordInterval = setInterval(() => {
      const landmarks = handLandmarks.left
      if (landmarks && landmarks.length === 21) {
        const features = KNNClassifier.extractFeatures(landmarks)
        classifier.addSample(features, currentLabel)
        recordingCountRef.current++
      }
    }, 50) // 50ms = 20 samples per second

    recordingTimerRef.current = setTimeout(() => {
      clearInterval(recordInterval)
      setIsRecording(false)
    }, SAMPLE_RECORD_TIME)
  }, [currentLabel, handLandmarks, classifier])

  const stopRecording = useCallback(() => {
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current)
    }
    setIsRecording(false)
  }, [])

  const addNewLabel = useCallback(() => {
    const label = newLabelInput.trim()
    if (label) {
      setCurrentLabel(label)
      setNewLabelInput('')
    }
  }, [newLabelInput])

  const testGesture = useCallback(() => {
    if (!handLandmarks.left || handLandmarks.left.length < 21) {
      alert('Levante a mão para testar')
      return
    }

    const features = KNNClassifier.extractFeatures(handLandmarks.left)
    const { label, confidence } = classifier.predict(features)

    if (label) {
      alert(`Gesto: ${label}\nConfiança: ${(confidence * 100).toFixed(0)}%`)
    } else {
      alert('Nenhum gesto treinado ainda')
    }
  }, [handLandmarks, classifier])

  const clearClassifier = useCallback(() => {
    if (confirm('Limpar todos os dados de treinamento?')) {
      setClassifier(new KNNClassifier())
      setCurrentLabel('')
    }
  }, [])

  const sampleCounts = classifier.getSampleCounts()
  const labels = Object.keys(sampleCounts)

  if (!isOpen) return null

  return (
    <div className="gesture-trainer-overlay">
      <div className="gesture-trainer-panel">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-cyan-500/20">
          <div>
            <h2>🧠 Treinador de Gestos</h2>
            <p className="text-xs text-gray-500 mt-1">Machine Learning com K-Nearest Neighbors</p>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="trainer-section">
          <h3>Criar/Selecionar Rótulo</h3>
          <div className="label-input-group">
            <input
              type="text"
              placeholder="Nome do gesto"
              value={newLabelInput}
              onChange={e => setNewLabelInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && addNewLabel()}
            />
            <button onClick={addNewLabel}>Adicionar</button>
          </div>

          {labels.length > 0 && (
            <div className="label-buttons">
              {labels.map(label => (
                <button
                  key={label}
                  className={`label-btn ${currentLabel === label ? 'active' : ''}`}
                  onClick={() => setCurrentLabel(label)}
                >
                  {label} ({sampleCounts[label]})
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="trainer-section">
          <h3>Treinar</h3>
          <p>Rótulo atual: <strong>{currentLabel || '(nenhum)'}</strong></p>

          <div className="trainer-buttons">
            <button
              className="record-btn"
              onClick={startRecording}
              disabled={!currentLabel || isRecording}
            >
              {isRecording ? `Gravando... (${recordingCountRef.current})` : 'Gravar (1s)'}
            </button>

            {isRecording && (
              <button className="stop-btn" onClick={stopRecording}>
                Parar
              </button>
            )}
          </div>
        </div>

        <div className="trainer-section">
          <h3>Testar</h3>
          <button className="test-btn" onClick={testGesture}>
            Testar Gesto Atual
          </button>
        </div>

        <div className="trainer-section">
          <h3>Resumo</h3>
          {labels.length === 0 ? (
            <p className="empty-text">Nenhum gesto treinado ainda</p>
          ) : (
            <div className="summary">
              {labels.map(label => (
                <div key={label} className="summary-item">
                  <span>{label}</span>
                  <span className="count">{sampleCounts[label]} amostras</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="trainer-footer">
          <button className="clear-btn" onClick={clearClassifier}>
            Limpar Tudo
          </button>
          <button className="close-main-btn" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
