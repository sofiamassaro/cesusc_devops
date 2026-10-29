// Testes de unidade: validam funções isoladas
const { somar, calcularPercentual } = require('../src/utils/calculos');

describe('somar', () => {
  test('soma dois números positivos', () => {
    expect(somar(2, 3)).toBe(5);
  });

  test('soma números negativos', () => {
    expect(somar(-2, -3)).toBe(-5);
  });
});

describe('calcularPercentual', () => {
  test('calcula o percentual corretamente', () => {
    expect(calcularPercentual(25, 200)).toBe(12.5);
  });

  test('lança erro quando o total é zero', () => {
    expect(() => calcularPercentual(10, 0)).toThrow('O total não pode ser zero');
  });

  test('lança erro quando recebe valor não numérico', () => {
    expect(() => calcularPercentual(NaN, 10)).toThrow();
  });
});
