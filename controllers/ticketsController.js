const {querySQL, insertSQL} = require('../config/db');
const dayjs = require('dayjs')
const {es} = require('dayjs/locale/es')
const utc = require('dayjs/plugin/utc')
// const timezone = require('dayjs/plugin/timezone') // dependent on utc plugin
dayjs.locale("es")
dayjs.extend(utc)
// dayjs.extend(timezone)
const types = ["INCIDENCIA", "SOLICITUD"];
const urgencies = ["BAJA","MEDIA","ALTA"];
const typeStatus = ["ABIERTO","PENDIENTE","CERRADO"]
const doEmail = require('../handlers/email')

exports.ticketsHome = async (req, res) => {
    const {Usuario, Tipo} = res.locals.user

    let query = "select * from Ticket"

    if (Tipo !== 'TECNICO') {
        query = `SELECT * FROM Ticket WHERE Usuario = '${Usuario}'`
    }

    const tickets = await querySQL(query)

    const listTickets = [];
    for (const ticket of tickets) {
        const objTicket = {};
        objTicket.Id = ticket.Id
        objTicket.Tipo = ticket.Tipo
        objTicket.Titulo = ticket.Titulo
        objTicket.Descripcion = ticket.Descripcion
        objTicket.Solucion = ticket.Solucion
        objTicket.Categoria = ticket.Categoria
        objTicket.Subcategoria = ticket.Subcategoria
        objTicket.Prioridad = ticket.Prioridad
        objTicket.Estado = ticket.Estado
        objTicket.Tecnico = ticket.Tecnico
        objTicket.Usuario = ticket.Usuario
        objTicket.FechaC = dayjs(ticket.FechaC).utc().format('DD/MM/YYYY h:mm A');
        objTicket.FechaF = ticket.FechaF;
        if (objTicket.FechaF !== null){
            objTicket.FechaF = dayjs(objTicket.FechaF).utc().format('DD/MM/YYYY h:mm A');
        }
        if (ticket.Estado !== 'CERRADO'){
            objTicket.Duracion =  dayjs(new Date()).diff(ticket.FechaC, 'days')
        } else {
            objTicket.Duracion = null;
        }
        listTickets.push(objTicket)
    }

    res.render('tickets', {
        nombrePagina: Tipo === 'TECNICO' ? 'Tickets' : 'Mis Tickets',
        tickets: listTickets.reverse(),
        userLogged: Tipo
    })
}

exports.ticketsForm = async (req, res) => {

    const categories = await querySQL('select * from Categoria');

    const subcategories = await querySQL('select * from Subcategoria');

    res.render('nuevoTicket', {
        nombrePagina: 'Crear nuevo ticket',
        categories,
        subcategories,
        types,
        urgencies
    })
}

exports.newTicket = async (req, res) => {

    const categories = await querySQL('select * from Categoria');

    const subcategories = await querySQL('select * from Subcategoria');

    //validation
    const values = Object.keys(req.body);
    let errors = [];

    for (let i = 0; i < values.length; i++) {
        let key = values[i];
        if (req.body[key] === '') {
            errors.push({'texto': `El campo ${values[i]} es requerido`});
        }
    }

    if (errors.length > 0) {
        res.render('nuevoTicket', {
            nombrePagina: 'Crear ticket',
            categories,
            subcategories,
            errors,
            ticket: req.body,
            types,
            urgencies
        })
    } else {

        const {Tipo, Titulo, Descripcion, Categoria, Subcategoria, Prioridad} = req.body
        const {Usuario} = res.locals.user

        insertSQL(`INSERT INTO Ticket (Tipo, Titulo, Descripcion, Categoria, Subcategoria, Prioridad, Estado, Tecnico, Usuario, FechaC) VALUES ( '${Tipo}', '${Titulo.toUpperCase()}', '${Descripcion.toUpperCase()}', '${Categoria}', '${Subcategoria}', '${Prioridad}', 'ABIERTO', 'SoporteGeneral', '${Usuario}', GETDATE())`)

        const result = await querySQL(`SELECT TOP 1 * FROM Ticket WHERE Usuario = '${Usuario}' ORDER BY Id DESC`);

        //send email of verification
        await doEmail.sendEmail({
            subject: 'Ticket generado correctamente',
            ticket: result[0],
            file: 'ticketCreado',
            user: res.locals.user
        })

        // send notification to support
        await doEmail.sendEmail({
            subject: `Ticket # ${result[0].Id} - ${result[0].Usuario}`,
            ticket: result[0],
            file: 'notificacionSoporte',
            user: {
                Correo: 'direccionti@ragged.com.co',
                Tipo: 'ADMIN'
            }
        })
        
        res.render('nuevoTicket', {
            nombrePagina: 'Crear ticket',
            categories,
            subcategories,
            successful: 'Ticket creado correctamente',
            types,
            urgencies
        })
    }
}

// add technician to the ticket
exports.addSupp = async (req, res, next) => {

    const {id, Tecnico} = req.params;
    
    const result = insertSQL(`UPDATE Ticket SET Tecnico = '${Tecnico}', Estado = 'PENDIENTE' WHERE Id = '${id}'`);

    const ticket = await querySQL(`SELECT TOP 1 * FROM Ticket WHERE Id = '${id}' ORDER BY Id DESC`);

    const tecnician = await querySQL(`SELECT * FROM Usuarios WHERE Usuario = '${Tecnico}'`);

    if (tecnician[0].Correo !== 'direccionti@ragged.com.co'){
        await doEmail.sendEmail({
            subject: `Asignacion de ticket: # ${id}`,
            ticket: ticket[0],
            file: 'notificacionSoporte',
            user: {
                Correo: tecnician[0].Correo,
                Tipo: tecnician[0].Tipo
            }
        })
    }

    if (!result) return next();

    res.status(200).send({
        text: `El tecnico ${tecnician[0].Nombre} ha sido asignado en el ticket # ${id}`,
        ticketStatus: 'PENDIENTE'
    })
}

