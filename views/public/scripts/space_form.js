// selected elements
const fieldSets = document.querySelectorAll('fieldset')
const submitBtn = document.querySelector('#submit-btn')

// navigation count
let navCount = 0

// errmsg
let errmsg = ''

// navigate fieldsets function
function navigateForm(e, next = false) {
  // set the opacity based on navCount
  e.currentTarget.style.opacity = (!next && navCount == 0) ||
    (next && navCount == fieldSets.length - 1) ? '0.5' : '1'

  // set next count
  const nextCount = next ? navCount + 1 : navCount - 1

  if (nextCount >= 0 && nextCount < fieldSets.length) {
    // hide and show appropriate form slides
    fieldSets[nextCount].classList.remove('hidden')
    fieldSets[navCount].classList.add('hidden')

    // increment navCount
    navCount = nextCount
  }
}

// add event handlers to the fieldsets
fieldSets.forEach(fieldset => {
  // get previous and next buttons from fieldset
  const prevBtn = fieldset.querySelector('#prev-btn')
  const nextBtn = fieldset.querySelector('#next-btn')

  // add event handler to buttons
  prevBtn.addEventListener('click', (e) => navigateForm(e))
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => navigateForm(e, true))
  }
})
