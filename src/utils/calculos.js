function somar(a, b) {
  return a + b;
}

function calcularPercentual(parte, total) {
  if (Number.isNaN(parte) || Number.isNaN(total)) {
    throw new Error('Parâmetros parte e total devem ser números');
  }
  if (total === 0) {
    throw new Error('O total não pode ser zero');
  }
  return Number(((parte / total) * 100).toFixed(2));
}

module.exports = { somar, calcularPercentual };
