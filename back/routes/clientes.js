const express = require('express');
const router = express.Router();
const db = require('../config/firebase'); // conexão com o Firestore

const clientesCollection = db.collection('clientes');

// GET todos os clientes ou por filtro
router.get('/', async (req, res) => {
  try {
    const snapshot = await clientesCollection.get();
    let clientes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const { nome, cpf } = req.query;

    if (nome) {
      clientes = clientes.filter(c =>
        c.nome?.toLowerCase().includes(nome.toLowerCase())
      );
    }

    if (cpf) {
      clientes = clientes.filter(c =>
        c.cpf?.replace(/\D/g, '') === cpf.replace(/\D/g, '')
      );
    }

    res.json(clientes.slice(0, 10)); // sugestão limitada
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar clientes' });
  }
});

// POST novo cliente
router.post('/', async (req, res) => {
  try {
    const novoCliente = req.body;
    const docRef = await clientesCollection.add(novoCliente);
    res.status(201).json({ id: docRef.id, ...novoCliente });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao salvar cliente' });
  }
});

// DELETE cliente por ID
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await clientesCollection.doc(id).delete();
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao excluir cliente' });
  }
});

module.exports = router;
