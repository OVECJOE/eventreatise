const messageCardBtn = document.querySelector('#message-card button')
const closeFormBtn = document.querySelector('#close-form-btn')
const createBtn = document.querySelector('#create-btn')
const navBackBtn = document.querySelector('#nav-back-btn')

// the popup form
let containerForm;

messageCardBtn && messageCardBtn.addEventListener('click', (e) => {
    e.stopPropagation()
  
    e.currentTarget.parentElement.style.display = 'none'
  })

createBtn && createBtn.addEventListener('click', (e) => {
  containerForm = document.querySelector('#create-form')

  // show form
  containerForm.parentElement.classList.remove('hidden')
})

closeFormBtn && closeFormBtn.addEventListener('click', (e) => {
  containerForm = e.currentTarget.parentElement

  // hide form
  containerForm.parentElement.classList.add('hidden')
})

navBackBtn && navBackBtn.addEventListener('click', () => {
  window.history.back()
})
