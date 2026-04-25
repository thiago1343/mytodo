import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRef, useEffect } from 'react'

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
  menuAbertoIndex,
  setMenuAbertoIndex,
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: tarefa.id })
  const menuAberto = menuAbertoIndex === index
  const menuRef = useRef(null)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  useEffect(() => {
    function fecharFora(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAbertoIndex(null)
      }
    }
    if (menuAberto) document.addEventListener('pointerdown', fecharFora)
    return () => document.removeEventListener('pointerdown', fecharFora)
  }, [menuAberto])

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
      <div className="menu-wrapper" ref={menuRef}>
        <button
          className="menu-btn"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setMenuAbertoIndex(menuAberto ? null : index)}
          title="Opções"
        >
          ⋮
        </button>
        {menuAberto && (
          <div className="menu-dropdown">
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => { iniciarEdicao(index); setMenuAbertoIndex(null) }}
            >
              ✏️ Editar
            </button>
            <button
              className="menu-remover"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => { removerTarefa(index); setMenuAbertoIndex(null) }}
            >
              🗑️ Remover
            </button>
          </div>
        )}
      </div>
    </li>
  )
}

export default TarefaItem