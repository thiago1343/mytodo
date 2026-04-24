import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function TarefaItem({
  tarefa,
  index,
  editandoIndex,
  textoEditado,
  setTextoEditado,
  concluirTarefa,
  iniciarEdicao,
  salvarEdicao,
  removerTarefa,
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: tarefa.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li ref={setNodeRef} style={style}>
      <span className="drag-handle" {...attributes} {...listeners}>
        ⠿
      </span>
      {editandoIndex === index ? (
        <input
          className="input-edicao"
          value={textoEditado}
          onChange={(e) => setTextoEditado(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && salvarEdicao(index)}
          onBlur={() => salvarEdicao(index)}
          autoFocus
        />
      ) : (
        <>
          <span className={`badge ${tarefa.prioridade}`}>
            {tarefa.prioridade}
          </span>
          <span
            onClick={() => concluirTarefa(index)}
            onDoubleClick={() => iniciarEdicao(index)}
            className={tarefa.concluida ? 'concluida' : ''}
          >
            {tarefa.texto}
          </span>
        </>
      )}
      <button className="delete" onClick={() => removerTarefa(index)}>
        Remover
      </button>
    </li>
  )
}

export default TarefaItem