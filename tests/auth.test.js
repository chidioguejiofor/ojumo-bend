import { format } from 'util';
import chai, { expect } from 'chai';
import { it, before, describe } from 'mocha';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import app from '../api/server';
import { User } from '../database/models';
import { IS_NOT_EMAIL, USER_NOT_FOUND } from '~/api/utils/constants';
import mailSender from '../api/helper/Handlebars';

chai.use(chaiHttp);

describe('ROUTE TESTING', () => {
  before(done => {
    User.destroy({ where: {} }, { truncate: true });
    done();
  });

  describe('POST /api/admin/signup', () => {
    it('should create a new admin user account', done => {
      chai
        .request(app)
        .post('/api/admin/signup')
        .send({
          name: 'Ifenna',
          email: 'Ifenna@gmail.com',
          password: 'password',
          isAdmin: true
        })
        .end((err, res) => {
          expect(201).to.be.equal(res.status);
          expect('Account created').to.be.equal(res.body.message);
          done();
        });
    });
  });
  describe('POST /api/admin/login', () => {
    it('should login as an admin user', done => {
      chai
        .request(app)
        .post('/api/admin/login')
        .send({ email: 'Ifenna@gmail.com', password: 'password' })
        .end((err, res) => {
          expect(200).to.be.equal(res.status);
          done();
        });
    });

    it('should not be able to login with wrong password', done => {
      chai
        .request(app)
        .post('/api/admin/login')
        .send({ email: 'Ifenna@gmail.com', password: 'password101' })
        .end((err, res) => {
          expect('Invalid Password').to.be.equal(res.body.message);
          expect(400).to.be.equal(res.status);
          done();
        });
    });

    it('should not be able to login with wrong admin email', done => {
      chai
        .request(app)
        .post('/api/admin/login')
        .send({ email: 'Ifennam@gmail.com', password: 'password1234' })
        .end((err, res) => {
          expect('User not found').to.be.equal(res.body.message);
          expect(404).to.be.equal(res.status);

          done();
        });
    });
  });
  describe('POST /api/admin/forgot-password', () => {
    // const sandbox = sinon.createSandbox();

    // beforeEach(() => {
    //   sandbox.spy(mailSender, 'send');
    // });

    // afterEach(() => {
    //   sandbox.restore();
    // });

    const validUser = {
      email: 'Ifenna@gmail.com',
      redirectUrl: 'https://google.com'
    };

    const wrongUser = {
      email: 'iammensaiah@gmail.com',
      redirectUrl: 'https://google.com'
    };
    const invalidData = {
      email: 'iammensaiah',
      redirectUrl: 'https://google.com'
    };

    it('should fail if data is not valid', done => {
      chai
        .request(app)
        .post('/api/admin/forgot-password')
        .send(invalidData)
        .end((err, res) => {
          expect(IS_NOT_EMAIL).to.be.equal(res.body.errors[0].msg);
          done();
        });
    });

    it('should fail if user does not exist', done => {
      chai
        .request(app)
        .post('/api/admin/forgot-password')
        .send(wrongUser)
        .end((err, res) => {
          console.log(res.body);

          expect(USER_NOT_FOUND).to.be.equal(res.body.message);
          expect(404).to.be.equal(res.status);
          done();
        });
    });

    it('should pass if send mail if data is valid', done => {
      // const spy = sinon.spy();
      // const mock = sinon.mock(mailSender);
      chai
        .request(app)
        .post('/api/admin/forgot-password')
        .send(validUser)
        .end((err, res) => {
          console.log('mailSender', mailSender);
          const stub = sinon.stub(mailSender, 'send').returns('nay');
          expect(
            `An email has been sent to ${validUser.email}, check to verify`
          ).to.be.equal(res.body.message);

          // expect(mailSender.send.calledOnce).to.be.true;
          expect(stub.called).to.be.true;
          expect(200).to.be.equal(res.status);

          done();
        });
    });
  });
});
