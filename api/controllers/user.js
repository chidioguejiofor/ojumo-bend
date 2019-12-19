import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import models from '../../database/models';
import { validationResult } from 'express-validator';

const user = {
    // To aid testing 
    createUser: (req, res) => {
        const { name, email, password, isAdmin } = req.body
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          return res.status(422).json({ errors: errors.array() });
        }

        return models.sequelize.sync({force: false}).then(() => {
            const saltRound = 10;
            bcrypt.genSalt(saltRound, (err, salt) => {
                bcrypt.hash(password, salt, (err, hash) => {
                    models.user.create({name, email, password: hash, isAdmin}).then((user) => {
                        const payload = {
                            email: user.email,
                            password: user.password
                        }
                        res.status(200).json({data: payload, message: 'Account created'})
                    }).catch((error) => {
                        if (error) {
                            res.status(409).json({message: 'User already exist'});
                        }
                    });
                });
            });
        });
    },

    adminLogin: (req, res) => {
        const { email, password } = req.body
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          return res.status(422).json({ errors: errors.array() });
        }

        models.user.findOne({where: { email }}).then((user) => {
            if (user && user.dataValues.isAdmin === true) {
                const check = bcrypt.compareSync(password, user.password);
                const payload = {
                    email: user.email,
                    name: user.name,
                    isAdmin: user.isAdmin
                }
                if (check) {
                    const token = jwt.sign({ email: user.email, isAdmin: user.isAdmin }, process.env.SECRET_KEY, {
                        expiresIn: 60 * 60 * 24
                      });
                    res.status(200).json({data: payload, token})
                } else {
                    res.status(400).json({ message: 'Invalid Password'});
                }
            } else {
                res.status(404).json({ message: 'User not found'});
            }
        });
    }
};

export default user;