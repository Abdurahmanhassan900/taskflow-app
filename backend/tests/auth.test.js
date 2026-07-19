const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://taskuser:taskpass@localhost:5432/taskdb';
process.env.JWT_SECRET = 'test_access_secret_at_least_32_characters_long';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_32_characters';

const app = require('../index');

const uniqueEmail = () => `user-${Date.now()}@taskflow.test`;

test('POST /api/v1/auth/register creates a user and returns an access token', async () => {
  const email = uniqueEmail();

  const response = await request(app)
    .post('/api/v1/auth/register')
    .send({
      fullName: 'Auth Test User',
      email,
      password: 'Password1!',
    })
    .expect(201);

  assert.equal(typeof response.body.accessToken, 'string');
  assert.equal(response.body.user.email, email);
  assert.equal(response.body.user.role, 'MEMBER');
  assert.equal(response.body.user.passwordHash, undefined);
});

test('POST /api/v1/auth/login rejects invalid credentials', async () => {
  await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: 'missing@taskflow.test',
      password: 'wrong-password',
    })
    .expect(401);
});

test('POST /api/v1/auth/login succeeds for a registered user', async () => {
  const email = uniqueEmail();
  const password = 'Password1!';

  await request(app)
    .post('/api/v1/auth/register')
    .send({
      fullName: 'Login Test User',
      email,
      password,
    })
    .expect(201);

  const response = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password })
    .expect(200);

  assert.equal(typeof response.body.accessToken, 'string');
  assert.equal(response.body.user.email, email);
});

test('POST /api/v1/auth/refresh returns a new access token from cookie', async () => {
  const email = uniqueEmail();
  const password = 'Password1!';

  const agent = request.agent(app);

  await agent
    .post('/api/v1/auth/register')
    .send({
      fullName: 'Refresh Test User',
      email,
      password,
    })
    .expect(201);

  const refreshResponse = await agent
    .post('/api/v1/auth/refresh')
    .expect(200);

  assert.equal(typeof refreshResponse.body.accessToken, 'string');
});
