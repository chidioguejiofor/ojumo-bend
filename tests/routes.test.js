import { format } from 'util';
import chai, { expect } from 'chai';
import {
  it, before, describe,
} from 'mocha';
import chaiHttp from 'chai-http';
import TokenValidator from '~/api/helper/TokenValidator';
import app from '../api/server';
import { User } from '../database/models';
import {
  EXPIRED_TOKEN, MISSING_AUTH_REUQIREMENT, NOT_ALLOWED, CREATED_MSG,
} from '~/api/utils/constants';


chai.use(chaiHttp);

describe('POST /api/articles', () => {
  let adminUser;
  let adminToken;
  let nonAdminToken;
  let nonAdminUser;
  let expiredToken;
  before(async () => {
    const adminData = {
      email: 'email101@email.com',
      name: 'someName',
      password: 'pass',
      isAdmin: true,

    };
    const nonAdminData = {
      email: 'email1021@email.com',
      name: 'nonAdmin',
      password: 'pass123',
      isAdmin: false,
    };


    [adminUser] = await User.findOrCreate({
      where: { email: adminData.email },
      defaults: adminData,
    });

    [nonAdminUser] = await User.findOrCreate({
      where: { email: nonAdminData.email },
      defaults: nonAdminData,
    });


    adminToken = TokenValidator.createToken({
      email: adminUser.email,
      isAdmin: adminUser.isAdmin,
      id: adminUser.id,
    }, 60 * 60);


    nonAdminToken = TokenValidator.createToken({
      email: nonAdminUser.email,
      isAdmin: nonAdminUser.isAdmin,
      id: nonAdminUser.id,
    }, 60 * 60);

    expiredToken = TokenValidator.createToken({
      email: nonAdminUser.email,
      isAdmin: nonAdminUser.isAdmin,
      id: nonAdminUser.id,
    }, -1);
  });

  it('should fail when the user is not an admin', (done) => {
    const data = {
      title: 'Effects of ML',
      body: 'ML changes everything',
      coverImage: 'some-image-url',
      description: 'Some description goes here',
    };
    chai.request(app)
      .post('/api/articles')
      .set('Authorization', `Bearer ${nonAdminToken}`)
      .send(data)
      .end((err, res) => {
        expect(401).to.be.equal(res.status);
        expect(NOT_ALLOWED).to.be.equal(res.body.message);
        done();
      });
  });
  it('should create article when input is valid', (done) => {
    const data = {
      title: 'Effects of ML',
      body: 'ML changes everything',
      coverImage: 'some-image-url',
      description: 'Some description goes here',
    };
    chai.request(app)
      .post('/api/articles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(data)
      .end((err, res) => {
        const resData = res.body.data;
        expect(201).to.be.equal(res.status);
        expect(format(CREATED_MSG, 'Article')).to.be.equal(res.body.message);
        expect(adminUser.id).to.be.equal(resData.authorId);
        expect(data.description).to.be.equal(resData.description);
        expect(data.body).to.be.equal(resData.body);
        expect(data.title).to.be.equal(resData.title);
        done();
      });
  });

  it('should return 401 when token is missing', (done) => {
    const data = {
      title: 'Effects of ML',
      body: 'ML changes everything',
      coverImage: 'some-image-url',
      description: 'Some description goes here',
    };
    chai.request(app)
      .post('/api/articles')
      .send(data)
      .end((err, res) => {
        expect(401).to.be.equal(res.status);
        expect(MISSING_AUTH_REUQIREMENT).to.be.equal(res.body.message);
        done();
      });
  });


  it('should return 401 when token is expired', (done) => {
    const data = {
      title: 'Effects of ML',
      body: 'ML changes everything',
      coverImage: 'some-image-url',
      description: 'Some description goes here',
    };
    chai.request(app)
      .post('/api/articles')
      .set('Authorization', `Bearer ${expiredToken}`)
      .send(data)
      .end((err, res) => {
        expect(401).to.be.equal(res.status);
        expect(EXPIRED_TOKEN).to.be.equal(res.body.message);
        done();
      });
  });
});

describe('ROUTE TESTING', () => {
  before((done) => {
    User.destroy({ where: {} }, { truncate: true });
    done();
  });

  describe('POST /api/admin/signup', () => {
    it('should create a new admin user account', (done) => {
      chai.request(app)
        .post('/api/admin/signup')
        .send({
          name: 'Ifenna', email: 'Ifenna@gmail.com', password: 'password', isAdmin: true,
        })
        .end((err, res) => {
          expect(201).to.be.equal(res.status);
          expect('Account created').to.be.equal(res.body.message);
          done();
        });
    });
  });
  describe('POST /api/admin/login', () => {
    it('should login as an admin user', (done) => {
      chai.request(app)
        .post('/api/admin/login')
        .send({ email: 'Ifenna@gmail.com', password: 'password' })
        .end((err, res) => {
          expect(200).to.be.equal(res.status);
          done();
        });
    });

    it('should not be able to login with wrong password', (done) => {
      chai.request(app)
        .post('/api/admin/login')
        .send({ email: 'Ifenna@gmail.com', password: 'password101' })
        .end((err, res) => {
          expect('Invalid Password').to.be.equal(res.body.message);
          expect(400).to.be.equal(res.status);
          done();
        });
    });

    it('should not be able to login with wrong admin email', (done) => {
      chai.request(app)
        .post('/api/admin/login')
        .send({ email: 'Ifennam@gmail.com', password: 'password1234' })
        .end((err, res) => {
          console.log(err);
          expect('User not found').to.be.equal(res.body.message);
          expect(404).to.be.equal(res.status);

          done();
        });
    });
  });
});
