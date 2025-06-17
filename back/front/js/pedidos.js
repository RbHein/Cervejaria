const inputCliente = document.getElementById('busca-cliente');
const listaSugestoes = document.getElementById('sugestoes-clientes');
let clienteSelecionado = null;
let timeout = null;

// Função debounce para evitar requisições em excesso
const debounce = (func, delay) => {
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

// Função de busca
const buscarClientes = async () => {
  const termo = inputCliente.value.trim();

  if (termo.length < 2) {
    listaSugestoes.innerHTML = '';
    return;
  }

  try {
    const params = new URLSearchParams();

    if (/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(termo) || /^\d{11}$/.test(termo)) {
      params.append('cpf', termo);
    } else {
      params.append('nome', termo);
    }

    const response = await fetch(`/api/clientes?${params.toString()}`);
    if (!response.ok) throw new Error('Erro na busca de clientes');

    const clientes = await response.json();
    listaSugestoes.innerHTML = '';

    if (clientes.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'Nenhum cliente encontrado';
      li.classList.add('no-result');
      listaSugestoes.appendChild(li);
      return;
    }

    clientes.forEach(cliente => {
      const li = document.createElement('li');
      li.textContent = `${cliente.nome} - ${cliente.cpf}`;
      li.dataset.id = cliente.id;
      li.addEventListener('click', () => {
        inputCliente.value = `${cliente.nome} - ${cliente.cpf}`;
        clienteSelecionado = cliente;
        listaSugestoes.innerHTML = '';

        // Atualiza o campo de endereço cadastrado logo abaixo do input
        const campoEnderecoTopo = document.getElementById("endereco-cadastrado-info");
        if (campoEnderecoTopo) {
          campoEnderecoTopo.textContent = cliente.endereco
            ? `Endereço cadastrado: ${cliente.endereco}`
            : "Endereço não disponível.";
          campoEnderecoTopo.style.display = "block";
        }

        // Atualiza o endereço cadastrado no formulário, se opção marcada
        const radioEndereco = document.querySelector('input[name="opcao-endereco"]:checked');
        if (radioEndereco && radioEndereco.value === "cadastrado") {
          mostrarEnderecoCadastrado();
        }
      });
      listaSugestoes.appendChild(li);
    });

  } catch (err) {
    console.error('Erro ao buscar clientes:', err);
    listaSugestoes.innerHTML = '';
  }
};

// Dispara busca com debounce
inputCliente.addEventListener('input', debounce(buscarClientes, 300));

// Fecha a lista se clicar fora
document.addEventListener('click', (e) => {
  if (!e.target.closest('.form-group')) {
    listaSugestoes.innerHTML = '';
  }
});

function verificarEntrega() {
  const tipoEntrega = document.getElementById("tipo-entrega").value;
  const opcaoEndereco = document.getElementById("opcao-endereco");

  if (tipoEntrega === "entregar") {
    opcaoEndereco.style.display = "block";
  } else {
    opcaoEndereco.style.display = "none";
    document.getElementById("novo-endereco").style.display = "none";
    document.getElementById("endereco-cadastrado").style.display = "none";
  }
}


function alternarEndereco() {
  const tipoEndereco = document.getElementById("endereco-select").value;
  const divNovoEndereco = document.getElementById("novo-endereco");

  if (tipoEndereco === "novo-endereco") {
    divNovoEndereco.style.display = "block";
  } else {
    divNovoEndereco.style.display = "none";
  }
}


function mostrarEnderecoCadastrado() {
  const campoEndereco = document.getElementById("endereco-cadastrado");
  if (clienteSelecionado && clienteSelecionado.endereco) {
    campoEndereco.textContent = clienteSelecionado.endereco;
    campoEndereco.style.display = "block";
  } else {
    campoEndereco.textContent = "Endereço não disponível.";
    campoEndereco.style.display = "block";
  }
}


// Array para armazenar os itens do pedido
let itensPedido = [];

// Referências DOM
const listaItens = document.getElementById('lista-itens');
const formItem = document.getElementById('item-form');

function adicionarItem() {
  // Captura dados do formulário
  const tipoCerveja = document.getElementById('tipo-cerveja').value;
  const embalagem = document.getElementById('embalagem').value;
  const quantidade = parseInt(document.getElementById('quantidade').value);
  const valorUnitario = parseFloat(document.getElementById('valor-unitario').value);
  const codigo = document.getElementById('codigo').value.trim();

  // Validações simples
  if (!tipoCerveja) {
    alert('Selecione o tipo de cerveja.');
    return;
  }
  if (!embalagem) {
    alert('Selecione a embalagem.');
    return;
  }
  if (!quantidade || quantidade <= 0) {
    alert('Informe uma quantidade válida.');
    return;
  }
  if (!valorUnitario || valorUnitario <= 0) {
    alert('Informe um valor unitário válido.');
    return;
  }

  // Cria objeto do item
  const item = {
    tipoCerveja,
    embalagem,
    quantidade,
    valorUnitario,
    codigo
  };

  // Adiciona ao array
  itensPedido.push(item);

  // Atualiza tabela visual
  atualizarListaItens();

  // Limpa formulário
  formItem.reset();
}

function atualizarListaItens() {
  listaItens.innerHTML = '';

  itensPedido.forEach((item, index) => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${capitalize(item.tipoCerveja)}</td>
      <td>${capitalize(item.embalagem)}</td>
      <td>${item.quantidade}</td>
      <td>R$ ${(item.valorUnitario * item.quantidade).toFixed(2)}</td>
      <td>${item.codigo || '-'}</td>
      <td>
        <button class="btn-remover" onclick="removerItem(${index})" title="Remover item">&times;</button>
      </td>
    `;

    listaItens.appendChild(tr);
  });
}

function removerItem(index) {
  itensPedido.splice(index, 1);
  atualizarListaItens();
}

// Função auxiliar para capitalizar texto
function capitalize(texto) {
  if (!texto) return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Cadastro do pedido final
const formPedidoFinal = document.querySelector('.pedidos-form');

formPedidoFinal.addEventListener('submit', function(event) {
  event.preventDefault(); // Evita reload

  if (!clienteSelecionado || inputCliente.value !== `${clienteSelecionado.nome} - ${clienteSelecionado.cpf}`) {
    alert('Selecione um cliente válido antes de enviar o pedido.');
    return;
  }

  if (itensPedido.length === 0) {
    alert('Adicione pelo menos um item ao pedido antes de cadastrar.');
    return;
  }

const tipoEntrega = document.getElementById('tipo-entrega').value;
let enderecoEntrega = '';

if (tipoEntrega === 'entregar') {
  const enderecoSelect = document.getElementById('endereco-select').value;

  if (enderecoSelect === 'novo-endereco') {
    const novoEnderecoInput = document.getElementById('novo-endereco-input');
    enderecoEntrega = novoEnderecoInput?.value.trim();

    if (!enderecoEntrega) {
      alert('Informe o novo endereço para entrega.');
      return;
    }
  } else if (enderecoSelect === 'endereco-cadastrado') {
    if (clienteSelecionado?.endereco) {
      enderecoEntrega = clienteSelecionado.endereco;
    } else {
      alert('Endereço cadastrado não disponível. Selecione um cliente com endereço válido.');
      return;
    }
  } else {
    alert('Selecione a opção de endereço para entrega.');
    return;
  }
}

if (tipoEntrega === 'entregar') {
  enderecoEntrega = enderecoEntrega?.trim();
  if (!enderecoEntrega) {
    alert('Endereço de entrega ausente.');
    return;
  }
} else {
  // Para retirada, não precisa de endereço, então setar vazio
  enderecoEntrega = '';
}

const dataEntrega = document.getElementById('data-entrega').value;

if (!dataEntrega) {
  alert('Informe a data de entrega.');
  return;
}


  const pagamento = document.getElementById('pagamento').value;
  if (!pagamento) {
    alert('Informe a forma de pagamento.');
    return;
  }

  const observacoes = document.getElementById('observacoes').value.trim();

  const codigo = document.getElementById('codigo').value.trim();

  const pedido = {
    clienteId: clienteSelecionado.id,
    clienteNome: clienteSelecionado.nome,
    clienteCpf: clienteSelecionado.cpf,
    tipoEntrega,
    enderecoEntrega,
    dataEntrega,
    pagamento,
    status: 'Aberto',
    observacoes,
    itens: itensPedido,
    dataPedido: new Date().toISOString()
  };

fetch('/api/pedidos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(pedido)
})
.then(async res => {
  if (!res.ok) {
    // Tenta pegar a mensagem do erro no corpo da resposta
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.erro || 'Erro ao enviar pedido');
  }
  return res.json();
})
.then(data => {
  alert(data.mensagem || 'Pedido cadastrado com sucesso!');
  
  formPedidoFinal.reset();
  itensPedido = [];
  atualizarListaItens();
  clienteSelecionado = null;

  const enderecoCadastradoInfo = document.getElementById("endereco-cadastrado-info");
  if (enderecoCadastradoInfo) enderecoCadastradoInfo.textContent = '';

  const enderecoCadastrado = document.getElementById("endereco-cadastrado");
  if (enderecoCadastrado) enderecoCadastrado.style.display = "none";

  const novoEndereco = document.getElementById("novo-endereco");
  if (novoEndereco) novoEndereco.style.display = "none";

  const opcaoEndereco = document.getElementById("opcao-endereco");
  if (opcaoEndereco) opcaoEndereco.style.display = "none";

  carregarPedidos();

})
.catch(err => {
  alert('Falha ao cadastrar pedido: ' + err.message);
});

});

document.addEventListener('DOMContentLoaded', () => {
carregarPedidos();  // chama a função para carregar a tabela assim que a página estiver pronta
}); 

function formatDate(dateStr) {
  // Espera dateStr no formato 'YYYY-MM-DD' (ex: '2025-05-26')
  const [year, month, day] = dateStr.split('-').map(Number);
  // Cria a data no horário local diretamente, sem interpretar fuso
  const date = new Date(year, month - 1, day);
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}`;
}

// Ajuste para o carregamento da lista, para usar apenas Aberto e Concluído
async function carregarPedidos() {
  try {
    const response = await fetch('/api/pedidos');
    if (!response.ok) throw new Error('Erro ao carregar os pedidos');
    const pedidos = await response.json();

    pedidos.sort((a, b) => new Date(b.dataEntrega) - new Date(a.dataEntrega));

    const tbody = document.querySelector('.cervejas-list tbody');
    tbody.innerHTML = '';

    pedidos.forEach(p => {
      const valorTotal = p.itens.reduce((acc, item) => acc + (item.valorUnitario * item.quantidade), 0);
      const produtosDesc = p.itens.map(item => `${capitalize(item.tipoCerveja)} (${capitalize(item.embalagem)}) x${item.quantidade}`).join(', ');
      const quantidadeTotal = p.itens.reduce((acc, item) => acc + item.quantidade, 0);

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
          <span class="payment-badge ${p.pagamento?.toLowerCase().trim() === 'pago' ? 'pago' : 'pendente'}" onclick="editarPagamentoInline(this, ${p.id})"> ${p.pagamento || '-'} </span> 
        </td>
        <td class="actions">
          <button class="btn-action btn-edit" data-id="${p.id}"><i class="fas fa-edit"></i></button>
          <button class="btn-action btn-delete" data-id="${p.id}"><i class="fas fa-trash"></i></button>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (error) {
    alert(error.message);
  }
}

document.addEventListener('click', function(event) {
  if (event.target.closest('.btn-delete')) {
    const id = event.target.closest('.btn-delete').dataset.id;
    excluirPedido(id);
  }
});

document.querySelector('.cervejas-list tbody').addEventListener('click', async (e) => {
  if (e.target.closest('.btn-delete')) {
    const id = e.target.closest('.btn-delete').dataset.id;

    if (confirm('Deseja realmente excluir este pedido?')) {
      try {
        const response = await fetch(`/api/pedidos/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error('Erro ao excluir o pedido');

        alert('Pedido excluído com sucesso!');
        carregarPedidos(); // Atualiza a lista

      } catch (error) {
        alert(error.message);
      }
    }
  }
});

function getStatusClass(status) {
  const s = status.toLowerCase();
  if (s === 'entregue') {
    return 'entregue'; // classe visual para pedidos entregues
  }
  if (s === 'concluído' || s === 'concluido') {
    return 'concluido'; // classe visual para pedidos concluídos
  }
  if (s === 'aberto') {
    return 'aberto'; // classe visual para pedidos em aberto
  }
  return ''; // caso algum status inesperado apareça
}

/* function getStatusClass(status) {
  // Mapeia status para classes visuais — apenas Aberto e Concluído
  if (status.toLowerCase() === 'concluído' || status.toLowerCase() === 'concluido' || status.toLowerCase() === 'entregue' || status.toLowerCase() === 'retirado') {
    return 'entregue';  // pode manter a classe visual 'entregue' para status Concluído
  }
  return 'pronto'; // qualquer outro status será 'Aberto' com classe 'pronto'
} */

// Edição inline do status — só duas opções
function editarStatusInline(element, pedidoId) {
  const statusAtual = element.textContent.trim();
  const select = document.createElement('select');
  const opcoes = ['Aberto', 'Entregue', 'Concluído'];

  opcoes.forEach(opcao => {
    const option = document.createElement('option');
    option.value = opcao;
    option.text = opcao;
    if (opcao.toLowerCase() === statusAtual.toLowerCase()) option.selected = true;
    select.appendChild(option);
  });

  select.className = 'status-badge';
  element.replaceWith(select);
  select.focus();

select.addEventListener('change', () => {
  const novoStatus = select.value;
  atualizarCampoNoBanco(pedidoId, 'status', novoStatus);

  const novoSpan = document.createElement('span');
  novoSpan.className = `status-badge ${getStatusClass(novoStatus)}`;
  novoSpan.textContent = novoStatus;
  novoSpan.onclick = () => editarStatusInline(novoSpan, pedidoId);
  select.replaceWith(novoSpan);
});
}

function editarPagamentoInline(elemento, pedidoId) {
  const opcoes = ['Pendente', 'Pago'];

  // Cria o select com as opções, setando o valor atual
  const select = document.createElement('select');
  opcoes.forEach(opcao => {
    const option = document.createElement('option');
    option.value = opcao;
    option.textContent = opcao;
    if (opcao.toLowerCase() === elemento.textContent.trim().toLowerCase()) {
      option.selected = true;
    }
    select.appendChild(option);
  });

  // Substitui o span pelo select
  elemento.replaceWith(select);

  // Quando mudar o valor ou sair do select, atualiza e volta para span
  select.addEventListener('change', async () => {
    await atualizarPagamento(pedidoId, select.value);
    voltarParaSpanPagamento(select, select.value, pedidoId);
  });

  select.addEventListener('blur', () => {
    voltarParaSpanPagamento(select, select.value, pedidoId);
  });

  // Foca no select para o usuário já poder escolher
  select.focus();
}

function voltarParaSpanPagamento(select, valor, pedidoId) {
  const span = document.createElement('span');
  span.className = 'payment-badge ' + (valor.toLowerCase() === 'pago' ? 'pago' : 'pendente');
  span.textContent = valor;
  span.setAttribute('onclick', `editarPagamentoInline(this, ${pedidoId})`);
  select.replaceWith(span);
}


async function atualizarCampoNoBanco(pedidoId, campo, novoValor) {
  try {
    const response = await fetch(`/api/pedidos/${pedidoId}`, {
      method: 'PUT', // ou PATCH, conforme seu backend
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ [campo]: novoValor })
    });

    if (!response.ok) throw new Error('Erro ao atualizar pedido');

    carregarPedidosAtivos();
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}

async function atualizarPagamento(pedidoId, novoStatusPagamento) {
  return await atualizarCampoNoBanco(pedidoId, 'pagamento', novoStatusPagamento);
}

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('pesquisaPedidos');

  input.addEventListener('input', () => {
    const termo = input.value.toLowerCase();
    const linhas = document.querySelectorAll('.cervejas-list tbody tr');

    linhas.forEach(linha => {
      const textoLinha = linha.textContent.toLowerCase();
      linha.style.display = textoLinha.includes(termo) ? '' : 'none';
    });
  });
});

function atualizarQuantidade() {
  const embalagem = document.getElementById("embalagem").value;
  const container = document.getElementById("quantidade-container");

  // Limpa o conteúdo atual
  container.innerHTML = '<label for="quantidade">Quantidade (L)</label>';

  if (embalagem === "barril") {
    // Cria o select com as opções específicas para barril
    const select = document.createElement("select");
    select.id = "quantidade";
    select.name = "quantidade";
    select.required = true;

    const opcoes = [10, 15, 20, 30, 50];
    opcoes.forEach(function (valor) {
      const option = document.createElement("option");
      option.value = valor;
      option.textContent = valor + " L";
      select.appendChild(option);
    });

    container.appendChild(select);
  } else {
    // Cria o input tipo number padrão para PET
    const input = document.createElement("input");
    input.type = "number";
    input.id = "quantidade";
    input.name = "quantidade";
    input.min = "1";
    input.required = true;

    container.appendChild(input);
  }
}
