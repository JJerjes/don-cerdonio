/* global L */
import {
  loadHeaderFooter,
  productCardTemplate,
  updateWeather,
  checkoutTemplate,
  cartItemTemplate,
  paymentFormTemplate,
  successOrderTemplate,
} from './utils.mjs';
import { getCart, addToCart, removeFromCart } from './Cart.mjs';
import Alert from './Alert.mjs';
import { getProductImage, getNutritionData } from './externalServices.mjs';
const myAlert = new Alert();

let allProducts = [];

const storeCoords = [-12.141797, -76.943976];

function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
    Math.cos(phi2) *
    Math.sin(deltaLambda / 2) *
    Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function updateCartBadge() {
  const cart = getCart();
  const badge = document.querySelector('#cart-count');
  const cartIcon = document.querySelector('.cart-link i');

  if (badge) {
    badge.textContent = cart.length;
    badge.classList.remove('bump');
    void badge.offsetWidth;
    badge.classList.add('bump');

    if (cartIcon && cart.length > 0) {
      cartIcon.classList.add('cart-icon-active');
    } else if (cartIcon) {
      cartIcon.classList.remove('cart-icon-active');
    }
  }
}

function updateOrderSummary() {
  const items = document.querySelectorAll('.checkout-item');
  let subtotal = 0;

  items.forEach((item) => {
    const priceText = item.querySelector('.item-price').textContent;
    const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
    if (!isNaN(price)) subtotal += price;
  });

  const subtotalElement = document.querySelector('#subtotal-amount');
  const shippingElement = document.querySelector('#shipping-cost');
  const totalElement = document.querySelector('#total-amount');

  const shippingText = shippingElement ? shippingElement.textContent : '0';
  const shippingCost = parseFloat(shippingText.replace(/[^0-9.]/g, '')) || 0;

  if (subtotalElement) subtotalElement.textContent = `$ ${subtotal.toFixed(2)}`;

  if (totalElement) {
    const finalTotal = subtotal + shippingCost;
    totalElement.textContent = `$ ${finalTotal.toFixed(2)}`;
  }
}

function setupCheckoutEvents() {
  const listContainer = document.querySelector('#checkout-items-list');
  if (!listContainer) return;

  listContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const id = btn.dataset.id;
    const itemCard = btn.closest('.checkout-item');
    const qtyInput = itemCard.querySelector('.quantity-input');
    const priceDisplay = itemCard.querySelector('.item-price');

    const product = allProducts.find((p) => p.id.toString() === id.toString());
    if (!product) return;

    if (btn.classList.contains('plus')) {
      let qty = parseInt(qtyInput.value);
      qty++;
      qtyInput.value = qty;
      priceDisplay.textContent = `$ ${(product.price * qty).toFixed(2)}`;
    }

    if (btn.classList.contains('minus')) {
      let qty = parseInt(qtyInput.value);
      if (qty > 1) {
        qty--;
        qtyInput.value = qty;
        priceDisplay.textContent = `$ ${(product.price * qty).toFixed(2)}`;
      }
    }

    if (btn.classList.contains('delete-item-btn')) {
      removeFromCart(id);
      itemCard.remove();
      updateCartBadge();
      const cart = getCart();
      if (cart.length === 0) showCheckoutView();
    }
    updateOrderSummary();
  });
}

