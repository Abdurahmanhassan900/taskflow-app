const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://taskuser:taskpass@localhost:5432/taskdb';
process.env.JWT_SECRET = 'test_access_secret_at_least_32_characters_long';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_32_characters';

const app = require('../index');

const uniqueEmail = () => `user-${Date.now()}-${Math.random().toString(36).slice(2)}@taskflow.test`;

async function registerAndLogin(email = uniqueEmail()) {
  const password = 'Password1!';
  const agent = request.agent(app);

  const registered = await agent
    .post('/api/v1/auth/register')
    .send({ fullName: 'Test User', email, password });

  assert.equal(registered.status, 201);

  return {
    agent,
    email,
    password,
    token: registered.body.accessToken,
    user: registered.body.user,
  };
}

test('POST /api/v1/auth/register creates a user and returns an access token', async () => {
  const email = uniqueEmail();

  const response = await request(app)
    .post('/api/v1/auth/register')
    .send({ fullName: 'Auth Test User', email, password: 'Password1!' })
    .expect(201);

  assert.equal(typeof response.body.accessToken, 'string');
  assert.equal(response.body.user.email, email);
  assert.equal(response.body.user.passwordHash, undefined);
  assert.ok(response.headers['x-request-id']);
});

test('POST /api/v1/auth/login rejects invalid credentials', async () => {
  await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'missing@taskflow.test', password: 'wrong-password' })
    .expect(401);
});

test('GET /api/v1/tasks requires authentication', async () => {
  await request(app).get('/api/v1/tasks').expect(401);
});

test('Task CRUD is scoped to the authenticated user (IDOR protection)', async () => {
  const userA = await registerAndLogin();
  const userB = await registerAndLogin();

  const created = await userA.agent
    .post('/api/v1/tasks')
    .set('Authorization', `Bearer ${userA.token}`)
    .send({ title: 'Private task', description: 'Only user A' })
    .expect(201);

  const taskId = created.body.id;

  await userB.agent
    .get(`/api/v1/tasks/${taskId}`)
    .set('Authorization', `Bearer ${userB.token}`)
    .expect(404);

  const listB = await userB.agent
    .get('/api/v1/tasks')
    .set('Authorization', `Bearer ${userB.token}`)
    .expect(200);

  assert.equal(listB.body.length, 0);
});

test('Soft delete hides tasks from list', async () => {
  const { agent, token } = await registerAndLogin();

  const created = await agent
    .post('/api/v1/tasks')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Temporary task' })
    .expect(201);

  await agent
    .delete(`/api/v1/tasks/${created.body.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  const list = await agent
    .get('/api/v1/tasks')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.equal(list.body.length, 0);
});

test('Admin role change is forbidden for members', async () => {
  const member = await registerAndLogin();
  const other = await registerAndLogin();

  await member.agent
    .put(`/api/v1/admin/users/${other.user.id}/role`)
    .set('Authorization', `Bearer ${member.token}`)
    .send({ role: 'ADMIN' })
    .expect(403);
});

test('PUT /api/v1/auth/password updates password', async () => {
  const email = uniqueEmail();
  const oldPassword = 'Password1!';
  const newPassword = 'NewPassword2!';

  const { agent, token } = await registerAndLogin(email);

  await agent
    .put('/api/v1/auth/password')
    .set('Authorization', `Bearer ${token}`)
    .send({ currentPassword: oldPassword, newPassword })
    .expect(200);

  await agent
    .post('/api/v1/auth/login')
    .send({ email, password: oldPassword })
    .expect(401);

  await agent
    .post('/api/v1/auth/login')
    .send({ email, password: newPassword })
    .expect(200);
});
