import { Router } from 'express';
import User from '../controllers/user';
import Article from '../controllers/articles';
import Events from '../controllers/events';
import InputValidator from '~/api/helper/InputValidator';
import TokenValidator from '~/api/helper/TokenValidator';

const router = Router();

router.get('/', (req, resp) => resp.status(200).json({
  message: 'Here we go!!',
}));

// Auth
router.post('/admin/login', InputValidator.validate('adminLogin'), User.adminLogin);

// To aid testing by creating a user to have a hashed password
router.post('/admin/signup',
  InputValidator.validate('signup'), User.createUser);

router.post('/articles', TokenValidator.validateTokenMiddleware(true),
  InputValidator.validate('createArticle'), Article.createArticle);

router.get('/articles',
  Article.getArticles);

// Events
router.post('/events', TokenValidator.validateTokenMiddleware(true),
  InputValidator.validate('addEvent'), Events.createUpcomingEvent);

router.get('/events', Events.getUpcomingEvent);
router.put('/events/:eventId', TokenValidator.validateTokenMiddleware(true), InputValidator.validate('addEvent'),
  Events.updateUpcomingEvent);
router.delete('/events/:eventId', TokenValidator.validateTokenMiddleware(true),
  Events.removeUpcomingEvents);
router.post('/events/:eventId/rsvp', InputValidator.validate('rsvp'),
  Events.rsvpForEvent);

export default router;
