// Testes de integração: validam as rotas HTTP com o app inteiro
const request = require('supertest');
const app = require('../src/app');

describe('Rotas da aplicação', () => {
  test('GET / retorna a página inicial', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Projeto DevOps');
  });

  test('GET /health retorna status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('GET /api/soma soma os parâmetros', async () => {
    const res = await request(app).get('/api/soma?a=4&b=6');
    expect(res.statusCode).toBe(200);
    expect(res.body.resultado).toBe(10);
  });

  test('GET /api/soma retorna 400 com parâmetro inválido', async () => {
    const res = await request(app).get('/api/soma?a=x&b=6');
    expect(res.statusCode).toBe(400);
  });

  test('GET /api/percentual calcula o percentual', async () => {
    const res = await request(app).get('/api/percentual?parte=50&total=200');
    expect(res.statusCode).toBe(200);
    expect(res.body.resultado).toBe(25);
  });

  test('GET /api/percentual retorna 400 com total zero', async () => {
    const res = await request(app).get('/api/percentual?parte=5&total=0');
    expect(res.statusCode).toBe(400);
  });
});
