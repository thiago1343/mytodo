import { useState, useEffect, useRef } from 'react'

const MODOS = {
  foco: { label: 'Foco', segundos: 25 * 60, cor: '#667eea' },
  pausa: { label: 'Pausa', segundos: 5 * 60, cor: '#43a047' },
}

const RAIO = 54
const CIRCUNFERENCIA = 2 * Math.PI * RAIO

function Foco() {
  const [modo, setModo] = useState('foco')
  const [segundosRestantes, setSegundosRestantes] = useState(MODOS.foco.segundos)
  const [ativo, setAtivo] = useState(false)
  const [ciclos, setCiclos] = useState(0)
  const intervaloRef = useRef(null)

  const total = MODOS[modo].segundos
  const progresso = segundosRestantes / total
  const offset = CIRCUNFERENCIA * (1 - progresso)

  const minutos = String(Math.floor(segundosRestantes / 60)).padStart(2, '0')
  const segundos = String(segundosRestantes % 60).padStart(2, '0')

  useEffect(() => {
    if (ativo) {
      intervaloRef.current = setInterval(() => {
        setSegundosRestantes((s) => {
          if (s <= 1) {
            clearInterval(intervaloRef.current)
            setAtivo(false)
            if (modo === 'foco') setCiclos((c) => c + 1)
            const proximo = modo === 'foco' ? 'pausa' : 'foco'
            setModo(proximo)
            return MODOS[proximo].segundos
          }
          return s - 1
        })
      }, 1000)
    } else {
      clearInterval(intervaloRef.current)
    }
    return () => clearInterval(intervaloRef.current)
  }, [ativo, modo])

  function trocarModo(novoModo) {
    setAtivo(false)
    setModo(novoModo)
    setSegundosRestantes(MODOS[novoModo].segundos)
  }

  function resetar() {
    setAtivo(false)
    setSegundosRestantes(MODOS[modo].segundos)
  }

  const cor = MODOS[modo].cor

  return (
    <div className="foco-page">
      <h2 className="foco-titulo">Modo Foco</h2>

      <div className="foco-modo-tabs">
        <button
          className={`foco-tab ${modo === 'foco' ? 'foco-tab-ativo' : ''}`}
          onClick={() => trocarModo('foco')}
        >
          🧠 Foco (25 min)
        </button>
        <button
          className={`foco-tab ${modo === 'pausa' ? 'foco-tab-ativo' : ''}`}
          onClick={() => trocarModo('pausa')}
        >
          ☕ Pausa (5 min)
        </button>
      </div>

      <div className="foco-relogio">
        <svg width="140" height="140" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={RAIO} fill="none" stroke="#e0e0e0" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r={RAIO}
            fill="none"
            stroke={cor}
            strokeWidth="8"
            strokeDasharray={CIRCUNFERENCIA}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="foco-tempo">{minutos}:{segundos}</div>
        <div className="foco-modo-label">{MODOS[modo].label}</div>
      </div>

      <div className="foco-botoes">
        <button className="foco-btn-reset" onClick={resetar}>↺</button>
        <button
          className="foco-btn-play"
          style={{ background: cor }}
          onClick={() => setAtivo((v) => !v)}
        >
          {ativo ? '⏸' : '▶'}
        </button>
      </div>

      {ciclos > 0 && (
        <p className="foco-ciclos">🍅 {ciclos} ciclo{ciclos !== 1 ? 's' : ''} concluído{ciclos !== 1 ? 's' : ''} hoje</p>
      )}

      <div className="foco-musica">
        <p className="foco-musica-titulo">🎵 Música para focar</p>
        <div className="foco-musica-links">
          <a
            href="https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ"
            target="_blank"
            rel="noopener noreferrer"
            className="foco-musica-btn spotify"
          >
            Spotify — Deep Focus
          </a>
          <a
            href="https://www.youtube.com/watch?v=jfKfPfyJRdk"
            target="_blank"
            rel="noopener noreferrer"
            className="foco-musica-btn youtube"
          >
            YouTube — Lo-fi Radio
          </a>
        </div>
      </div>
    </div>
  )
}

export default Foco
