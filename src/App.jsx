import { useState , useEffect} from 'react'
import './App.css'

function App() {
  const [tarefas, setTarefas] = useState(() => {
    const salvo = localStorage.getItem('tarefas')
    return salvo ? JSON.parse(salvo) : []
  })
  const [texto, setTexto] = useState('')
  const pendentes = tarefas.filter(t => !t.concluida).length
  useEffect(() => {
    localStorage.setItem('tarefas', JSON.stringify(tarefas))
  }, [tarefas])

  function adicionarTarefa() {
    if (texto.trim() === '') return
    setTarefas([...tarefas, { texto, concluida: false }])
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
        <button onClick={adicionarTarefa}>Adicionar</button>
      </div>

      <ul>
        {tarefas.map((tarefa, index) => (
          <li key={index}>
            <span
              onClick={() => concluirTarefa(index)}
              className={tarefa.concluida ? 'concluida' : ''}
            >
              {tarefa.texto}
            </span>
            <button className="delete" onClick={() => removerTarefa(index)}>
              Remover
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App