const request = require('supertest');
const { app, resetTasks } = require('./app');

const BASE_URL = process.env.BASE_URL;
const TEST_TIMEOUT = Number(process.env.TEST_TIMEOUT) || 5000;
const target = BASE_URL || app;
jest.setTimeout(TEST_TIMEOUT);

describe('Task Tracker API', () => {
  beforeEach(async () => {
    if (BASE_URL) {
      const res = await request(target).post('/reset');
      expect(res.statusCode).toBe(204);
    }
    else {
      resetTasks();
    }
  });

  test('GET /health returns status ok', async () => {
    const res = await request(target).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok', env: expect.any(String)});
  });

  test('GET /tasks returns initial list of tasks', async () => {
    const res = await request(target).get('/tasks');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
  });

  test('POST /tasks creates a new task', async () => {
    const res = await request(target)
      .post('/tasks')
      .send({ title: 'Настроить CI' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({
      id: 3,
      title: 'Настроить CI',
      done: false
    });
  });

  test('POST /tasks does not create task wit empty title', async()=> {
    const res = await request(target)
      .post('/tasks')
      .send({title: '    '});

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({"error": expect.any(String)});
  });

  test('PATCH /tasks/1/done changes existing task', async() => {
    const res = await request(target)
    .patch('/tasks/1/done');

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      id: 1,
      done: true
    });
  });

  test('PATCH /tasks/999/done fails to change a non existing task', async() => {
    const res = await request(target)
     .patch('/tasks/999/done');

     expect(res.statusCode).toBe(404);
  });

  test('DELETE /tasks/1 deletes existing task', async() => {
    const res = await request(target)
     .delete('/tasks/1');

    expect(res.statusCode).toBe(204);

    const recheck = await request(target)
      .get('/tasks');

    expect(recheck.statusCode).toBe(200);
    expect(recheck.body).toHaveLength(1);
  });

  test('DELETE /tasks/999 does not delete a non existing task', async() => {
    const res = await request(target)
     .delete('/tasks/999');

     expect(res.statusCode).toBe(404);
  });

  test('GET /tasks/stats check stats before completing stats', async() => {
    const res = await request(target).get('/tasks/stats');
    const expectedRes = {total: 2, completed: 0, pending: 2};
    expect(res.body).toMatchObject(expectedRes);
  });

  test('GET /tasks/stats check stats after completing stats', async() => {
    const res = await request(target).patch('/tasks/1/done');
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ 
      id: 1,
      done: true
    });
    const chekStats = await request(target).get('/tasks/stats');
    const expectedRes = {total: 2, completed: 1, pending: 1};
    expect(chekStats.body).toMatchObject(expectedRes);
  });
});
