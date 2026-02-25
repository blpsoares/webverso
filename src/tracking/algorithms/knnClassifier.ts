/**
 * K-Nearest Neighbors classifier for hand gesture recognition.
 * Features: 21 landmarks × 2 (x, y normalized to wrist position).
 */

export interface KNNSample {
  features: number[]
  label: string
}

export interface KNNData {
  samples: KNNSample[]
  labels: string[]
}

export class KNNClassifier {
  private samples: KNNSample[] = []
  private k = 3

  /**
   * Extract 42 features (21 landmarks × x,y) normalized to wrist.
   * Landmark 0 is wrist, others are relative to wrist position.
   */
  static extractFeatures(landmarks: { x: number; y: number; z: number }[]): number[] {
    if (landmarks.length < 21) return []

    const wrist = landmarks[0]
    const features: number[] = []

    for (let i = 0; i < 21; i++) {
      const lm = landmarks[i]
      features.push(lm.x - wrist.x) // Relative x
      features.push(lm.y - wrist.y) // Relative y
    }

    return features
  }

  /**
   * Add a training sample.
   */
  addSample(features: number[], label: string) {
    if (features.length !== 42) {
      console.warn(`Expected 42 features, got ${features.length}`)
      return
    }
    this.samples.push({ features, label })
  }

  /**
   * Predict the label for given features.
   */
  predict(features: number[]): { label: string | null; confidence: number } {
    if (this.samples.length === 0) return { label: null, confidence: 0 }
    if (features.length !== 42) return { label: null, confidence: 0 }

    // Find k nearest neighbors
    const distances = this.samples.map((sample, idx) => ({
      idx,
      distance: this.euclideanDistance(features, sample.features),
      label: sample.label,
    }))

    distances.sort((a, b) => a.distance - b.distance)
    const k = Math.min(this.k, distances.length)
    const neighbors = distances.slice(0, k)

    // Vote on label
    const votes = new Map<string, number>()
    for (const neighbor of neighbors) {
      votes.set(neighbor.label, (votes.get(neighbor.label) || 0) + 1)
    }

    const bestLabel = Array.from(votes.entries()).sort((a, b) => b[1] - a[1])[0]
    if (!bestLabel) return { label: null, confidence: 0 }

    // Confidence: how many of k neighbors voted for best label
    const confidence = bestLabel[1] / k

    return { label: bestLabel[0], confidence }
  }

  /**
   * Euclidean distance between two feature vectors.
   */
  private euclideanDistance(a: number[], b: number[]): number {
    let sum = 0
    for (let i = 0; i < a.length; i++) {
      const diff = a[i] - b[i]
      sum += diff * diff
    }
    return Math.sqrt(sum)
  }

  /**
   * Export classifier state to JSON.
   */
  toJSON(): KNNData {
    return {
      samples: this.samples,
      labels: [...new Set(this.samples.map(s => s.label))],
    }
  }

  /**
   * Load classifier state from JSON.
   */
  fromJSON(data: KNNData) {
    this.samples = data.samples
  }

  /**
   * Get number of samples per label.
   */
  getSampleCounts(): Record<string, number> {
    const counts: Record<string, number> = {}
    for (const sample of this.samples) {
      counts[sample.label] = (counts[sample.label] || 0) + 1
    }
    return counts
  }

  /**
   * Clear all samples.
   */
  clear() {
    this.samples = []
  }
}
