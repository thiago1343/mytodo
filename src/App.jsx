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
          {nome ? (
            <h1>Olá, {nome}! 👋</h1>
          ) : (
            <h1>Resh</h1>
          )}
          <p className="subtitulo">Vamos fazer acontecer hoje.</p>
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

      <div className="input-area">
        <input
          type="text"
          placeholder="Digite uma tarefa..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && adicionarTarefa()}
        />
        <select value={prioridade} onChange={(e) => setPrioridade(e.target.value)}>
          <option value="alta">🔴 Alta</option>
          <option value="media">🟡 Média</option>
          <option value="baixa">🟢 Baixa</option>
        </select>
        <button onClick={adicionarTarefa}>Adicionar</button>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
        <SortableContext items={tarefas.map(t => t.id)} strategy={verticalListSortingStrategy}>
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
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  )
}

export default App