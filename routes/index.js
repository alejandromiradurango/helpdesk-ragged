const express = require('express');
const router = express.Router()

const {ticketsHome, ticketsForm, newTicket, addSupp, endTicket, cancelTicket, endTicketForm, editTicketForm, editTicket} = require('../controllers/ticketsController')
const {userHome, loginHome, addUserForm, addUser, changeStatusUser, editUserForm, editUser} = require('../controllers/usersController')
const {home, noauth} = require('../controllers/homeController')
const {authUser, userAuthed, doLogout, roleAuth} = require('../controllers/authController')

module.exports = () => {
    
    router.get('/', userAuthed, home);
    router.get('/noauth', userAuthed, noauth);

    // view tickets
    router.get('/tickets', userAuthed, ticketsHome);

    // view and add tickets
    router.get('/tickets/nuevo-ticket', userAuthed, ticketsForm);
    router.post('/tickets/nuevo-ticket', userAuthed, newTicket);

    // view and edit tickets
    router.get('/tickets/editar/:id', userAuthed, roleAuth(['TECNICO']), editTicketForm);
    router.post('/tickets/nuevo-ticket/:id', userAuthed, roleAuth(['TECNICO']), editTicket);

    // add support action
    router.patch('/tickets/:id/:Tecnico', userAuthed, roleAuth(['TECNICO']), addSupp);

    // view, end and cancel tickets
    router.get('/tickets/cerrar-ticket/:id', userAuthed, roleAuth(['TECNICO']), endTicketForm);
    router.post('/tickets/cerrar-ticket/:id', userAuthed, roleAuth(['TECNICO']), endTicket);
    router.put('/tickets/cerrar-ticket/:id', userAuthed, cancelTicket)

    // view and change status users
    router.get('/usuarios', userAuthed, roleAuth(['TECNICO']), userHome);
    router.patch('/usuarios/:id', userAuthed, roleAuth(['TECNICO']), changeStatusUser)

    // view and add users
    router.get('/usuarios/nuevo-usuario', userAuthed, roleAuth(['TECNICO']), addUserForm);
    router.post('/usuarios/nuevo-usuario', userAuthed, roleAuth(['TECNICO']), addUser);

    // view and edit users
    router.get('/usuarios/editar/:id', userAuthed, roleAuth(['TECNICO']), editUserForm);
    router.post('/usuarios/nuevo-usuario/:id', userAuthed, roleAuth(['TECNICO']), editUser);

    // view login and auth to user
    router.get('/login', loginHome);
    router.post('/login', authUser);

    // logout
    router.get('/logout', doLogout)

    return router;
}