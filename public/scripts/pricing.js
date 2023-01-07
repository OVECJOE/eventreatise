const subscriptionPlans = document.querySelector('#subscription-plans')
let subscribeBtns = []

const fetchPrices = async () => {
  // all pricing cards as HTMl
  let allPricingCards = ''
  // card for individual pricing plan
  const subPlan = ({ id, nickname, currency, unit_amount }, user) => `
    <article
      id="${id}"
      class="bg-white pt-5 pb-2 px-3 relative grow shadow-md rounded-md flex flex-col gap-2 justify-between basis-60"
    >
      <span
        class="font-rubik text-white text-sm p-1 rounded-full -top-3 left-1/4 right-1/4 text-center absolute bg-[#c65525]"
        >${nickname}</span
      >
      <h3
        class="text-center text-[#227791] text-3xl border shadow-inner font-mono font-bold py-2 my-1 rounded-r-full"
      >
        <sup class="font-serif font-bold text-lg">${currency.toUpperCase()}</sup>
        ${unit_amount / 100}
        <sub class="text-black/40 font-serif font-bold text-sm ml-2"
          >monthly</sub
        >
      </h3>
      <ul
        class="text-black/70 flex flex-col gap-3 mt-3 mb-1 font-serif font-semibold text-sm md:text-lg"
      >
        <li class="flex gap-2 w-11/12 items-center leading-4">
          <img src="/assets/checked.png" alt="" />
          Account Verification
        </li>
        ${nickname.toLowerCase() !== 'basic' ?
      `<li class="flex gap-2 w-11/12 items-center leading-4">
            <img src="/assets/checked.png" alt="" />
            Free Access to Eventreatise Mentorship Programs
          </li>` : ''
    }
        ${nickname.toLowerCase() === 'premium' ?
      `<li class="flex gap-2 w-11/12 items-center leading-4">
              <img src="/assets/checked.png" alt="" />
              Permission to use Our Blog for Advertisement Purposes
            </li>
          ` : ''
    }
      </ul>
      ${user?.isManager ?
      ` <button
            data-product-name="${nickname}"
            class="subscribe-btn items-center flex gap-1 justify-center bg-[#dfb253] text-[#c65525] rounded-lg font-mono text-lg md:text-xl py-1.5 px-2 shadow-lg "
          >
          Subscribe
        </button>` : ''
    }
    </article>
  `

  try {
    subscriptionPlans.innerHTML = `
      <p class="w-10 h-10 motion-safe:animate-spin rounded-full bg-white relative">
        <span class=" bg-[#c65525] w-5 h-5 rounded-full absolute top-0 left-0"></span>
      </p>
    `
    const data = await fetch('/subscriptions/prices').then(res => res.json())

    // loop through prices
    for (const price of data.prices) {
      allPricingCards += subPlan(price, data.user)
    }

    // insert into subscription plans
    subscriptionPlans.innerHTML = allPricingCards

    // get all the subscribe buttons
    subscribeBtns = document.querySelectorAll('.subscribe-btn')
    // add create session event listener to subscription buttons
    subscribeBtns.forEach(button => {
      const productName = button.dataset.productName
      button.addEventListener('click', (e) => createSession(e, productName))
    })
  } catch (err) {
    console.log(err.message)
  }
}

// create customer's session and redirect to checkout page
const createSession = async (e, productName) => {
  const subscriptionCard = e.currentTarget.parentElement

  try {
    // create an processing animation spinner
    const processingSpinner = document.createElement('span')
    processingSpinner.className = "w-5 h-5 motion-safe:animate-spin rounded-full bg-white relative"
    processingSpinner.innerHTML = `
    <span class=" bg-[#c65525] w-3 h-3 rounded-full absolute top-0 left-0"></span>
    `
    // add processing spinner to button
    e.currentTarget.appendChild(processingSpinner)
    // create new customer's session
    const session = await fetch(
      `/subscriptions/subscribe?priceId=${subscriptionCard.id}&productName=${productName}`
      ).then(res => res.json())
    
    if (session?.url) {
      window.location.href = session.url
    }
  } catch (err) {
    console.log(err.message)
  }
}

// fetch pricing plans
fetchPrices()