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
  const response = await request(app)
    .post('/api/v1/auth/register')
    .send({ fullName: 'Security Test User', email, password });

  assert.equal(response.status, 201);
  return { email, password, token: response.body.accessToken, user: response.body.user };
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

test('admin endpoints reject members and allow admins', async () => {
  const member = await registerUser();
  const target = await registerUser();

  await request(app)
    .get('/api/v1/admin/users')
    .set('Authorization', `Bearer ${member.token}`)
    .expect(403);

  await prisma.user.update({
    where: { id: member.user.id },
    data: { role: 'ADMIN' },
  });

  const login = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: member.email, password: member.password })
    .expect(200);

  const adminToken = login.body.accessToken;

  await request(app)
    .get('/api/v1/admin/users')
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200);

  await request(app)
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
