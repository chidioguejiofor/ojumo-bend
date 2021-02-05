import hbs from 'nodemailer-express-handlebars';
import path from 'path';
import nodemailer from 'nodemailer';

const mailerEmail = process.env.MAILER_EMAIL_ID;
const pass = process.env.MAILER_PASSWORD;
const smtpTransport = nodemailer.createTransport({
  service: process.env.MAILER_SERVICE_PROVIDER,
  auth: {
    user: mailerEmail,
    pass
  }
});

const options = {
  viewEngine: {
    extname: '.html',
    layoutsDir: path.resolve('api/templates/'),
    defaultLayout: 'template',
    partialsDir: path.resolve('api/templates/')
  },
  viewPath: path.resolve('api/templates/'),
  extName: '.html'
};

smtpTransport.use('compile', hbs(options));

const mailSendObj = {
  send() {
    console.log('Sending....');
  }
};

const mailSender = {
  send: async data => {
    await smtpTransport.sendMail(data);
  }
};

export default mailSender;
