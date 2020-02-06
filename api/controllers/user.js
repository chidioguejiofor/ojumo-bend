import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../database/models';


export default class UserController {
  static async adminLogin(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (user) {
      const check = bcrypt.compareSync(password, user.password);
      const payload = {
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      };
      if (check) {
        const token = jwt.sign({
          email: user.email, isAdmin: user.isAdmin,
        }, process.env.SECRET_KEY, {
          expiresIn: 60 * 60 * 24,
        });
        return res.status(200).json({ data: payload, token });
      }
      return res.status(400).json({ message: 'Invalid Password' });
    }
    return res.status(404).json({ message: 'User not found' });
  }

  static async createUser(req, res) {
    const {
      name, email, password, isAdmin,
    } = req.body;

    const saltRound = 10;
    const salt = bcrypt.genSaltSync(saltRound);
    const hash = bcrypt.hashSync(password, salt);
    try {
      const user = await User.create({
        name, email, password: hash, isAdmin,
      });
      const payload = {
        email: user.email,
        name: user.name,
      };
      return res.status(201).json({ data: payload, message: 'Account created' });
    } catch (error) {
      return res.status(409).json({ message: 'User already exist' });
    }
  }
}
