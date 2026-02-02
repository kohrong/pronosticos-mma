'use client'

interface PeleadorOption {
  id: string
  nombre: string
  foto: string | null
}

interface PredictionSelectorProps {
  peleador1: PeleadorOption
  peleador2: PeleadorOption
  selectedPeleador?: string
  onSelect: (peleadorId: string) => void
  disabled?: boolean
}

export function PredictionSelector({
  peleador1,
  peleador2,
  selectedPeleador,
  onSelect,
  disabled = false,
}: PredictionSelectorProps) {
  return (
    <div className="prediction-selector">
      <button
        className={`prediction-option ${selectedPeleador === peleador1.id ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && onSelect(peleador1.id)}
        disabled={disabled}
        type="button"
      >
        {peleador1.foto && (
          <img
            src={peleador1.foto}
            alt={peleador1.nombre}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        )}
        <span>{peleador1.nombre}</span>
      </button>
      <button
        className={`prediction-option ${selectedPeleador === peleador2.id ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && onSelect(peleador2.id)}
        disabled={disabled}
        type="button"
      >
        {peleador2.foto && (
          <img
            src={peleador2.foto}
            alt={peleador2.nombre}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        )}
        <span>{peleador2.nombre}</span>
      </button>
    </div>
  )
}
