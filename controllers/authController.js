const passport = require("passport");

exports.authUser = passport.authenticate('emailAuth', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureMessage: 'Este correo no existe o esta inactivo',
})

exports.userAuthed = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    }

    return res.redirect('/login')
}

exports.roleAuth = (roles) => async (req, res, next) => {
    
    const {Tipo, Nombre} = res.locals.user

    if ([].concat(roles).includes(Tipo)) {
        next();
    } else {
        res.redirect('/noauth')
    }
}

exports.doLogout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login')
    });
}