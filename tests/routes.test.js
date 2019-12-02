import app from '../api/index';
import chai from 'chai';
import chaiHttp from 'chai-http';
import models from '../database/models';
import { expect } from 'chai';


chai.use(chaiHttp);

describe('ROUTE TESTING', () => {
    before(() => {
        models.user.destroy({where: {}}, {truncate: true});
    });
    
    describe('POST /api/admin/signup', () => {
        it('should create a new admin user account', (done) => {
            chai.request(app)
            .post('/api/admin/signup')
            .send({name: 'Ifenna', email: 'Ifenna@gmail.com', password: 'admin', isAdmin: true})
            .end((err, res) => {
                expect(200).to.be.equal(res.status);
                expect('Account created').to.be.equal(res.body.message);
                done();
            });
        });
    });

    describe('POST /api/admin/login', () => {

        it('should login as an admin user', (done) => {
            chai.request(app)
            .post('/api/admin/login')
            .send({ email: 'Ifenna@gmail.com', password: 'admin' })
            .end((err, res) => {
                expect(200).to.be.equal(res.status);
                done();
            });
        });

        it('should not be able to login with wrong password', (done) => {
            chai.request(app)
            .post('/api/admin/login')
            .send({ email: 'Ifenna@gmail.com', password: 'admine' })
            .end((err, res) => {
                expect(400).to.be.equal(res.status);
                expect('Invalid Password').to.be.equal(res.body.message);
                done();
            });
        });

        it('should not be able to login with wrong admin email', (done) => {
            chai.request(app)
            .post('/api/admin/login')
            .send({ email: 'Ifennam@gmail.com', password: 'admine' })
            .end((err, res) => {
                expect(404).to.be.equal(res.status);
                expect('User not found').to.be.equal(res.body.message);
                done();
            });
        });
    });
});