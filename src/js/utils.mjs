export function renderWithTemplate(templateFn, parentElement, data, callback) {
  parentElement.insertAdjacentHTML('afterbegin', templateFn);
  if (callback) {
    callback(data);
  }
}

export async function loadHeaderFooter() {
  const headerTemplate = await fetch('../public/partials/header.html').then(res => res.text());
  const footerTemplate = await fetch('../public/partials/footer.html').then(res => res.text());

  const headerElement = document.querySelector('#main-header');
  const footerElement = document.querySelector('#main-footer');

  if (headerElement) headerElement.innerHTML = headerTemplate;
  if (footerElement) footerElement.innerHTML = footerTemplate;
}

export function productCardTemplate(product) {
  const percentage = ((product.calories / 2000) * 100).toFixed(0);

  return `
    <div class="product-card">
      <div class="card-grid">
        <div class="col-left">
          <h3>${product.name}</h3>
          <div class="img-container">
            <img src="${product.image}" alt="${product.name}"> 
          </div>
        </div>
        <div class="col-right">
          <div class="advice-box hidden" id="advice-${product.id}">
            <h4>Don Cerdonio Takes Care of You!</h4>
            <p>This delicious dish has <strong>${product.calories} Kcal</strong>. 
            For a person who will not exercise today, this is almost 
            the <strong>${percentage}%</strong> than recommended (2000 kcal).</p>
          </div>
          <div class="price-tag">Price: $${product.price.toFixed(2)}</div>
        </div>
      </div>
      <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
    </div>
  `;
}

export async function updateWeather() {
  const apiKey = 'ab57c9a1c16158bb10309ce9c90ea53f';
  const city = 'Lima,PE';
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const tempDisplay = document.querySelector('#temp-display');
    const weatherIcon = document.querySelector('#weather-icon-placeholder');

    if (tempDisplay) {
      tempDisplay.textContent = `${Math.round(data.main.temp)}°C`;
    }

    if (weatherIcon && data.weather[0].main === 'Rain') {
      weatherIcon.className = 'fa-solid fa-cloud-showers-heavy';
    } else if (weatherIcon && data.weather[0].main === 'Clouds') {
      weatherIcon.className = 'fa-solid fa-cloud';
    }
  } catch (error) {
    console.log('Could not load the weather:', error);
  }
}

export function cartItemTemplate(product, quantity) {
  return `
    <div class="checkout-item" data-id="${product.id}">
      <div class="item-image">
        <img src="${product.image}" alt="${product.name}">
      </div>

      <div class="item-info">
        <h4>${product.name.toUpperCase()}</h4>

        <div class="quantity-selector">
          <button class="qty-btn minus" data-id="${product.id}">-</button>
          <input type="number" class="quantity-input" value="${quantity}" min="0" data-id="${product.id}" readonly>
          <button class="qty-btn plus" data-id="${product.id}">+</button>
        </div>

        <p class="item-price">$ ${(product.price * quantity).toFixed(2)}</p>
      </div>

      <div class="item-actions">
        <button class="delete-item-btn" data-id="${product.id}">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    </div>
  `
}

export function checkoutTemplate() {
  return `
  <div class="checkout-wrapper">
    <nav class="checkout-nav">
      <button id="back-to-products" class="back-btn-icon">
        <i class="fa-solid fa-circle-arrow-left"></i>
      </button>
      <h1>Checkout 🐷</h1>
    </nav>

    <div class="checkout-layout">
      <div class="checkout-details">
        <div id="checkout-items-list" class="checkout-items-list"></div>
      
        <div class="shipping-form">
          <h3>Shipping Information</h3>
          <input type="text" id="full-name" placeholder="Full Name" required>
          
          <div class="delivery-map-section" style="margin-top: 15px;">
            <p style="font-size: 0.85em; color: #555; margin-bottom: 8px;">Drag the pin to your location:</p>
            <div id="map" style="height: 200px; width: 100%; border-radius: 8px; border: 1px solid #ccc;"></div>
            <p id="address-display" style="font-size: 0.8em; margin-top: 5px; font-style: italic; color: #666;">Detecting location...</p>
          </div>
          <input type="text" id="address" placeholder="Additional reference" required>
        </div>
      </div>
      
      <aside class="order-summary">
        <h2>Order Summary</h2>
        <div class="summary-details">
          <p><span>Subtotal:</span> <span id="subtotal-amount">$00.00</span></p>
          <p><span>Delivery:</span> <span id="shipping-cost">$00.00</span></p> 
          <hr>
          <p class="total"><span>Total:</span> <span id="total-amount">$00.00</span></p>
        </div>
        <button id="btn-pay-now" class="primary-btn">Pay Now</button>
      </aside>
    </div>
  </div>
  `;
}

export function paymentFormTemplate(total) {
  return `
    <div class="payment-modal animate-fade-in">
      <div class="payment-content">
        <h2>Confirm Your Order</h2>
        <p class="payment-total">Total to pay: <strong>${total}</strong></p>

        <form id="final-payment-form">
          <section class="form-section">
            <h3>1. Customer Information</h3>
            <div class="form-row">
              <input type="text" id="cust-fname" placeholder="First Name" required>
              <input type="text" id="cust-lname" placeholder="Last Name" required>
            </div>
            <div class="form-row">
              <input type="text" id="cust-id" placeholder="ID/CE number" pattern="[0-9]{8,9}" title="Please enter 8 or 9 digits" required>
              <input type="email" id="cust-email" placeholder="Email Address" required>
            </div>
          </section>

          <section class="form-section">
            <h3>2. Payment Details 💳</h3>
            <div class="form-group">
              <input type="text" id="card-number" placeholder="Card Number (16 digits)" pattern="[0-9\\s]{16,19}" maxlength="19" required>
            </div>
            <div class="form-row">
              <input type="text" id="card-exp" placeholder="MM/YY" pattern="[0-9]{2}/[0-9]{2}" maxlength="5" required>
              <input type="text" id="card-cvv" placeholder="CVV" pattern="[0-9]{3}" maxlength="3" required>
            </div>
          </section>

          <div class="payment-actions">
            <button type="submit" class="primary-btn">Confirm Purchase</button>
            <button type="button" id="cancel-payment" class="secondary-btn">Go Back</button>
          </div>
        </form>  
      </div>
    </div>
  `;
}

export function successOrderTemplate(firstName) {
  return `
    <div class="payment-modal animate-fade-in">
      <div class="payment-content success-content" style="text-align: center; padding: 40px;">
        <div class="success-icon" style="font-size: 50px; margin-bottom: 20px;">🐷✅</div>
        <h2 style="color: #2ecc71;">Order Confirmed!</h2>
        <p style="font-size: 1.2rem; margin-bottom: 20px;">
          Excellent, <strong>${firstName}</strong>! <br> 
          Your order is being prepared. 
        </p>
        <p style="color: #666;">We have sent a confirmation to your email.</p>
        <div style="margin-top: 30px;">
          <div class="loader-bar"></div>
        </div>
      </div>
    </div>
  `;
}