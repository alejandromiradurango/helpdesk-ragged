const {querySQL, insertSQL} = require('../config/db');
const tipos = ["USUARIO", "TECNICO"]
const estados = ["ACTIVO", "INACTIVO"];

exports.userHome = async (req, res) => {

    const usuarios = await querySQL('select * from Usuarios')

    const sortArray = (a, b) => {
        if (a.Nombre.toLowerCase() < b.Nombre.toLowerCase()) {return -1;}
        if (a.Nombre.toLowerCase() > b.Nombre.toLowerCase()) {return 1;}
        return 0;
    } 

    res.render('usuarios', {
        nombrePagina: 'Usuarios',
        users: usuarios.sort(sortArray)
    })
}

exports.loginHome = async (req, res) => {
    const errors = req?.session?.messages

    res.render('login', {
        nombrePagina: 'Iniciar sesión',
        errors
    })
}

exports.addUserForm = async (req, res) => {

    const initialUser = {Nombre: '', Usuario: '', Correo: ''}

    

    res.render('nuevoUsuario', {
        nombrePagina: 'Crear usuario',
        user: initialUser,
        tipos,
        estados
    });
}

exports.addUser = async (req, res) => {
    const values = Object.keys(req.body)
    let errors = [];

    for (let i = 0 ; i < values.length ; i++) {
        let key = values[i];
        if (req.body[key] === ''){
            errors.push({'texto': `El campo ${values[i]} es requerido.`})
        }
    }

    

    if (errors.length > 0) {

        const {Usuario, Nombre, Correo} = req.body

        res.render('nuevoUsuario', {
            nombrePagina: 'Crear usuario',
            errors,
            tipos,
            estados,
            user: {
                Usuario,
                Nombre,
                Correo
            }
        })
    } else {

        const {Usuario, Nombre, Correo, Tipo, Estado} = req.body

        await querySQL(`INSERT INTO Usuarios (Usuario, Nombre, Correo, Tipo, Estado) VALUES ('${Usuario}', '${Nombre}', '${Correo}', '${Tipo}', '${Estado}')`)

        res.render('nuevoUsuario', {
            nombrePagina: 'Crear usuario',
            succesful: `El usuario de ${Nombre} ha sido creado correctamente`,
            usuarioCreado: Nombre,
            tipos,
            estados
        })
    }
}

exports.changeStatusUser = async (req, res, next) => {
    const {id} = req.params
    const user = await querySQL(`select * from Usuarios where Id = '${id}'`);
    
    let estado = 'ACTIVO'
    if (user[0].Estado === estado) {
        estado = 'INACTIVO'
    } 

    const result = await insertSQL(`update Usuarios set Estado = '${estado}' where Id = '${user[0].Id}'`);
    
    if (!result) return next();

    res.status(200).send('Updated')
}

exports.editUserForm = async (req, res, next) => {
    const {id} = req.params
    const user = await querySQL(`select * from Usuarios where id = '${id}'`);

    if (user.length === 0) return next();
    
    res.render('nuevoUsuario', {
        nombrePagina: 'Editar usuario',
        user: user[0],
        tipos,
        estados
    })
}

exports.editUser = async (req, res, next) => {
    const values = Object.keys(req.body)
    let errors = [];

    for (let i = 0 ; i < values.length ; i++) {
        let key = values[i];
        if (req.body[key] === ''){
            errors.push({'texto': `El campo ${values[i]} es requerido.`})
        }
    }

    if (errors.length > 0) {

        const {Usuario, Nombre, Correo} = req.body

        res.render('nuevoUsuario', {
            nombrePagina: 'Editar usuario',
            errors,
            tipos,
            estados,
            user: {
                Usuario,
                Nombre,
                Correo
            }
        })
    } else {
        const {id} = req.params

        const {Usuario, Nombre, Correo, Tipo, Estado} = req.body

        const updatePromise = insertSQL(`UPDATE Usuarios SET Usuario='${Usuario}', Nombre='${Nombre.toUpperCase()}', Correo='${Correo}', Tipo='${Tipo}', Estado='${Estado}' WHERE Id = '${id}'`)

        const userPromise = querySQL(`select * from Usuarios where id = '${id}'`);

        const [update, user] = await Promise.all([updatePromise, userPromise])

        res.render('nuevoUsuario', {
            nombrePagina: 'Editar usuario',
            succesful: `El usuario de ${Nombre} ha sido editado correctamente`,
            usuarioCreado: Nombre,
            user: user[0],
            tipos,
            estados
        })
    }
}