import { useState, useEffect } from 'react'
import { DndContext, closestCenter } from '@dnd-kit/core'
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
  const [editandoIndex, setEditandoIndex] = useState(null)
  const [textoEditado, setTextoEditado] = useState('')
  const [prioridade, setPrioridade] = useState('media')
  useEffect(() => {
    localStorage.setItem('tarefas', JSON.stringify(tarefas))
  }, [tarefas])

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
  return (
    <div className="container">
      <h1>Meu TodoList <span style={{ fontSize: '14px', color: '#888' }}>({pendentes} pendente{pendentes !== 1 ? 's' : ''})</span></h1>

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

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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