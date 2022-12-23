import Swal from 'sweetalert2';
import axios from 'axios'

const inputUser = document.getElementById('searchUser');
const inputTickets = document.getElementById('searchTickets');

inputUser?.addEventListener('keyup', () => {
    var input, filter, ul, li, a, i, textValue;
    input = document.getElementById('searchUser');
    filter = input.value.toUpperCase();
    ul = document.getElementById('listUsers');
    li = ul.getElementsByTagName('li');
    for (i = 0; i < li.length; i++){
        textValue = li[i].textContent || li[i].innerText;
        if (textValue.toUpperCase().indexOf(filter) > -1){
            li[i].style.display = '';
        } else {
            li[i].style.display = 'none';
        }
    }
})

inputTickets?.addEventListener('keyup', () => {
    var input, filter, ul, li, a, i, textValue;
    input = document.getElementById('searchTickets');
    filter = input.value.toUpperCase();
    ul = document.getElementById('listTickets');
    li = ul.getElementsByTagName('li');
    for (i = 0; i < li.length; i++){
        textValue = li[i].textContent || li[i].innerText;
        if (textValue.toUpperCase().indexOf(filter) > -1){
            li[i].style.display = '';
        } else {
            li[i].style.display = 'none';
        }
    }
})


const changeStateUser = document.getElementById('listUsers')?.getElementsByClassName('cambiarEstado');
if (changeStateUser){
    for (let i = 0; i < changeStateUser.length; i++) {
        changeStateUser[i].addEventListener('click', (e) => {
            const icon = e.target
            const id = icon.dataset.id
            const url = `${location.origin}/usuarios/${id}`
            axios.patch(url, { id })
                .then((res) => { 
                    if (res.status === 200) {
                        icon.classList.toggle('activo')
                    }
                })
            
        })
    }
}

const alertLogin = document.getElementById('errorLogin');
if (alertLogin) {
    const actualTxt = alertLogin.innerText.split(',')[0];
    alertLogin.innerText = actualTxt;
    setTimeout(() => {
        alertLogin.classList.add('fadeOut');
    }, 3000)
}

const listTickets = document.getElementById('listTickets');
if (listTickets) {
    const seeMoreBtns = document.getElementsByClassName('seeDescription');
    for (const btn of seeMoreBtns) {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.element
            const element = listTickets.getElementsByClassName(id);
            element[0].classList.toggle('hidden');
        })
    }

    const addSuppBtns = document.getElementsByClassName('addSupp');
    if (addSuppBtns.length > 0) {
        for (const addSupp of addSuppBtns){
            addSupp.addEventListener('click', (e) => {
                const icon = e.target;
                const parent = icon.parentElement.parentElement;
                const addSupp = parent.getElementsByClassName('addSuppForm')[0]
                addSupp.classList.remove('hidden');
                icon.style.display = 'none';
                const select = addSupp.getElementsByTagName('select')[0];
                
                const patcher = addSupp.getElementsByClassName('doPatch')[0];
                const cancelPatcher = addSupp.getElementsByClassName('cancelPatch')[0];
                patcher.addEventListener('click', (e) => {
                    const id = e.target.dataset.ticketid
                    axios.patch(`${location.origin}/tickets/${id}/${select.value}`).then(res => {
                        if (res.status === 200) {
                            Swal.fire('Ticket asignado', res.data.text , 'success');
                            addSupp.remove();
                            const changeName = parent.getElementsByClassName('info-ticket')[0].getElementsByClassName('supp')[0];
                            const changeStatus = parent.getElementsByClassName('info-ticket')[0].getElementsByClassName('status')[0];
                            changeName.innerText = select.value;
                            changeStatus.innerText = res.data.ticketStatus;
                        } else {
                            Swal.fire('Algo ocurrió mal', '', 'error');
                        }
                    });
                })
                cancelPatcher.addEventListener('click', (e) => {
                    icon.style.display = '';
                    addSupp.classList.add('hidden');
                })

            })
        }
    }

    // Cancel ticket action 
    const cancelBtns = document.getElementsByClassName('cancelTicket');
    if (cancelBtns.length > 0) {
        for (const cancelBtn of cancelBtns) {
            cancelBtn.addEventListener('click', (e) => {
                const icon = e.target;
                const parent = icon.parentElement.parentElement;
                const ticketId = icon.dataset.ticketid;
                Swal.fire({
                    title: '¿Seguro que deseas cancelar este ticket?',
                    text: `Al cancelar el ticket #${ticketId} aceptas que ya no es necesario ayuda o soporte en este y no será revisado o solucionado por el tecnico asignado.`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#6E7881',
                    reverseButtons: true,
                    confirmButtonText: 'Cancelar ticket',
                    cancelButtonText: 'Volver'
                  }).then(async (result) => {
                    if (result.isConfirmed) {
                        axios.put(`${location.origin}/tickets/cerrar-ticket/${ticketId}`).then(res => {
                            if (res.status === 200) {
                                const {text, ticket} = res.data
                                
                                Swal.fire(text, `El ticket #${ticket.Id} del usuario ${ticket.Usuario} fue cancelado correctamente` , 'success');
                                icon.remove();
                                parent.getElementsByClassName('endTicket')[0].remove();
                                const changeStatus = parent.getElementsByClassName('info-ticket')[0].getElementsByClassName('status')[0];
                                changeStatus.innerText = 'CERRADO';
                                const parentDescription = parent.parentElement
                                const changeDescription = parentDescription.getElementsByClassName('description')[0]
                                changeDescription.classList.remove('hidden');
                                changeDescription.innerHTML += `<h2 class="my-2 font-bold uppercase text-xl">Solución</h2><p>${ticket.Solucion}</p>`
                            } else {
                                Swal.fire('Algo ocurrió mal', '', 'error');
                            }
                        });
                    }
                  })
            })
        }
    }
}

// Filter options of subcategorie from the value of the category
const selectSC = document.getElementById('Subcategoria');
if (selectSC) {
    const selectC = document.getElementById('Categoria');
    const optionsSC = selectSC.getElementsByTagName('option')
    if (selectC.value !== ''){
        selectSC.parentElement.classList.remove('hidden');
        for (let i = 0; i < optionsSC.length; i++) {
            if (optionsSC[i].dataset.category !== selectC.value) {
                optionsSC[i].classList.add('hidden');
            } else {
                optionsSC[i].classList.remove('hidden');
            }
        }
    }
    selectC.addEventListener('change', () => {
        selectSC.parentElement.classList.remove('hidden');
        selectSC.value = "";
        
        for (let i = 0; i < optionsSC.length; i++) {
            if (optionsSC[i].dataset.category !== selectC.value) {
                optionsSC[i].classList.add('hidden');
            } else {
                optionsSC[i].classList.remove('hidden');
            }
        }
    })
}