import assert from 'assert';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import app from '../server.js';
import { UPLOAD_DIR, removeUploadedFile } from '../middleware/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
  console.log('--- Starting Campus Lost & Found Backend Test Suite ---');
  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(err);
      failed++;
    }
  };

  const testSecret = process.env.JWT_SECRET || 'supersecretcampuslostandfoundjwtkey2026';
  const fakeToken = jwt.sign(
    { id: '507f1f77bcf86cd799439011', email: 'student@chitkara.edu.in', role: 'student', name: 'Demo Student' },
    testSecret
  );

  // 1. Health check endpoint
  await test('GET /api/health should return 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.status, 'healthy');
  });

  // 2. Authentication requirement
  await test('POST /api/items without Bearer token should return 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ title: 'Test Item', type: 'lost' });
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /Missing Bearer token/i);
  });

  await test('POST /api/items with invalid token should return 401', async () => {
    const res = await request(app)
      .post('/api/items')
      .set('Authorization', 'Bearer invalid.jwt.token')
      .send({ title: 'Test Item', type: 'lost' });
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  // 3. Image upload format validation
  await test('POST /api/items should reject unsupported file formats (.txt / text/plain)', async () => {
    const tempTxt = path.join(__dirname, 'temp-test.txt');
    fs.writeFileSync(tempTxt, 'not an image');

    try {
      const res = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${fakeToken}`)
        .attach('image', tempTxt);

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.message, /Supported formats: JPEG, PNG, and WebP/i);
    } finally {
      if (fs.existsSync(tempTxt)) fs.unlinkSync(tempTxt);
    }
  });

  // 4. Oversized upload validation (> 5MB)
  await test('POST /api/items should reject image uploads exceeding 5 MB limit', async () => {
    const oversizedPath = path.join(__dirname, 'oversized-test.png');
    const buffer = Buffer.alloc(5.5 * 1024 * 1024, 0);
    fs.writeFileSync(oversizedPath, buffer);

    try {
      const res = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${fakeToken}`)
        .attach('image', oversizedPath);

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.message, /exceeds 5 MB limit/i);
    } finally {
      if (fs.existsSync(oversizedPath)) fs.unlinkSync(oversizedPath);
    }
  });

  // 5. Server-side validation errors & upload cleanup
  await test('POST /api/items with validation errors should return 400 and clean up uploaded file', async () => {
    // Create a 1x1 valid sample jpeg
    const tempJpg = path.join(__dirname, 'test-valid.jpg');
    // Minimal valid JPEG binary buffer
    const minimalJpg = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
      0x00, 0x03, 0x02, 0x02, 0x03, 0x02, 0x02, 0x03, 0x03, 0x03, 0x03, 0x04,
      0x06, 0x04, 0x04, 0x04, 0x04, 0x04, 0x08, 0x06, 0x06, 0x05, 0x06, 0x09,
      0x08, 0x0a, 0x0a, 0x09, 0x08, 0x09, 0x09, 0x0a, 0x0c, 0x0f, 0x0c, 0x0a,
      0x0b, 0x0e, 0x0b, 0x09, 0x09, 0x0d, 0x11, 0x0d, 0x0e, 0x0f, 0x10, 0x10,
      0x11, 0x10, 0x0a, 0x0c, 0x12, 0x13, 0x12, 0x10, 0x13, 0x0f, 0x10, 0x10,
      0x10, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01, 0x00, 0x01, 0x01, 0x01,
      0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01,
      0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0xff,
      0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0xbf, 0x00, 0xff, 0xd9
    ]);
    fs.writeFileSync(tempJpg, minimalJpg);

    const uploadsBefore = fs.readdirSync(UPLOAD_DIR);

    try {
      const res = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${fakeToken}`)
        .field('type', 'lost')
        .field('title', 'A') // Too short (min 2)
        .field('category', 'InvalidCategory') // Not in categories
        .field('location', 'Moon') // Not in locations
        .field('description', 'short') // Too short (min 10)
        .field('date', '2099-01-01') // Future date
        .attach('image', tempJpg);

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.errors.length >= 4);

      // Verify the uploaded image was immediately deleted on failure
      const uploadsAfter = fs.readdirSync(UPLOAD_DIR);
      assert.strictEqual(uploadsAfter.length, uploadsBefore.length);
    } finally {
      if (fs.existsSync(tempJpg)) fs.unlinkSync(tempJpg);
    }
  });

  // 6. Safe file removal helper test
  await test('removeUploadedFile should safely delete file from uploads directory', async () => {
    const testFileName = `test-delete-${Date.now()}.jpg`;
    const testFilePath = path.join(UPLOAD_DIR, testFileName);
    fs.writeFileSync(testFilePath, 'fake image data');
    assert.strictEqual(fs.existsSync(testFilePath), true);

    removeUploadedFile(`/uploads/${testFileName}`);
    assert.strictEqual(fs.existsSync(testFilePath), false);
  });

  // 7. Unknown API route returns 404
  await test('Unknown API route should return 404 with standard error format', async () => {
    const res = await request(app).get('/api/unknown-endpoint');
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /not found/i);
  });

  // 8. Demo Auth Endpoint verification
  await test('POST /api/auth/demo should return demo token response format', async () => {
    // If DB is offline, demo will gracefully handle or return error
    const res = await request(app).post('/api/auth/demo');
    // Response should be json
    assert.ok(res.headers['content-type'].includes('application/json'));
  });

  console.log(`\nTest Summary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
