import { useState, useEffect, useRef } from 'react'

const MODOS = {
  foco: { label: 'Foco', segundos: 25 * 60, cor: '#667eea' },
  pausa: { label: 'Pausa', segundos: 5 * 60, cor: '#43a047' },
}

const RAIO = 54
const CIRCUNFERENCIA = 2 * Math.PI * RAIO

const SONS = [
  { id: 'chuva', label: '🌧️ Chuva' },
  { id: 'ondas', label: '🌊 Ondas' },
  { id: 'foco', label: '🎵 Tom Foco' },
]

function criarChuva(ctx) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let ultimo = 0
  for (let i = 0; i < data.length; i++) {
    const branco = Math.random() * 2 - 1
    ultimo = (ultimo + 0.02 * branco) / 1.02
    data[i] = ultimo * 3.5
  }
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true
  const filtro = ctx.createBiquadFilter()
  filtro.type = 'lowpass'
  filtro.frequency.value = 600
  const gain = ctx.createGain()
  gain.gain.value = 0.7
  source.connect(filtro)
  filtro.connect(gain)
  gain.connect(ctx.destination)
  source.start()
  return { source, gain }
}

function criarOndas(ctx) {
  const osc1 = ctx.createOscillator()
  const osc2 = ctx.createOscillator()
  osc1.type = 'sine'
  osc2.type = 'sine'
  osc1.frequency.value = 0.1
  osc2.frequency.value = 0.15
  const gain = ctx.createGain()
  gain.gain.value = 0.3
  const filtro = ctx.createBiquadFilter()
  filtro.type = 'lowpass'
  filtro.frequency.value = 400

  const bufferNoise = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate)
  const data = bufferNoise.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  const noise = ctx.createBufferSource()
  noise.buffer = bufferNoise
  noise.loop = true

  const gainMod = ctx.createGain()
  gainMod.gain.value = 0.5
  osc1.connect(gainMod.gain)
  osc2.connect(gainMod.gain)
  noise.connect(gainMod)
  gainMod.connect(filtro)
  filtro.connect(gain)
  gain.connect(ctx.destination)

  osc1.start(); osc2.start(); noise.start()
  return { source: noise, osc1, osc2, gain }
}

function criarFoco(ctx) {
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.value = 200
  const osc2 = ctx.createOscillator()
  osc2.type = 'sine'
  osc2.frequency.value = 240
  const gain = ctx.createGain()
  gain.gain.value = 0.12
  osc.connect(gain)
  osc2.connect(gain)
  gain.connect(ctx.destination)
  osc.start(); osc2.start()
  return { source: osc, osc2, gain }
}

function Foco() {
  const [modo, setModo] = useState('foco')
  const [segundosRestantes, setSegundosRestantes] = useState(MODOS.foco.segundos)
  const [ativo, setAtivo] = useState(false)
  const [ciclos, setCiclos] = useState(0)
  const [somAtivo, setSomAtivo] = useState(null)
  const intervaloRef = useRef(null)
  const audioRef = useRef(null)

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

  function pararSom() {
    if (audioRef.current) {
      try {
        const { source, osc1, osc2 } = audioRef.current
        source?.stop?.()
        osc1?.stop?.()
        osc2?.stop?.()
        audioRef.current.ctx?.close()
      } catch (_) {}
      audioRef.current = null
    }
    setSomAtivo(null)
  }

  function tocarSom(id) {
    pararSom()
    if (somAtivo === id) return

    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    let nos
    if (id === 'chuva') nos = criarChuva(ctx)
    else if (id === 'ondas') nos = criarOndas(ctx)
    else nos = criarFoco(ctx)

    audioRef.current = { ...nos, ctx }
    setSomAtivo(id)
  }

  useEffect(() => () => pararSom(), [])

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
        <p className="foco-musica-titulo">🎵 Sons ambiente</p>
        <div className="foco-sons-grid">
          {SONS.map((s) => (
            <button
              key={s.id}
              className={`foco-som-btn ${somAtivo === s.id ? 'foco-som-ativo' : ''}`}
              onClick={() => tocarSom(s.id)}
            >
              {somAtivo === s.id ? '🔊 ' : ''}{s.label}
              {somAtivo === s.id && <span className="foco-som-parar"> ✕</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Foco
