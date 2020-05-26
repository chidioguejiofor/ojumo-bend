import { Op } from 'sequelize';
import { format } from 'util';
import { Event, RSVP } from '~/database/models';
import { CREATED_MSG, UPDATED_MSG, NON_FOUND_MSG } from '~/api/utils/constants';
import { User } from '../../database/models';

export default class EventsController {
  static async createUpcomingEvent(req, resp) {
    if (new Date(req.body.eventDateTime) < new Date()) {
      return resp.status(200).json({
        status: 'error',
        message: 'You must specify a date in the future',
      });
    }
    const event = await Event.create(req.body);
    return resp.status(201).json({
      status: 'success',
      message: format(CREATED_MSG, 'Event'),
      data: event,
    });
  }

  static async updateUpcomingEvent(req, resp, next) {
    if (new Date(req.body.eventDateTime) < new Date()) {
      return resp.status(200).json({
        status: 'error',
        message: 'You must specify a date in the future',
      });
    }
    try {
      const [, event] = await Event.update(req.body, {
        where: {
          id: req.params.eventId,
        },
        returning: true,
      });
      if (event.length > 0) {
        return resp.status(200).json({
          status: 'success',
          message: format(UPDATED_MSG, 'Event'),
          data: event[0],
        });
      }

      return resp.status(404).json({
        status: 'error',
        message: format(NON_FOUND_MSG, 'Event'),
      });
    } catch (errors) {
      return next(errors);
    }
  }

  static async getUpcomingEvent(req, resp) {
    const events = await Event.findAndCountAll({
      where: {
        eventDateTime: {
          [Op.gt]: new Date(),
        },
      },
      order: ['eventDateTime'],
    });

    return resp.status(200).json({
      status: 'success',
      message: 'Successfully retrieved events',
      data: events.rows,
    });
  }

  static async removeUpcomingEvents(req, resp) {
    const numOfDestroyValues = await Event.destroy({
      where: {
        id: req.params.eventId,
      },
      order: ['eventDateTime'],
    });
    if (numOfDestroyValues > 0) {
      return resp.status(200).json({
        status: 'success',
        message: 'Successfully removed that event',
      });
    }

    return resp.status(200).json({
      status: 'success',
      message: format(NON_FOUND_MSG, 'Event'),
    });
  }


  static async rsvpForEvent(req, resp) {
    try {
      const event = await Event.findOne({
        where: {
          id: req.params.eventId,
        },
      });

      const { body } = req;

      if (!event) {
        return resp.status(404).json({
          status: 'error',
          message: format(NON_FOUND_MSG, 'Event'),
        });
      }
      const data = {
        ...body,
        eventId: event.id,
      };
      let [rsvp, isCreated] = await RSVP.findOrCreate({
        where: {
          email: body.email,
          eventId: event.id,
        },
        defaults: data,
      });
      if (!isCreated) {
        rsvp = await rsvp.update(data);
      }
      return resp.status(200).json({
        status: 'success',
        data: rsvp,
      });
    } catch (e) {
      console.log(e);
      return resp.json(e);
    }
  }
}
