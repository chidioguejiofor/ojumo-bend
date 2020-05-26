import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { User, ResetPassword } from '../../database/models';
import mailSender from '../helper/Handlebars';

const { SECRET_KEY, MAILER_EMAIL_ID, HOSTNAME } = process.env;

export default class UserController {
  static async adminLogin(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (user) {
      const check = bcrypt.compareSync(password, user.password);
      const payload = {
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin
      };
      if (check) {
        const token = jwt.sign(
          {
            email: user.email,
            isAdmin: user.isAdmin
          },
          SECRET_KEY,
          {
            expiresIn: 60 * 60 * 24
          }
        );
        return res.status(200).json({ data: payload, token });
      }
      return res.status(400).json({ message: 'Invalid Password' });
    }
    return res.status(404).json({ message: 'User not found' });
  }

  static async createUser(req, res) {
    const { name, email, password, isAdmin } = req.body;

    const saltRound = 10;
    const salt = bcrypt.genSaltSync(saltRound);
    const hash = bcrypt.hashSync(password, salt);
    try {
      const user = await User.create({
        name,
        email,
        password: hash,
        isAdmin
      });
      const payload = {
        email: user.email,
        name: user.name
      };
      return res
        .status(201)
        .json({ data: payload, message: 'Account created' });
    } catch (error) {
      return res.status(409).json({ message: 'User already exist' });
    }
  }

  static async forgetPassword(req, res) {
    try {
      const { email, redirectUrl } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const token = jwt.sign(
        {
          email: user.email
        },
        SECRET_KEY,
        {
          expiresIn: 60 * 60
        }
      );

      User.update(
        {
          reset_password_token: token
        },
        {
          where: {
            email: user.email
          },
          returning: true
        }
      );

      const hostname = HOSTNAME || req.hostname;
      const data = {
        to: user.email,
        from: MAILER_EMAIL_ID,
        template: 'forgot_password',
        subject: 'Password help has arrived!',
        context: {
          url: `${req.protocol}://${hostname}/api/admin/reset-password?token=${token}&redirectUrl=${redirectUrl}`,
          name: user.name.split(' ')[0]
        }
      };

      await mailSender.send(data);

      // Todo --- remove before deploy
      console.log(data.context.url);

      return res.status(200).json({
        message: `An email has been sent to ${user.email}, check to verify`
      });
    } catch (error) {
      return res.status(403).json({ message: 'Unable to send mail' });
    }
  }

  static async validatePassToken(req, res) {
    const { token, redirectUrl } = req.query;

    try {
      const user = await User.findOne({
        where: {
          reset_password_token: token
        }
      });
      if (!user) {
        return res.redirect(401, `${redirectUrl}?message=Invalid Token`);
      }
      const verified = await jwt.verify(user.reset_password_token, SECRET_KEY);

      if (!verified) {
        return res.redirect(401, `${redirectUrl}?message=Invalid Token`);
      }

      const resetPassword = await ResetPassword.create({
        userEmail: verified.email
      });

      User.update({ reset_password_token: undefined }, { where: {} });

      return res.redirect(
        200,
        `${redirectUrl}?message=Token Validated&resetId=${resetPassword.id}`
      );
    } catch (error) {
      return res.redirect(401, `${redirectUrl}?message=Invalid Token`);
    }
  }

  static async resetPassword(req, res) {
    const { password, confirmPassword, resetId } = req.body;
    try {
      if (password !== confirmPassword) {
        return res.status(404).json({ message: 'Password Do Not Match' });
      }
      const resetDetails = await ResetPassword.findOne({
        where: {
          id: resetId
        }
      });
      if (!resetDetails) {
        return res.status(404).json({ message: 'Password Reset Error' });
      }
      const saltRound = 10;
      const salt = bcrypt.genSaltSync(saltRound);
      const hash = bcrypt.hashSync(password, salt);
      let updatedUser = await User.update(
        { password: hash },
        {
          where: {
            email: resetDetails.userEmail
          },
          returning: true
        }
      );
      updatedUser = updatedUser[1][0];

      const data = {
        to: updatedUser.email,
        from: MAILER_EMAIL_ID,
        template: 'reset_success',
        subject: 'Password Reset Success',
        context: {
          name: updatedUser.name.split(' ')[0]
        }
      };
      await mailSender.send(data);

      ResetPassword.destroy({
        where: { userEmail: updatedUser.email }
      });

      return res
        .status(200)
        .json({ message: 'User password Has Been Updated' });
    } catch (error) {
      return res.json('server error');
    }
  }
}
