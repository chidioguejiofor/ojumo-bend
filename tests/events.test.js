import { format } from 'util';
import { it, before, beforeEach, describe } from 'mocha';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import TokenValidator from '~/api/helper/TokenValidator';
import app from '../api/server';
import { User, Event } from '../database/models';

import {
  EXPIRED_TOKEN,
  MISSING_AUTH_REUQIREMENT,
  NOT_ALLOWED,
  CREATED_MSG,
  UPDATED_MSG
} from '~/api/utils/constants';

chai.use(chaiHttp);
const URL = '/api/events';

const validData = {
  name: 'The imperative of focus and Goal oriented Life',
  speaker: 'Ikechukwu',
  coverImage: 'some-image-url',
  eventDateTime: '2021-02-13 10:00:00'
};

describe('EVENTS Routing', () => {
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
      isAdmin: true
    };
    const nonAdminData = {
      email: 'email1021@email.com',
      name: 'nonAdmin',
      password: 'pass123',
      isAdmin: false
    };

    [adminUser] = await User.findOrCreate({
      where: { email: adminData.email },
      defaults: adminData
    });

    [nonAdminUser] = await User.findOrCreate({
      where: { email: nonAdminData.email },
      defaults: nonAdminData
    });

    adminToken = TokenValidator.createToken(
      {
        email: adminUser.email,
        isAdmin: adminUser.isAdmin,
        id: adminUser.id
      },
      60 * 60
    );

    nonAdminToken = TokenValidator.createToken(
      {
        email: nonAdminUser.email,
        isAdmin: nonAdminUser.isAdmin,
        id: nonAdminUser.id
      },
      60 * 60
    );

    expiredToken = TokenValidator.createToken(
      {
        email: nonAdminUser.email,
        isAdmin: nonAdminUser.isAdmin,
        id: nonAdminUser.id
      },
      -1
    );
  });

  describe('PUT /api/events/:eventId', () => {
    let eventId;
    beforeEach(async () => {
      await Event.destroy({ where: {} }, { truncate: true });

      const event = await Event.create({
        ...validData,
        authorId: adminUser.id
      });

      eventId = event.id;
    });
    it('should fail when the user is not an admin', done => {
      chai
        .request(app)
        .put(`${URL}/${eventId}`)
        .set('Authorization', `Bearer ${nonAdminToken}`)
        .send(validData)
        .end((err, res) => {
          expect(401).to.be.equal(res.status);
          expect(NOT_ALLOWED).to.be.equal(res.body.message);
          done();
        });
    });
    it('should update the event when the data is valid', done => {
      const updateData = {
        ...validData,
        speaker: 'The Great Winners'
      };
      chai
        .request(app)
        .put(`${URL}/${eventId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .end((err, res) => {
          const resData = res.body.data;
          expect(200).to.be.equal(res.status);
          expect(format(UPDATED_MSG, 'Event')).to.be.equal(res.body.message);
          // expect(adminUser.id).to.be.equal(resData.authorId);
          console.log({ resData });
          expect(validData.name).to.be.equal(resData.name);
          expect(eventId).to.be.equal(resData.id);
          expect('The Great Winners').to.be.equal(resData.speaker);
          expect(new Date() < new Date(resData.eventDateTime)).to.be.equal(
            true
          );
          done();
        });
    });

    it('should return 401 when token is missing', done => {
      chai
        .request(app)
        .put(`${URL}/${eventId}`)
        .send(validData)
        .end((err, res) => {
          expect(401).to.be.equal(res.status);
          expect(MISSING_AUTH_REUQIREMENT).to.be.equal(res.body.message);
          done();
        });
    });
    it('should return 401 when token is expired', done => {
      chai
        .request(app)
        .put(`${URL}/${eventId}`)
        .set('Authorization', `Bearer ${expiredToken}`)
        .send(validData)
        .end((err, res) => {
          expect(401).to.be.equal(res.status);
          expect(EXPIRED_TOKEN).to.be.equal(res.body.message);
          done();
        });
    });
  });
  describe('POST /api/events', () => {
    it('should fail when the user is not an admin', done => {
      chai
        .request(app)
        .post(`${URL}`)
        .set('Authorization', `Bearer ${nonAdminToken}`)
        .send(validData)
        .end((err, res) => {
          expect(401).to.be.equal(res.status);
          expect(NOT_ALLOWED).to.be.equal(res.body.message);
          done();
        });
    });
    it('should create the event when the data is valid', done => {
      chai
        .request(app)
        .post(`${URL}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validData)
        .end((err, res) => {
          const resData = res.body.data;
          expect(201).to.be.equal(res.status);
          expect(format(CREATED_MSG, 'Event')).to.be.equal(res.body.message);
          // expect(adminUser.id).to.be.equal(resData.authorId);
          expect(validData.name).to.be.equal(resData.name);
          expect(validData.speaker).to.be.equal(resData.speaker);
          expect(new Date() < new Date(resData.eventDateTime)).to.be.equal(
            true
          );
          done();
        });
    });

    it('should return 401 when token is missing', done => {
      chai
        .request(app)
        .post(`${URL}`)
        .send(validData)
        .end((err, res) => {
          expect(401).to.be.equal(res.status);
          expect(MISSING_AUTH_REUQIREMENT).to.be.equal(res.body.message);
          done();
        });
    });

    it('should return 401 when token is expired', done => {
      chai
        .request(app)
        .post(`${URL}`)
        .set('Authorization', `Bearer ${expiredToken}`)
        .send(validData)
        .end((err, res) => {
          expect(401).to.be.equal(res.status);
          expect(EXPIRED_TOKEN).to.be.equal(res.body.message);
          done();
        });
    });
  });
});
