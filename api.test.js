const request = require('supertest');
const { app, resetTasks } = require('./app');

describe('Task Tracker API', () => {
  beforeEach(() => {
    resetTasks();
  });

  test('GET /health returns status ok', async () => {
    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('GET /tasks returns initial list of tasks', async () => {
    const res = await request(app).get('/tasks');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
  });

  test('POST /tasks creates a new task', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Настроить CI' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({
      id: 3,
      title: 'Настроить CI',
      done: false
    });
  });
});
