import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

test('bcrypt hashes and verifies password correctly', async () => {
  const password = 'StrongPassword123!';
  const hash = await bcrypt.hash(password, 10);
  assert.notEqual(hash, password);

  const isMatch = await bcrypt.compare(password, hash);
  assert.equal(isMatch, true);

  const isWrong = await bcrypt.compare('WrongPassword', hash);
  assert.equal(isWrong, false);
});

test('jwt signs and verifies payload properly', () => {
  const secret = 'test-jwt-secret';
  const payload = { userId: 'user-123', email: 'athlete@irontrack.app' };

  const token = jwt.sign(payload, secret, { expiresIn: '1h' });
  assert.ok(token);

  const decoded = jwt.verify(token, secret) as { userId: string; email: string };
  assert.equal(decoded.userId, 'user-123');
  assert.equal(decoded.email, 'athlete@irontrack.app');
});
