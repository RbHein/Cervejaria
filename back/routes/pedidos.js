const express = require('express');
const router = express.Router();
const db = require('../config/firebase'); // seu setup do Firebase

const pedidosCollection = db.collection('pedidos');

// POST novo pedido
router.post('/', async (req, res) => {
  try {
    // Usar Firestore para gerar ID, mas manter o id numérico para compatibilidade
    // Pode salvar timestamp como id, ou deixar Firestore gerar id
    const novoPedido = { ...req.body, id: Date.now() }; // mantem seu id numérico

    await pedidosCollection.doc(String(novoPedido.id)).set(novoPedido);

    console.log('Pedido salvo:', novoPedido);
    res.status(201).json({ mensagem: 'Pedido cadastrado com sucesso!' });
  } catch (err) {
    console.error('Erro ao salvar pedido:', err);
    res.status(500).json({ erro: 'Erro ao salvar pedido' });
  }
});

// GET todos os pedidos
router.get('/', async (req, res) => {
  try {
    const snapshot = await pedidosCollection.get();
    const pedidos = snapshot.docs.map(doc => doc.data());
    res.json(pedidos);
  } catch (err) {
    console.error('Erro ao ler pedidos:', err);
    res.status(500).json({ erro: 'Erro ao ler pedidos' });
  }
});

// DELETE pedido por ID
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await pedidosCollection.doc(id).delete();
    res.status(204).end();
  } catch (err) {
    console.error('Erro ao excluir pedido:', err);
    res.status(500).json({ erro: 'Erro ao excluir pedido' });
  }
});

// PUT para atualizar pedido por ID (atualiza campos específicos)
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const camposParaAtualizar = req.body;

    const docRef = pedidosCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }

    // Atualiza os campos (merge = true para atualizar só os campos enviados)
    await docRef.set(camposParaAtualizar, { merge: true });

    const pedidoAtualizado = await docRef.get();
    res.json(pedidoAtualizado.data());
  } catch (err) {
    console.error('Erro ao atualizar pedido:', err);
    res.status(500).json({ erro: 'Erro ao atualizar pedido' });
  }
});

module.exports = router;
