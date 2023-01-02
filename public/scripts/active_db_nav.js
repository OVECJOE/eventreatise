const sideMenu = document.querySelector('#dashboard-side-menu')


const activateNavLink = (e) => {
  // get all the nav links
  const navLinks = sideMenu.querySelectorAll('ul li')

  navLinks.forEach(navLink => {
    const { href } = navLink.querySelector('a')

    // style the list item if href is equal to window url
    if (href === window.location.href) {
      navLink.classList.add('text-[#a05231]', 'bg-white', 'rounded-full')
      navLink.querySelector('a').href = '#'
    }
  })
}

// add event listener on document
window.addEventListener('load', activateNavLink)
