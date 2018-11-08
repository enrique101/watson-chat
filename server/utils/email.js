const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendEmail = async (name,email, text) =>{
  "use strict"
    return await new Promise((resolve,reject)=>{
      transport.sendMail({
            from: email,
            to: 'enrique.acuna@gmail.com',
            subject: `Mensaje de ${name}`,
            html: `<p>Name: ${name}</p><p>Email: ${email}</p><p>${text.replace(/[\r\n]/g, "<br />")}<p/>`,
          }, (error,info) => {
            if(error) reject({ error });
            resolve(info);
          });

    });
};

module.exports.sendEmail = sendEmail;