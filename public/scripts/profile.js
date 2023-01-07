const profileNavbar = document.querySelector('#profile-navbar')
const dynamicBox = document.querySelector('#dynamic-box')

// save the window url
let presentURL = location.href

// function that displays user's following or manager's followers based on data passed
const showF = (f, fType) => {
  // create an empty string representing followers container
  let fContainer = ''

  // loop through the followers, create a card for each and add to container
  f.forEach((fItem) => {
    const fItemCard = `<p class="odd:bg-black odd:text-white flex gap-3 items-center p-2">
      <span class="text-lg text-[#dfb253] font-bold uppercase">${fItem.fullName}</span>
      <span class="text-black/40 font-mono text-sm">@${fItem.username}</span>
      <span class="font-bold text-sm uppercase py-0.5 px-1 ${fItem.isManager ? 'bg-[#dfb253]' : 'bg-[#0a5231]'}">
        ${fItem.isManager ? "Manager" : "User"}
      </span>
      <a href="mailto:${fItem.email}" class="py-1 px-2 bg-[#a05231] text-white rounded-full ml-auto text-sm font-rubik">
        Chat via Email
      </a>
    </p>`

    // add to followers container
    fContainer = fContainer.concat(fItemCard)
  })

  // add code to the dynamic 
  dynamicBox.innerHTML = `
  <section class="flex flex-col w-full p-2 bg-white text-[#a05231] font-serif border gap-2">
    <div class="w-full">
      <h1 class="font-spray text-2xl uppercase">My ${fType}</h1>
      <hr class="mb-3">
    </div>
    ${(f.length === 0) ?
      '<p class="text-3xl font-mono text-black/50 font-semibold mx-auto my-6">Empty</p>' : ''}
    <div class="flex flex-col gap-1 border-l border-r">
      ${fContainer}
    </div>
  </section>
  `
}

const action_mapper = {
  'followers': showF,
  'following': showF,
  'card_details': (card) => { }
}

// fetch manager's data based on link clicked
const fetchManagerData = async (e) => {
  const navLink = e.currentTarget.querySelector('a')

  // show that data is loading
  dynamicBox.innerHTML = `
    <div class="text-2xl font-serif text-black/40 mx-auto my-6">
      Loading...
    </div>
  `

  if (navLink.href.endsWith('profile')) return
  // prevent redirecting to link
  e.preventDefault()

  // fetch data from url
  const data = await fetch(navLink.href).then(res => res.json())

  // call the action mapper based on window url
  for (const key of Object.keys(action_mapper)) {
    if (navLink.href.endsWith(key)) {
      // call the appropriate action function
      action_mapper[key](data, key)
      // set the present url to the navLink href
      presentURL = navLink.href
      // activate link
      activateProfileNavLink()
      return
    }
  }
}


const activateProfileNavLink = () => {
  // get all the nav links
  const navLinks = profileNavbar.querySelectorAll('span')

  navLinks.forEach(navLink => {
    const { href } = navLink.querySelector('a')

    // style the list item if href is equal to present url
    if (href === presentURL || `${href}#` === presentURL) {
      navLink.classList.add('text-[#dfb253]', 'uppercase', 'bg-black')
    } else {
      navLink.classList.remove('text-[#dfb253]', 'uppercase', 'bg-black')
    }

    navLink.addEventListener('click', fetchManagerData)
  })
}

// add event listener on document
window.addEventListener('DOMContentLoaded', activateProfileNavLink)
