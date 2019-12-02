import { body } from 'express-validator';

const inputValidator = {
    validate: (method) => {
        switch (method) {
          case 'adminLogin': {
           return [
              body('email', 'Invalid email').exists().isEmail(),
              body('password', 'Password field should not be empty').notEmpty()
             ]   
          }
        }
      }
}

export default inputValidator;