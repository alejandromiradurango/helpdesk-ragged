require('dotenv').config({ path: '../vars.env'});

// ! GMAIL
module.exports = {
    service: 'gmail',
    host:'smtp.gmail.com',
    port: 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
}

