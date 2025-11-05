const request = require('supertest');
const app = require('../server');

describe('SQL Injection Tests', () => {

    test('should block SQL injection in login', async () => {
        const response = await request(app)
            .post('/rest/user/login')
            .send({
                email: "' OR 1=1 --",
                password: 'test'
            });

        expect(response.status).toBe(401);
    });
});