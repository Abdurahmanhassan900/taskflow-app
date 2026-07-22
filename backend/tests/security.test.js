const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { prisma } = require('../lib/prisma');

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://taskuser:taskpass@localhost:5432/taskdb';
process.env.JWT_SECRET = 'test_access_secret_at_least_32_characters_long';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_32_characters';

const app = require('../index');

const uniqueEmail = () => `sec-${Date.now()}-${Math.random().toString(36).slice(2)}@taskflow.test`;

async function registerUser(email = uniqueEmail()) {
  const password = 'Password1!';
  const agent = request.agent(app);
  const response = await agent
    .post('/api/v1/auth/register')
    .send({ fullName: 'Security Test User', email, password });

  assert.equal(response.status, 201);
  return {
    agent,
    email,
    password,
    token: response.body.accessToken,
    user: response.body.user,
  };
}

test('rejects requests with an invalid Bearer token', async () => {
  await request(app)
    .get('/api/v1/tasks')
    .set('Authorization', 'Bearer not-a-valid-jwt')
    .expect(401);
});

test('rejects refresh without a refresh cookie', async () => {
  await request(app).post('/api/v1/auth/refresh').expect(401);
});

test('rejects register input that fails Zod validation', async () => {
  const response = await request(app)
    .post('/api/v1/auth/register')
    .send({ fullName: '', email: 'not-an-email', password: 'short' })
    .expect(400);

  assert.match(response.body.error.message, /email|password|fullName/i);
});

test('never returns passwordHash in auth responses', async () => {
  const { token } = await registerUser();

  const tasks = await request(app)
    .get('/api/v1/tasks')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.equal(JSON.stringify(tasks.body).includes('passwordHash'), false);
});

test('valid refresh cookie returns a new access token without rotation', async () => {
  const { agent, token: originalToken } = await registerUser();

  const refreshResponse = await agent.post('/api/v1/auth/refresh').expect(200);

  assert.equal(typeof refreshResponse.body.accessToken, 'string');
  assert.notEqual(refreshResponse.body.accessToken, '');
  assert.deepEqual(Object.keys(refreshResponse.body), ['accessToken']);
  assert.equal(refreshResponse.headers['set-cookie'], undefined);

  const tasks = await agent
    .get('/api/v1/tasks')
    .set('Authorization', `Bearer ${refreshResponse.body.accessToken}`)
    .expect(200);

  assert.ok(Array.isArray(tasks.body));

  await agent
    .get('/api/v1/tasks')
    .set('Authorization', `Bearer ${originalToken}`)
    .expect(200);
});

test('logout clears the refresh cookie', async () => {
  const { agent } = await registerUser();

  const logoutResponse = await agent.post('/api/v1/auth/logout').expect(200);

  const setCookie = logoutResponse.headers['set-cookie'];
  assert.ok(setCookie);
  assert.ok(
    setCookie.some((cookie) => cookie.includes('refreshToken=') && /Max-Age=0|Expires=/i.test(cookie)),
  );

  await agent.post('/api/v1/auth/refresh').expect(401);
});

test('cross-user update returns 404 and does not change the task', async () => {
  const userA = await registerUser();
  const userB = await registerUser();

  const created = await userA.agent
    .post('/api/v1/tasks')
    .set('Authorization', `Bearer ${userA.token}`)
    .send({ title: 'Owned by A', description: 'Original' })
    .expect(201);

  const taskId = created.body.id;
  const before = await prisma.task.findUnique({ where: { id: taskId } });

  await userB.agent
    .put(`/api/v1/tasks/${taskId}`)
    .set('Authorization', `Bearer ${userB.token}`)
    .send({ title: 'Stolen title' })
    .expect(404);

  const after = await prisma.task.findUnique({ where: { id: taskId } });
  assert.equal(after.title, before.title);
  assert.equal(after.description, before.description);
  assert.equal(after.deletedAt, null);
});

test('cross-user delete returns 404 and does not soft-delete the task', async () => {
  const userA = await registerUser();
  const userB = await registerUser();

  const created = await userA.agent
    .post('/api/v1/tasks')
    .set('Authorization', `Bearer ${userA.token}`)
    .send({ title: 'Protected task' })
    .expect(201);

  const taskId = created.body.id;

  await userB.agent
    .delete(`/api/v1/tasks/${taskId}`)
    .set('Authorization', `Bearer ${userB.token}`)
    .expect(404);

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  assert.equal(task.deletedAt, null);
});

test('admin endpoints reject members and allow admins', async () => {
  const member = await registerUser();
  const target = await registerUser();

  await member.agent
    .get('/api/v1/admin/users')
    .set('Authorization', `Bearer ${member.token}`)
    .expect(403);

  await prisma.user.update({
    where: { id: member.user.id },
    data: { role: 'ADMIN' },
  });

  const login = await member.agent
    .post('/api/v1/auth/login')
    .send({ email: member.email, password: member.password })
    .expect(200);

  const adminToken = login.body.accessToken;

  await member.agent
    .get('/api/v1/admin/users')
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200);

  await member.agent
    .put(`/api/v1/admin/users/${target.user.id}/role`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ role: 'ADMIN' })
    .expect(200);
});

test('server errors do not return stack traces to clients', async () => {
  const originalFindMany = prisma.task.findMany;
  prisma.task.findMany = async () => {
    throw new Error('simulated database failure');
  };

  try {
    const { token } = await registerUser();
    const response = await request(app)
      .get('/api/v1/tasks')
      .set('Authorization', `Bearer ${token}`)
      .expect(500);

    assert.equal(response.body.error.message, 'Internal server error');
    assert.equal(response.body.error.stack, undefined);
    assert.equal(String(response.text).includes('simulated database failure'), false);
  } finally {
    prisma.task.findMany = originalFindMany;
  }
});
