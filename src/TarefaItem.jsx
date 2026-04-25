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
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
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
          <button
            className={`check-btn ${tarefa.concluida ? 'checked' : ''}`}
            onClick={() => concluirTarefa(index)}
            onPointerDown={(e) => e.stopPropagation()}
            title="Marcar como concluída"
          />
          <span className={`badge ${tarefa.prioridade}`} title={tarefa.prioridade} />
          <span
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