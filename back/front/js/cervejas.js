// Função para carregar e mostrar as cervejas na tabela
async function carregarCervejas() {
  try {
    const response = await fetch('/api/cervejas');
    if (!response.ok) throw new Error('Erro ao carregar as cervejas');
    const cervejas = await response.json();

    const tbody = document.querySelector('.cervejas-list tbody');
    tbody.innerHTML = ''; // Limpa tabela

    cervejas.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${capitalize(c.tipo)}</td>
        <td>${capitalize(c.embalagem)}</td>
        <td>${formatDate(c.dataProducao)}</td>
        <td>${c.quantidade} litros</td>
        <td>R$ ${c.valorUnitario.toFixed(2)}</td>
        <td>${c.lote}</td>
        <td class="actions">
          <button class="btn-action btn-edit" data-id="${c.id}"><i class="fas fa-edit"></i></button>
          <button class="btn-action btn-delete" data-id="${c.id}"><i class="fas fa-trash"></i></button>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (error) {
    alert(error.message);
  }
}

// Helper para capitalizar a primeira letra
function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Helper para formatar data do formato ISO (YYYY-MM-DD) para DD/MM/YYYY
function formatDate(dataStr) {
  if (!dataStr) return '';
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}/${ano}`;
}

// Evento do formulário para cadastrar cerveja
document.querySelector('.beer-form').addEventListener('submit', async e => {
  e.preventDefault();

  const novaCerveja = {
    tipo: document.getElementById('tipo-cerveja').value,
    embalagem: document.getElementById('embalagem').value,
    dataProducao: document.getElementById('data-producao').value,
    quantidade: Number(document.getElementById('quantidade').value),
    valorUnitario: Number(document.getElementById('valor-unitario').value),
    lote: document.getElementById('lote').value
  };

  try {
    const response = await fetch('/api/cervejas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novaCerveja)
    });

    if (!response.ok) throw new Error('Erro ao cadastrar a cerveja');

    alert('Cerveja cadastrada com sucesso!');
    e.target.reset();

    // Atualiza a lista após o cadastro
    carregarCervejas();

  } catch (error) {
    alert(error.message);
  }
});

// EM ANDAMENTO - FUNÇÃO DE EDITAR CERVEJAS
/* 
document.querySelector('.beer-form').addEventListener('submit', async e => {
  e.preventDefault();

  const cerveja = {
    tipo: document.getElementById('tipo-cerveja').value,
    embalagem: document.getElementById('embalagem').value,
    dataProducao: document.getElementById('data-producao').value,
    quantidade: Number(document.getElementById('quantidade').value),
    valorUnitario: Number(document.getElementById('valor-unitario').value),
    lote: document.getElementById('lote').value
  };

  try {
    let response;

    if (cervejaEditando) {
      // Modo edição (PUT)
      response = await fetch(`/api/cervejas/${cervejaEditando}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cerveja)
      });

      if (!response.ok) throw new Error('Erro ao atualizar a cerveja');

      alert('Cerveja atualizada com sucesso!');
    } else {
      // Modo cadastro (POST)
      response = await fetch('/api/cervejas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cerveja)
      });

      if (!response.ok) throw new Error('Erro ao cadastrar a cerveja');

      alert('Cerveja cadastrada com sucesso!');
    }

    // Limpa o formulário e volta ao modo padrão
    e.target.reset();
    cervejaEditando = null;
    document.querySelector('.beer-form button[type="submit"]').textContent = 'Salvar Cerveja';

    carregarCervejas();

  } catch (error) {
    alert(error.message);
  }
}); */


document.querySelector('.cervejas-list tbody').addEventListener('click', async (e) => {
  if (e.target.closest('.btn-delete')) {
    const id = e.target.closest('.btn-delete').dataset.id;

    if (confirm('Deseja realmente excluir esta cerveja?')) {
      try {
        const response = await fetch(`/api/cervejas/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error('Erro ao excluir a cerveja');

        alert('Cerveja excluída com sucesso!');
        carregarCervejas(); // Atualiza a lista

      } catch (error) {
        alert(error.message);
      }
    }
  }
});

// Carrega a lista ao abrir a página
window.addEventListener('DOMContentLoaded', carregarCervejas);

let cervejaEditando = null;

// Escuta cliques no botão Editar
document.querySelector('.cervejas-list tbody').addEventListener('click', async (e) => {
  if (e.target.closest('.btn-edit')) {
    const id = e.target.closest('.btn-edit').dataset.id;

    try {
      const response = await fetch(`/api/cervejas/${id}`);
      if (!response.ok) throw new Error('Erro ao buscar cerveja');

      const cerveja = await response.json();

      // Preenche o formulário com os dados
      document.getElementById('tipo-cerveja').value = cerveja.tipo;
      document.getElementById('embalagem').value = cerveja.embalagem;
      document.getElementById('data-producao').value = cerveja.dataProducao;
      document.getElementById('quantidade').value = cerveja.quantidade;
      document.getElementById('valor-unitario').value = cerveja.valorUnitario;
      document.getElementById('lote').value = cerveja.lote;

      // Guarda o ID da cerveja em edição
      cervejaEditando = id;

      // Muda o texto do botão principal para "Atualizar Cerveja"
      document.querySelector('.beer-form button[type="submit"]').textContent = 'Atualizar Cerveja';

    } catch (error) {
      alert(error.message);
    }
  }
});
