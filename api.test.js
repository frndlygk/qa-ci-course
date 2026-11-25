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

  test('POST /tasks does not create task wit empty title', async()=> {
    const res = await request(app)
      .post('/tasks')
      .send({title: '    '});

    expect(res.statusCode).toBe(400);
    expect(res.body.hasOwnProperty('error')).toBe(true);
  })

  test('PATCH /tasks/1/done changes existing task', async() => {
    const res = await request(app)
    .patch('/tasks/1/done')

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      id: 1,
      done: true
    });
  });

  test('PATCH /tasks/999/done fails to change a non existing task', async() => {
    const res = await request(app)
     .patch('/tasks/999/done');

     expect(res.statusCode).toBe(404);
  });

  test('DELETE /tasks/1 deletes existing task', async() => {
    const res = await request(app)
     .delete('/tasks/1');

    expect(res.statusCode).toBe(204);

    const recheck = await request(app)
      .get('/tasks');

    expect(recheck.statusCode).toBe(200);
    expect(recheck.body).toHaveLength(1);
  })

  test('DELETE /tasks/999 does not delete a non existing task', async() => {
    const res = await request(app)
     .delete('/tasks/999');

     expect(res.statusCode).toBe(404);
  })
});
