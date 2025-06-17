// Função para carregar e mostrar os clientes na tabela
async function carregarClientes() {
  try {
    // Corrigido o seletor da tabela para '.cervejas-list tbody' conforme HTML
    const response = await fetch('/api/clientes');
    if (!response.ok) throw new Error('Erro ao carregar os clientes');
    const clientes = await response.json();

    const tbody = document.querySelector('.cervejas-list tbody');
    tbody.innerHTML = ''; // Limpa tabela

    clientes.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${capitalize(c.nome)}</td>
        <td>${c.telefone}</td>
        <td>${c.cpf}</td>
        <td>${c.endereco}</td>
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

// Função para filtrar clientes com base no texto da pesquisa
document.querySelector('.search-box input').addEventListener('input', function () {
  const termo = this.value.toLowerCase();
  const linhas = document.querySelectorAll('.cervejas-list tbody tr');

  linhas.forEach(linha => {
    const textoLinha = linha.textContent.toLowerCase();
    linha.style.display = textoLinha.includes(termo) ? '' : 'none';
  });
});

// Helper para capitalizar a primeira letra
function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Evento do formulário para cadastrar cliente
document.querySelector('.users-form').addEventListener('submit', async e => {
  e.preventDefault();

  const novoCliente = {
    nome: document.getElementById('nome').value,
    telefone: document.getElementById('telefone').value,
    cpf: document.getElementById('cpf').value,
    endereco: document.getElementById('endereco').value
  };

  try {
    const response = await fetch('/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoCliente)
    });

    if (!response.ok) throw new Error('Erro ao cadastrar o cliente');

    alert('Cliente cadastrado com sucesso!');
    e.target.reset();

    carregarClientes(); // Atualiza a lista

  } catch (error) {
    alert(error.message);
  }
});

// Evento para deletar cliente
document.querySelector('.cervejas-list tbody').addEventListener('click', async (e) => {
  if (e.target.closest('.btn-delete')) {
    const id = e.target.closest('.btn-delete').dataset.id;

    if (confirm('Deseja realmente excluir este cliente?')) {
      try {
        const response = await fetch(`/api/clientes/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error('Erro ao excluir o cliente');

        alert('Cliente excluído com sucesso!');
        carregarClientes(); // Atualiza a lista

      } catch (error) {
        alert(error.message);
      }
    }
  }
});

document.getElementById('cpf').addEventListener('input', function (e) {
  let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não for dígito
  value = value.slice(0,11); 
  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  e.target.value = value;
});

document.getElementById('telefone').addEventListener('input', function (e) {
  let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não for número
  value = value.replace(/^(\d{2})(\d)/, '($1) $2');     // Coloca parênteses em volta dos dois primeiros dígitos
  value = value.replace(/(\d{5})(\d)/, '$1-$2');        // Adiciona o hífen depois dos 5 primeiros dígitos
  value = value.substring(0, 15);                       // Limita o tamanho máximo
  e.target.value = value;
});

// Carrega a lista ao abrir a página
window.addEventListener('DOMContentLoaded', carregarClientes);
