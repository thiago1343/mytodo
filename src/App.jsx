import { useState, useEffect } from 'react'
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import TarefaItem from './TarefaItem'
import './App.css'

function App() {
  const [tarefas, setTarefas] = useState(() => {
    const salvo = localStorage.getItem('tarefas')
    return salvo ? JSON.parse(salvo) : []
  })
  const [texto, setTexto] = useState('')
  const pendentes = tarefas.filter(t => !t.concluida).length
  const total = tarefas.length
const progresso = total === 0 ? 0 : Math.round((tarefas.filter(t => t.concluida).length / total) * 100)
  const [editandoIndex, setEditandoIndex] = useState(null)
  const [textoEditado, setTextoEditado] = useState('')
  const [prioridade, setPrioridade] = useState('media')
  const [nome, setNome] = useState(() => localStorage.getItem('nome') || '')
  const [menuAbertoIndex, setMenuAbertoIndex] = useState(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [notificacoes, setNotificacoes] = useState(true)
  const [weatherMsg, setWeatherMsg] = useState('A carregar tempo...')
  const [weatherEmoji, setWeatherEmoji] = useState('🌤️')

  function getTimeMessage() {
    const hora = new Date().getHours()
    if (hora >= 5 && hora < 12)
      return { msg: 'Bom dia! Ótima hora para começar as tarefas mais difíceis.', emoji: '🌅' }
    if (hora >= 12 && hora < 14)
      return { msg: 'Hora de almoço! Faz uma pausa e volta com energia.', emoji: '🍽️' }
    if (hora >= 14 && hora < 17)
      return { msg: 'Tarde ativa! Bom momento para tarefas de concentração.', emoji: '💪' }
    if (hora >= 17 && hora < 19)
      return { msg: 'Final de tarde. Vai terminando as tarefas pendentes.', emoji: '🌇' }
    if (hora >= 19 && hora < 22)
      return { msg: 'Já estamos quase no fim do dia. Evita conduzir à noite.', emoji: '🌆' }
    return { msg: 'É tarde! Descansa — amanhã continuas.', emoji: '🌙' }
  }

  const { msg: timeMsg, emoji: timeEmoji } = getTimeMessage()

  function getWeatherMessage(temp, rain) {
    if (rain > 0) return { msg: 'Hoje é um ótimo dia para focar em tarefas dentro de casa.', emoji: '🌧️' }
    if (temp > 25) return { msg: 'Dia quente! Tente concluir as tarefas mais importantes cedo.', emoji: '☀️' }
    if (temp < 10) return { msg: 'Dia frio. Perfeito para trabalho focado e concentrado.', emoji: '❄️' }
    return { msg: 'Tempo agradável na tua cidade! Ótimo dia para ser produtivo.', emoji: '🌤️' }
  }

  useEffect(() => {
    if (!navigator.geolocation) {
      setWeatherMsg('Geolocalização não suportada neste dispositivo.')
      setWeatherEmoji('❓')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,rain,showers`)
          .then((res) => res.json())
          .then((data) => {
            const temp = data.current.temperature_2m
            const rain = data.current.rain
            const { msg, emoji } = getWeatherMessage(temp, rain)
            setWeatherMsg(msg)
            setWeatherEmoji(emoji)
          })
          .catch(() => {
            setWeatherMsg('Não foi possível carregar o tempo.')
            setWeatherEmoji('❓')
          })
      },
      () => {
        setWeatherMsg('Permissão de localização negada.')
        setWeatherEmoji('📍')
      }
    )
  }, [])

  useEffect(() => {
    localStorage.setItem('tarefas', JSON.stringify(tarefas))
  }, [tarefas])
  useEffect(() => {
    localStorage.setItem('nome', nome)
  }, [nome])
  function adicionarTarefa() {
    if (texto.trim() === '') return
    setTarefas([...tarefas, { id: Date.now(), texto, concluida: false, prioridade }])
    setTexto('')
    setModalAberto(false)
  }

  function removerTarefa(index) {
    const novaLista = tarefas.filter((_, i) => i !== index)
    setTarefas(novaLista)
  }
  function concluirTarefa(index) {
    const novaLista = tarefas.map((tarefa, i) =>
      i === index ? { ...tarefa, concluida: !tarefa.concluida } : tarefa
    )
    setTarefas(novaLista)
  }
  function iniciarEdicao(index) {
    setEditandoIndex(index)
    setTextoEditado(tarefas[index].texto)
  }

  function salvarEdicao(index) {
    if (textoEditado.trim() === '') return
    const novaLista = tarefas.map((tarefa, i) =>
      i === index ? { ...tarefa, texto: textoEditado } : tarefa
    )
    setTarefas(novaLista)
    setEditandoIndex(null)
    setTextoEditado('')
  }
  function handleDragEnd(event) {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = tarefas.findIndex(t => t.id === active.id)
      const newIndex = tarefas.findIndex(t => t.id === over.id)
      setTarefas(arrayMove(tarefas, oldIndex, newIndex))
    }
  }
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )
  return (
    <div className="container">
      <div className="header">
        <div>
  <div className="header-titulo">
    {nome ? (
      <h1>Olá, {nome}! 👋</h1>
    ) : (
      <h1>Resh</h1>
    )}
    <button
      className={`bell-btn ${notificacoes ? 'bell-on' : 'bell-off'}`}
      onClick={() => setNotificacoes((v) => !v)}
      title={notificacoes ? 'Desativar notificações' : 'Ativar notificações'}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        {notificacoes && <circle cx="18" cy="6" r="3" fill="#6b7280" stroke="white" strokeWidth="1.5"/>}
      </svg>
    </button>
  </div>
  <p className="subtitulo">Vamos fazer acontecer hoje.</p>
</div>
      <div className="weather-banner">
        <span className="weather-emoji">{weatherEmoji}</span>
        <span className="weather-text">{weatherMsg}</span>
      </div>
      <div className="weather-banner time-banner">
        <span className="weather-emoji">{timeEmoji}</span>
        <span className="weather-text">{timeMsg}</span>
      </div>
        <div className="header-meta">
          <span className="pendentes-badge">{pendentes} pendente{pendentes !== 1 ? 's' : ''}</span>
          {!nome && (
            <div className="nome-area">
              <input
                className="input-nome"
                placeholder="Qual é o seu nome?"
                id="inputNome"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    setNome(e.target.value.trim())
                  }
                }}
              />
              <button onClick={() => {
                const val = document.getElementById('inputNome').value.trim()
                if (val) setNome(val)
              }}>OK</button>
            </div>
          )}
        </div>
      </div>
      {total > 0 && (
        <div className="progress-card">
          <div className="progress-info">
            <span className="progress-pct">{progresso}%</span>
            <span className="progress-label">concluídas</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progresso}%` }}></div>
          </div>
          <span className="progress-count">{tarefas.filter(t => t.concluida).length} de {total}</span>
        </div>
      )}

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
        <SortableContext items={tarefas.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="tarefas-card">
            <ul>
            {tarefas.map((tarefa, index) => (
              <TarefaItem
                key={tarefa.id}
                tarefa={tarefa}
                index={index}
                editandoIndex={editandoIndex}
                textoEditado={textoEditado}
                setTextoEditado={setTextoEditado}
                concluirTarefa={concluirTarefa}
                iniciarEdicao={iniciarEdicao}
                salvarEdicao={salvarEdicao}
                removerTarefa={removerTarefa}
              menuAbertoIndex={menuAbertoIndex}
              setMenuAbertoIndex={setMenuAbertoIndex}
              />
            ))}
            </ul>
          </div>
        </SortableContext>
      </DndContext>

      <div className="inline-form-wrapper">
        {modalAberto ? (
          <div className="inline-form">
            <input
              type="text"
              placeholder="Digite uma tarefa..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && adicionarTarefa()}
              autoFocus
            />
            <select value={prioridade} onChange={(e) => setPrioridade(e.target.value)}>
              <option value="alta">🔴 Alta</option>
              <option value="media">🟡 Média</option>
              <option value="baixa">🟢 Baixa</option>
            </select>
            <div className="inline-form-botoes">
              <button className="btn-cancelar" onClick={() => setModalAberto(false)}>Cancelar</button>
              <button onClick={adicionarTarefa}>Adicionar</button>
            </div>
          </div>
        ) : (
          <button className="fab" onClick={() => setModalAberto(true)}>+</button>
        )}
      </div>

      <nav className="bottom-nav">
        <button className="bottom-nav-item active">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span>Hoje</span>
        </button>
        <button className="bottom-nav-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          <span>Agenda</span>
        </button>
        <button className="bottom-nav-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          <span>Foco</span>
        </button>
        <button className="bottom-nav-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          <span>Insights</span>
        </button>
        <button className="bottom-nav-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/></svg>
          <span>Mais</span>
        </button>
      </nav>
    </div>
  )
}

export default App