// render form to end the ticket
exports.endTicketForm = async (req, res, next) => {
    const {id} = req.params
    
    const ticket = await querySQL(`Select * from Ticket where Id = '${id}'`)

    res.render('cerrarTicket', {
        nombrePagina: 'Cerrar ticket',
        ticket: ticket[0]
    })
}

// end the ticket and send email to the user
exports.endTicket = async (req, res, next) => {
    const {id} = req.params;
    
    const {Solucion} = req.body;

    const ticketQuery = await querySQL(`Select * from Ticket where Id = '${id}'`)

    if (Solucion !== ''){
        const endProcess = insertSQL(`UPDATE Ticket SET Solucion = '${Solucion.toUpperCase()}', Estado = 'CERRADO', FechaF = GETDATE() WHERE Id = '${id}'`)
    
        const ticket = await querySQL(`SELECT * FROM Ticket WHERE Id = '${id}'`)

        const userInTicket = await querySQL(`SELECT * FROM Usuarios WHERE Usuario = '${ticket[0].Usuario}'`)

        await doEmail.sendEmail({
            subject: `Ticket # ${id} cerrado correctamente`,
            ticket: ticket[0],
            file: 'ticketCerrado',
            user: {
                Nombre: userInTicket[0].Nombre,
                Correo: userInTicket[0].Correo
            }
        })

        res.render('cerrarTicket', {
            nombrePagina: 'Cerrar ticket',
            ticket: ticket[0],
            successful: 'Ticket cerrado correctamente'
        })
    } else {
        res.render('cerrarTicket', {
            nombrePagina: 'Cerrar ticket',
            ticket: ticketQuery[0],
            error: 'El campo Solucion es requerido',
            Solucion
        })
    }


        
}

// the user can cancel the ticket
exports.cancelTicket = async (req, res, next) => {
    const {id} = req.params;

    const update = insertSQL(`UPDATE Ticket SET Solucion = 'EL USUARIO CANCELA EL TICKET Y ACEPTA QUE YA NO NECESITA SOPORTE', Tecnico = 'SoporteGeneral', Estado = 'CERRADO', FechaF = GETDATE() WHERE Id = '${id}'`)
    
    const ticket = await querySQL(`SELECT * FROM Ticket WHERE Id = '${id}'`)

    if (!update) return next();
    
    res.status(200).send({
        text: 'Ticket cancelado correctamente',
        ticket: ticket[0]
    })

}

// render the form to edit the ticket
exports.editTicketForm = async (req, res, next) => {
    const {id} = req.params;

    const categories = await querySQL('select * from Categoria');

    const subcategories = await querySQL('select * from Subcategoria');

    const ticket = await querySQL(`SELECT * FROM Ticket WHERE Id = '${id}'`);

    res.render('nuevoTicket', {
        nombrePagina: 'Editar Ticket',
        ticket: ticket[0],
        types,
        urgencies,
        categories,
        subcategories,
        typeStatus
    })
}

// edit the ticket
exports.editTicket = async (req, res, next) => {
    const {id} = req.params;

    const categories = await querySQL('select * from Categoria');

    const subcategories = await querySQL('select * from Subcategoria');

    const {Tipo, Titulo, Descripcion, Solucion, Categoria, Subcategoria, Prioridad, Estado} = req.body 
    
    const ticket = await querySQL(`SELECT * FROM Ticket WHERE Id = '${id}'`);
    
    

    //validation
    const values = Object.keys(req.body);
    let errors = [];

    for (let i = 0; i < values.length; i++) {
        let key = values[i];
        if (req.body[key] === '') {
            errors.push({'texto': `El campo ${values[i]} es requerido`});
        }
    }

    
    const nombrePagina = 'Editar ticket'

    req.body.Id = id;

    if (errors.length > 0) {
        res.render('nuevoTicket', {
            nombrePagina,
            ticket: req.body,
            categories,
            subcategories,
            errors,
            types,
            urgencies,
            typeStatus
        })
    } else {

        const result = await insertSQL(`UPDATE Ticket SET Tipo = '${Tipo}', Titulo = '${Titulo.toUpperCase()}', Descripcion = '${Descripcion.toUpperCase()}', Solucion = '${Solucion.toUpperCase()}', Categoria = '${Categoria}', Subcategoria = '${Subcategoria}', Prioridad = '${Prioridad}', Estado = '${Estado}' WHERE Id = '${id}'`);
        
        if(!result) return next();
        
        if (result.rowsAffected[0] === 0) errors.push({'texto': 'No se pudo realizar el cambio'});

        if (result.rowsAffected[0] === 0){
            res.render('nuevoTicket', {
                nombrePagina,
                ticket: req.body,
                categories,
                subcategories,
                errors,
                types,
                urgencies,
                typeStatus
            })
        } else {
            res.render('nuevoTicket', {
                nombrePagina,
                ticket: ticket[0],
                categories,
                successful: 'Ticket editado correctamente',
                subcategories,
                types,
                urgencies,
                typeStatus
            })
        } 
    };
}