export async function initDeliveryMap() {
  try {
    const container = L.DomUtil.get('map');
    if (container != null) {
      container._leaflet_id = null;
    }

    const map = L.map('map', {
      tap: false,
      zoomControl: true,
    }).setView(storeCoords, 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    const marker = L.marker(map.getCenter()).addTo(map);

    const calculateAndDisplay = (customerLatLng) => {
      const distance = getDistanceInMeters(
        storeCoords[0],
        storeCoords[1],
        customerLatLng.lat,
        customerLatLng.lng,
      );

      let cost = distance <= 1000 ? 3.0 : distance <= 3000 ? 7.0 : 12.0;

      const shippingElement = document.querySelector('#shipping-cost');
      if (shippingElement) shippingElement.textContent = `$ ${cost.toFixed(2)}`;

      window.currentShippingCost = cost;
      updateOrderSummary();
    };

    map.on('move', () => {
      marker.setLatLng(map.getCenter());
    });

    map.on('moveend', async () => {
      const center = map.getCenter();
      calculateAndDisplay(center);

      const addressBox = document.querySelector('#address-display');
      if (addressBox) addressBox.textContent = 'looking for direction';

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${center.lat}&lon=${center.lng}`,
        );
        const data = await response.json();
        if (addressBox) addressBox.textContent = data.display_name;
      } catch (error) {
        if (addressBox) addressBox.textContent = 'Dirección no encontrada';
      }
    });

    calculateAndDisplay(map.getCenter());
  } catch (error) {
    console.warn('Aviso de Leaflet detectado y omitido para el usuario.');
  }
}

async function showCheckoutView() {
  const homeView = document.querySelector('#home-view');
  const checkoutView = document.querySelector('#checkout-view');
  const footer = document.querySelector('#main-footer');

  if (!homeView || !checkoutView) return;

  homeView.classList.add('hidden');
  checkoutView.classList.remove('hidden');
  footer.classList.add('hidden');

  checkoutView.innerHTML = checkoutTemplate();

  const itemsListContainer = document.querySelector('#checkout-items-list');
  const cartIds = getCart();

  if (itemsListContainer) {
    const cartProductsRaw = allProducts.filter((p) =>
      cartIds.includes(p.id.toString()),
    );
    itemsListContainer.innerHTML =
      '<p style="text - align: center; ">Finalizing details... 🐷</p>';

    const cartProducts = await Promise.all(
      cartProductsRaw.map(async (product) => {
        try {
          const [apiImage, apiCalories] = await Promise.all([
            getProductImage(product.name),
            getNutritionData(product.name),
          ]);

          const cals = Number(apiCalories) || Number(product.calories) || 0;

          return {
            ...product,
            image: apiImage || product.image,
            calories: cals,
            dailyPercentage: ((cals / 2000) * 100).toFixed(1),
          };
        } catch (e) {
          const cals = Number(product.calories) || 0;
          return {
            ...product,
            calories: cals,
            dailyPercentage: ((cals / 2000) * 100).toFixed(1),
          };
        }
      }),
    );

    if (cartProducts.length > 0) {
      itemsListContainer.innerHTML = cartProducts
        .map((product) => cartItemTemplate(product, 1))
        .join('');
      setupCheckoutEvents();
      updateOrderSummary();

      setTimeout(() => {
        initDeliveryMap();
      }, 300);
    } else {
      itemsListContainer.innerHTML =
        '<p style="text - align: center; padding: 20px;">Your cart is empty 🐷</p>';
    }
  }

  document.querySelector('#back-to-products').addEventListener('click', () => {
    homeView.classList.remove('hidden');
    checkoutView.classList.add('hidden');
    footer.classList.remove('hidden');
    checkoutView.innerHTML = '';
  });

  document.querySelector('#btn-pay-now')?.addEventListener('click', () => {
    const fullName = document.querySelector('#full-name').value.trim();
    if (fullName === '') {
      myAlert.render('Please enter who will be receiving your order 🐷');
      document.querySelector('#full-name').focus();
      return;
    }

    const address = document.querySelector('#address-display').textContent;
    if (
      address === 'Detecting location...' ||
      address === 'looking for direction'
    ) {
      myAlert.render('Please select a delivery location on the map first 🐷');
      return;
    }

    const total = document.querySelector('#total-amount').textContent;

    const modalContainer = document.createElement('div');
    modalContainer.id = 'modal-container';
    modalContainer.innerHTML = paymentFormTemplate(total);
    document.body.appendChild(modalContainer);

    const cardExp = document.getElementById('card-exp');
    const cardNumber = document.getElementById('card-number');
    const custId = document.querySelector('#cust-id');

    if (cardExp) {
      cardExp.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');

        if (value.length === 1 && value > 1) {
          value = '0' + value;
        }

        if (value.length >= 2) {
          let month = parseInt(value.substring(0, 2));

          if (month > 12) {
            month = 12;
          } else if (month === 0) {
            month = 1;
          }

          let monthString = month.toString().padStart(2, '0');
          value = monthString + value.substring(2, 4);
        }

        if (value.length >= 2) {
          e.target.value = value.substring(0, 2) + '/' + value.substring(2, 4);
        } else {
          e.target.value = value;
        }
      });

      cardExp.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && e.target.value.length === 3) {
          cardExp.value = cardExp.value.substring(0, 2);
        }
      });
    }

    if (cardNumber) {
      cardNumber.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        let formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        e.target.value = formattedValue;
      });
    }

    if (custId) {
      custId.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');

        if (value.length > 9) {
          value = value.substring(0, 9);
        }
        e.target.value = value;
      });
    }

    document.querySelector('#cancel-payment').addEventListener('click', () => {
      const overlay = document.querySelector('#modal-container');

      if (overlay) {
        overlay.classList.add('animate-fade-out');

        setTimeout(() => {
          if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
          }
        }, 500);
      }
    });

    document
      .querySelector('#final-payment-form')
      .addEventListener('submit', (e) => {
        e.preventDefault();

        const firstName = document.querySelector('#cust-fname').value;

        modalContainer.innerHTML = successOrderTemplate(firstName);

        localStorage.removeItem('cart');
        sessionStorage.removeItem('donCerdonio_user');
        updateCartBadge();

        setTimeout(() => {
          window.location.href = '../index.html';
        }, 6000);
      });
  });
}

const renderProductsFromData = async (dataList) => {
  const productListElement = document.querySelector('#product-list');
  if (!productListElement) return;

  productListElement.innerHTML =
    '<p style="text - align: center; grid - column: 1 / -1; ">Don Cerdonio is checking the nutrients... 🐷</p>';
  const cart = getCart();

  if (dataList.length === 0) {
    productListElement.innerHTML =
      '<p class="no - results" style="grid - column: 1 / -1; text - align: center; padding: 20px;">No products found... 🐷</p>';
    return;
  }

  const enrichedProducts = await Promise.all(
    dataList.map(async (product) => {
      try {
        const [apiImage, apiCalories] = await Promise.all([
          getProductImage(product.name),
          getNutritionData(product.name),
        ]);

        return {
          ...product,
          image: apiImage || product.image,
          calories: Number(apiCalories) || Number(product.calories) || 0,
          isApiFresh: true,
        };
      } catch (error) {
        return {
          ...product,
          calories: Number(product.calories) || 0,
          isApiFresh: false,
        };
      }
    }),
  );

  productListElement.innerHTML = '';

  enrichedProducts.forEach((product) => {
    const cal = product.calories;
    product.dailyPercentage = ((cal / 2000) * 100).toFixed(1);

    if (isNaN(product.dailyPercentage)) product.dailyPercentage = 0;
    const html = productCardTemplate(product);
    productListElement.insertAdjacentHTML('beforeend', html);

    const cardElement = productListElement.lastElementChild;
    const advice = cardElement.querySelector('.advice-box');
    const btn = cardElement.querySelector('.add-to-cart-btn');

    if (cart.includes(product.id.toString()) || product.isApiFresh) {
      if (advice) advice.classList.remove('hidden');
    }

    if (cart.includes(product.id.toString())) {
      if (btn) {
        btn.textContent = 'Added! 🐷';
        btn.style.backgroundColor = '#ffd100';
      }
    }
  });
};

async function initCart() {
  await loadHeaderFooter();
  await updateWeather();

  const name = sessionStorage.getItem('donCerdonio_user');
  const userDisplay = document.querySelector('#user-display');
  if (name && userDisplay) {
    userDisplay.textContent = name;
  } else {
    window.location.href = '../index.html';
    return;
  }

  const handleNav = async (e) => {
    e.preventDefault();
    const cart = getCart();
    if (cart.length === 0) {
      document.querySelector('#cart-error-modal').showModal();
    } else {
      await showCheckoutView();
    }
  };

  document.querySelector('.cart-link')?.addEventListener('click', handleNav);
  document.querySelector('#btn-checkout')?.addEventListener('click', handleNav);

  document.querySelector('#close-modal')?.addEventListener('click', () => {
    document.querySelector('#cart-error-modal').close();
  });

  document
    .querySelector('#search-input')
    ?.addEventListener('input', async (e) => {
      const term = e.target.value.toLowerCase().trim();
      const filtered = allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term),
      );
      await renderProductsFromData(filtered);
    });

  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      document
        .querySelectorAll('.tab-btn')
        .forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filtered = allProducts.filter(
        (p) => p.category === btn.dataset.category,
      );
      await renderProductsFromData(filtered);
    });
  });

  document.querySelector('#product-list')?.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart-btn')) {
      const productId = e.target.dataset.id;
      if (addToCart(productId)) {
        e.target.textContent = 'Added! 🐷';
        e.target.style.backgroundColor = '#ffd100';
        e.target
          .closest('.product-card')
          .querySelector('.advice-box')
          ?.classList.remove('hidden');
        updateCartBadge();
      }
    }
  });

  try {
    const response = await fetch('../public/json/products.json');
    allProducts = await response.json();
    await renderProductsFromData(
      allProducts.filter((p) => p.category === 'portion'),
    );
    await updateWeather();
  } catch (error) {
    console.error('Error fetching products:', error);
  }

  updateCartBadge();
}

initCart();
