const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Rotas da API
const cervejasRoutes = require('./routes/cervejas');
const pedidosRoutes = require('./routes/pedidos');
const clientesRoutes = require('./routes/clientes');

app.use(cors());
app.use(express.json());

app.use('/api/cervejas', cervejasRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/pedidos', pedidosRoutes);

// 🧠 Servir arquivos estáticos do frontend
const frontPath = path.join(__dirname, 'front');
app.use(express.static(frontPath));

// ✅ Evita que rotas da API sejam tratadas como rotas de frontend
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(frontPath, 'index.html'));
});

// ✅ Porta dinâmica para Railway
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🍺 Backend rodando em http://localhost:${PORT} 🍻`);
});
