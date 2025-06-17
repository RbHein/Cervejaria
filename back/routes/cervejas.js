const express = require('express');
const router = express.Router();
const db = require('../config/firebase'); // note que não é { db }

const cervejasCollection = db.collection('cervejas');

router.get('/', async (req, res) => {
  try {
    const snapshot = await cervejasCollection.get();
    const cervejas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(cervejas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao ler as cervejas' });
  }
});

router.post('/', async (req, res) => {
  try {
    const nova = req.body;
    const docRef = await cervejasCollection.add(nova);
    res.status(201).json({ id: docRef.id, ...nova });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao salvar a cerveja' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await cervejasCollection.doc(id).delete();
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao excluir a cerveja' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const dadosAtualizados = req.body;

    const cervejaRef = cervejasCollection.doc(id);
    const doc = await cervejaRef.get();

    if (!doc.exists) {
      return res.status(404).json({ erro: 'Cerveja não encontrada' });
    }

    await cervejaRef.update(dadosAtualizados);

    res.status(200).json({ id, ...dadosAtualizados });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar a cerveja' });
  }
});

module.exports = router;
