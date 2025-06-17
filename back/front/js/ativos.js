// FILTRA A BASE DE PEDIDOS PARA AQUELES COM STATUS EM ABERTO E EXIBE NA HOME

function formatDate(dateStr) {
  // Espera dateStr no formato 'YYYY-MM-DD' (ex: '2025-05-26')
  const [year, month, day] = dateStr.split('-').map(Number);
  // Cria a data no horário local diretamente, sem interpretar fuso
  const date = new Date(year, month - 1, day);
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}`;
}


function getStatusClass(status) {
  switch (status.toLowerCase()) {
    case 'aberto': return 'aberto';
    case 'entregue': return 'entregue';
    case 'concluido': return 'concluido';
    default: return '';
  }
}

// Função auxiliar para capitalizar texto
function capitalize(texto) {
  if (!texto) return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

async function carregarPedidosAtivos() {
  const tbody = document.querySelector('.pedidos-ativos tbody');
  console.log("tbody encontrado:", tbody); // Adiciona isso

  if (!tbody) {
    console.warn('tbody não encontrado. A função carregarPedidosAtivos foi chamada sem o elemento presente.');
    return;  // evita erro
  }

  tbody.innerHTML = '';

  try {
    const res = await fetch('/api/pedidos');
    const pedidos = await res.json();

    // Filtra só os pedidos ABERTOS
    /* const pedidosAtivos = pedidos.filter(p => p.status?.toLowerCase() === 'aberto'); */

    // Filtra Pedidos Abertos e Entregues (que ainda são considerados ativos)
const pedidosAtivos = pedidos.filter(p => {
  const status = p.status?.toLowerCase();
  return status === 'aberto' || status === 'entregue';
});

pedidosAtivos.sort((a, b) => new Date(a.dataEntrega) - new Date(b.dataEntrega));


    pedidosAtivos.forEach(p => {
      const produtosDesc = p.itens.map(item => `${capitalize(item.tipoCerveja)} (${capitalize(item.embalagem)}) x${item.quantidade}`).join(', ');
      const quantidadeTotal = p.itens ? p.itens.reduce((acc, item) => acc + (item.quantidade || 0), 0) : 0;
      const valorTotal = p.itens ? p.itens.reduce((acc, item) => acc + (item.valorUnitario || 0) * (item.quantidade || 0), 0) : 0;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${formatDate(p.dataEntrega)}</td>
        <td>${capitalize(p.clienteNome)}</td>
        <td>${produtosDesc}</td>
        <td>${quantidadeTotal}</td>
        <td>R$ ${valorTotal.toFixed(2)}</td>
        <td>${p.tipoEntrega ? capitalize(p.tipoEntrega) : '-'}</td>
        <td>${p.enderecoEntrega || '-'}</td>
        <td>${p.itens ? p.itens.map(item => item.codigo).join(' ') : '-'}</td>
        <td>${p.observacoes || ''}</td>
        <td> 
          <span class="status-badge ${getStatusClass(p.status)}" onclick="editarStatusInline(this, ${p.id})">${p.status} </span> 
        </td>
        <td> 
          <span class="payment-badge ${p.pagamento?.toLowerCase().trim() === 'pago' ? 'pago' : 'pendente'}" 
                onclick="editarPagamentoInline(this, ${p.id})">
            ${p.pagamento || '-'}
          </span> 
        </td>
        <td class="actions">
          <button class="btn-action btn-edit" data-id="${p.id}"><i class="fas fa-edit"></i></button>
          <button class="btn-action btn-delete" data-id="${p.id}"><i class="fas fa-trash"></i></button>
        </td>
      `;

      tbody.appendChild(tr);
    });

  } catch (error) {
    alert('Erro ao carregar pedidos ativos: ' + error.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  carregarPedidosAtivos();

  const tbody = document.querySelector('.pedidos-ativos tbody');
  if (tbody) {
    tbody.addEventListener('click', async (e) => {
      const botao = e.target.closest('.btn-delete');
      if (!botao) return;

      const id = botao.dataset.id;

      if (confirm('Deseja realmente excluir este pedido?')) {
        try {
          const response = await fetch(`/api/pedidos/${id}`, { method: 'DELETE' });
          if (!response.ok) throw new Error('Erro ao excluir o pedido');

          alert('Pedido excluído com sucesso!');
          carregarPedidosAtivos();
        } catch (error) {
          alert(error.message);
        }
      }
    });
  } else {
    console.warn('tbody da tabela de pedidos ativos não encontrado para adicionar listener.');
  }
});

