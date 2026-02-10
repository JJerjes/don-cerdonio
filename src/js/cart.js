import { loadHeaderFooter, productCardTemplate, updateWeather } from './utils.mjs';

function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('donCerdonio_cart')) || [];
  const badge = document.querySelector('#cart-count');
  const cartIcon = document.querySelector('.cart-link i');

  if (badge) {
    badge.textContent = cart.length;

    badge.classList.remove('bump');
    void badge.offsetWidth;
    badge.classList.add('bump');

    if (cartIcon && cart.length > 0) {
      cartIcon.classList.remove('cart-icon-active');
      void cartIcon.offsetWidth;
      cartIcon.classList.add('cart-icon-active');
    }
  }
}

function handleCheckoutNavigation(event) {
  const cart = JSON.parse(localStorage.getItem('donCerdonio_cart')) || [];
  const modal = document.querySelector('#cart-error-modal');

  if (cart.length === 0) {
    event.preventDefault();
    modal.showModal();
  } else {
    if (event.currentTarget.id === 'btn-checkout') {
      window.location.href = '../../cart/checkout.html';
    }
  }
}

async function initCart() {
  await loadHeaderFooter();
  await updateWeather();

  const cartLink = document.querySelector('.cart-link');
  const footerBtn = document.querySelector('#btn-checkout');
  const searchInput = document.querySelector('#search-input');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const productListElement = document.querySelector('#product-list');
  const closeModalBtn = document.querySelector('#close-modal');

  let allProducts = [];

  if (cartLink) cartLink.addEventListener('click', handleCheckoutNavigation);
  if (footerBtn) footerBtn.addEventListener('click', handleCheckoutNavigation);

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      document.querySelector('#cart-error-modal').close();
    });
  }

  const name = sessionStorage.getItem('donCerdonio_user');
  const userDisplay = document.querySelector('#user-display');
  if (name && userDisplay) {
    userDisplay.textContent = name;
  } else {
    window.location.href = '../index.html';
    return;
  }

  const renderProductsFromData = (dataList) => {
    productListElement.innerHTML = '';
    const cart = JSON.parse(localStorage.getItem('donCerdonio_cart')) || [];

    if (dataList.length === 0) {
      productListElement.innerHTML = '<p class="no-results" style="grid-column: 1/-1; text-align:center; padding: 20px;">No products found... 🐷</p>';
      return;
    }

    dataList.forEach(product => {
      const html = productCardTemplate(product);
      productListElement.insertAdjacentHTML('beforeend', html);

      if (cart.includes(product.id.toString())) {
        const cardElement = productListElement.lastElementChild;
        const btn = cardElement.querySelector('.add-to-cart-btn');
        const advice = cardElement.querySelector('.advice-box');

        if (btn) {
          btn.textContent = 'Added! 🐷';
          btn.style.backgroundColor = '#ffd100';
          btn.style.color = '#2C3E50';
        }

        if (advice) {
          advice.classList.remove('hidden');
        }
      }
    });
  };

  productListElement.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart-btn')) {
      const productId = e.target.dataset.id;
      let cart = JSON.parse(localStorage.getItem('donCerdonio_cart')) || [];

      const card = e.target.closest('.product-card');
      const adviceBox = card.querySelector('.advice-box');

      if (!cart.includes(productId)) {
        cart.push(productId);
        localStorage.setItem('donCerdonio_cart', JSON.stringify(cart));

        e.target.textContent = 'Added! 🐷';
        e.target.style.backgroundColor = '#ffd100';

        if (adviceBox) {
          adviceBox.classList.remove('hidden');
        }

        updateCartBadge();

        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      }
    }
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();

      if (term === '') {
        const activeTab = document.querySelector('.tab-btn.active');
        const category = activeTab ? activeTab.dataset.category : 'portion';
        renderProductsFromData(allProducts.filter(p => p.category === category));
        return;
      }

      const isDrinkQuery = ['drink', 'water', 'chicha', 'thirst', 'bebida', 'agua'].some(word => term.includes(word));
      const isFoodQuery = ['food', 'portion', 'meal', 'hungry', 'pig', 'pork', 'comida'].some(word => term.includes(word));

      const filtered = allProducts.filter(product => {
        const nameMatch = product.name.toLowerCase().includes(term);
        const categoryMatch = product.category.toLowerCase().includes(term);

        if (isDrinkQuery && product.category === 'drink') return true;
        if (isFoodQuery && product.category === 'portion') return true;

        return nameMatch || categoryMatch;
      });

      renderProductsFromData(filtered);
    });
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.dataset.category;
      const filtered = allProducts.filter(p => p.category === category);
      renderProductsFromData(filtered);

      if (searchInput) searchInput.value = '';
    });
  });

  try {
    const response = await fetch('../public/json/products.json');
    allProducts = await response.json();

    const initialProducts = allProducts.filter(p => p.category === 'portion');
    renderProductsFromData(initialProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
  }

  updateCartBadge();
}

initCart();