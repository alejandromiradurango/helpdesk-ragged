const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const util = require('util');
const emailConfig = require('../config/email');

var transport = nodemailer.createTransport({
    service: 'gmail',
    host:'smtp.gmail.com',
    port: 465,
    auth: {
        user: 'soportehelpdeskragged@gmail.com',
        pass:'sugdpoukbsxxuzlc'
    },
});

const generarHTML = (file, params = {}) => {
    const html = pug.renderFile(`${__dirname}/../views/emails/${file}.pug`, params);
    return juice(html);
}

exports.sendEmail = async (params) => {
    const html = generarHTML(params.file, params);
    let mailOptions = {
        from: 'HelpDesk - Ragged <soportehelpdeskragged@gmail.com>',
        to: params.user.Correo,
        subject: params.subject,
        text: 'Email enviado correctamente',
        html
    }

    const send = util.promisify(transport.sendMail, transport);
    return send.call(transport, mailOptions)
}

