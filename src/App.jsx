import { useState } from 'react'
import './App.css'

function App() {
  const [tarefas, setTarefas] = useState([])
  const [texto, setTexto] = useState('')

  function adicionarTarefa() {
    if (texto.trim() === '') return
    setTarefas([...tarefas, texto])
    setTexto('')
  }

  function removerTarefa(index) {
    const novaLista = tarefas.filter((_, i) => i !== index)
    setTarefas(novaLista)
  }

  return (
    <div className="container">
      <h1>Meu TodoList</h1>

      <div className="input-area">
        <input
          type="text"
          placeholder="Digite uma tarefa..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <button onClick={adicionarTarefa}>Adicionar</button>
      </div>

      <ul>
        {tarefas.map((tarefa, index) => (
          <li key={index}>
            {tarefa}
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