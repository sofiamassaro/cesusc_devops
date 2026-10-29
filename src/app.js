const express = require('express');
const path = require('path');
const { somar, calcularPercentual } = require('./utils/calculos');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Página inicial (altere o index.html para testar o deploy automático)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Health check: usado para confirmar que o container subiu
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', versao: process.env.APP_VERSION || 'dev' });
});

// Rota de exemplo que usa as funções testadas nos testes de unidade
app.get('/api/soma', (req, res) => {
  const a = Number(req.query.a);
  const b = Number(req.query.b);

  if (Number.isNaN(a) || Number.isNaN(b)) {
    return res.status(400).json({ erro: 'Parâmetros a e b devem ser números' });
  }

  return res.json({ resultado: somar(a, b) });
});

app.get('/api/percentual', (req, res) => {
  try {
    const parte = Number(req.query.parte);
    const total = Number(req.query.total);
    return res.json({ resultado: calcularPercentual(parte, total) });
  } catch (erro) {
    return res.status(400).json({ erro: erro.message });
  }
});

// Só sobe o servidor quando o arquivo é executado diretamente (node src/app.js).
// Quando o Jest importa o app, o servidor não é iniciado.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

module.exports = app;
