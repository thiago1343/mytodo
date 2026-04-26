function Calendario() {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = hoje.getMonth()
  const diaHoje = hoje.getDate()

  const nomeMes = hoje.toLocaleString('pt-PT', { month: 'long' })
  const primeiroDia = new Date(ano, mes, 1).getDay()
  const totalDias = new Date(ano, mes + 1, 0).getDate()

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const celulas = []
  for (let i = 0; i < primeiroDia; i++) celulas.push(null)
  for (let d = 1; d <= totalDias; d++) celulas.push(d)

  return (
    <div className="calendario-page">
      <h2 className="calendario-titulo">
        {nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)} {ano}
      </h2>
      <div className="calendario-grid">
        {diasSemana.map((d) => (
          <div key={d} className="cal-header-dia">{d}</div>
        ))}
        {celulas.map((dia, i) => (
          <div
            key={i}
            className={`cal-dia ${dia === diaHoje ? 'cal-hoje' : ''} ${!dia ? 'cal-vazio' : ''}`}
          >
            {dia}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Calendario
