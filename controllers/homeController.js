exports.home = (req, res) => {
    const {Tipo, Nombre} = res.locals.user

    res.render('index', {
        nombrePagina: 'Inicio',
        userLogged: {
            Nombre,
            Tipo
        }
    })
}

exports.noauth = (req, res) => {
    const {Tipo, Nombre} = res.locals.user;

    res.render('index', {
        nombrePagina: 'Inicio',
        userLogged : {
            Nombre,
            Tipo
        },
        noAuth: 'No tienes permisos para hacer esta acción'
    })
}