const errorCardBtn = document.querySelector('#error-card button')
const closeFormBtn = document.querySelector('#close-form-btn')
const createBtn = document.querySelector('#create-btn')
// the popup form
let containerForm

errorCardBtn && errorCardBtn.addEventListener('click', (e) => {
  e.stopPropagation()

  errorCardBtn.parentElement.style.display = 'none'
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