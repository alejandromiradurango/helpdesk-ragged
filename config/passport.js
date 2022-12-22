const passport = require('passport');
const { querySQL } = require('./db');
const CustomStrategy = require('passport-custom').Strategy;


// passport.use(new LocalStrategy(
//     {
//         usernameField: 'Correo',
//         passwordField: 'Contrasena'
//     },
//     async (email, password, done) => {
//         try {
//             const user = await querySQL(`SELECT * FROM Usuarios WHERE Correo = '${email}'`);
//             console.log(user);
//             console.log(email);
//             console.log(password);
            
//             if(password !== user[0].Contrasena){
//                 return done(null, false, {
//                     message: 'Contraseña incorrecta'
//                 })
//             }

//             return done(null, user[0])
//         } catch (error) {
//             console.log(error);
//             return done(null, false, {
//                 message: 'Este correo no existe'
//             })
//         }
//     }
// ))

// passport.serializeUser((user, callback) => {
//     callback(null, user)
// })

// passport.deserializeUser((user, callback) => {
//     callback(null, user)
// })

passport.use('emailAuth',new CustomStrategy(
  async function(req, done) {
      const user = await querySQL(`select * from Usuarios where Correo = '${req.body.email}'`);
    
      if (user.length < 1 || user[0].Estado === 'INACTIVO'){
        return done(null, false)
      }

      return done(null, user[0])
  }
));

passport.serializeUser((user, callback) => {
    callback(null, user)
})

passport.deserializeUser((user, callback) => {
    callback(null, user)
})


module.exports = passport;