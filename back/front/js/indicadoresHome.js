
// EXIBE A QUANTIDADE DE PEDIDOS COM DATA DE ENTREGA PARA HOJE 
async function atualizarPedidosParaHoje() {
  try {
    const response = await fetch('/api/pedidos');
    if (!response.ok) throw new Error('Erro ao buscar pedidos');

    const pedidos = await response.json();

    const hoje = new Date();
    const dia = hoje.getDate().toString().padStart(2, '0');
    const mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
    const dataHojeFormatada = `${dia}/${mes}`;

const pedidosHoje = pedidos.filter(pedido => {
  if (!pedido.dataEntrega) return false;

  // Extrai dia e mês do formato "2025-05-26"
  const [ano, mes, dia] = pedido.dataEntrega.split('-');

  // Cria string no formato DD/MM para comparar
  const dataEntregaFormatada = `${dia}/${mes}`;

  return dataEntregaFormatada === dataHojeFormatada;
});


    const statValue = document.querySelector('.stat-card .stat-value');
    statValue.textContent = pedidosHoje.length;

  } catch (error) {
    console.error('Erro ao carregar pedidos para hoje:', error);
  }
}

async function atualizarValorVendas7Dias() {
  try {
    const response = await fetch('/api/pedidos');
    if (!response.ok) throw new Error('Erro ao buscar pedidos');

    const pedidos = await response.json();

    const hoje = new Date();
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(hoje.getDate() - 6); // Inclui hoje + 6 dias anteriores

    let totalSemanal = 0;

    pedidos.forEach(pedido => {
      if (!pedido.dataEntrega || !pedido.itens) return;

      const dataEntrega = new Date(pedido.dataEntrega);

      // Verifica se a data de entrega está nos últimos 7 dias
      if (dataEntrega >= seteDiasAtras && dataEntrega <= hoje) {
        const totalPedido = pedido.itens.reduce((acc, item) => acc + (item.quantidade * item.valorUnitario), 0);
        totalSemanal += totalPedido;
      }
    });

    // ✅ Atualiza no lugar correto do HTML
    const statValue = document.querySelector('.stat-vendas-semana');
    statValue.textContent = `R$ ${totalSemanal.toFixed(2)}`;

  } catch (error) {
    console.error('Erro ao calcular valor de vendas semanal:', error);
  }
}

async function atualizarTicketMedio() {
  try {
    const response = await fetch('/api/pedidos');
    if (!response.ok) throw new Error('Erro ao buscar pedidos');

    const pedidos = await response.json();

    let totalGeral = 0;
    let totalPedidos = 0;

    pedidos.forEach(pedido => {
      if (!pedido.itens) return;

      const totalPedido = pedido.itens.reduce((acc, item) => acc + (item.quantidade * item.valorUnitario), 0);
      totalGeral += totalPedido;
      totalPedidos++;
    });

    const ticketMedio = totalPedidos > 0 ? totalGeral / totalPedidos : 0;

    const statValue = document.querySelector('.stat-ticket-medio');
    statValue.textContent = `R$ ${ticketMedio.toFixed(2)}`;

  } catch (error) {
    console.error('Erro ao calcular ticket médio:', error);
  }
}

atualizarPedidosParaHoje();
atualizarValorVendas7Dias();
atualizarTicketMedio();
