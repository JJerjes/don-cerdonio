export function renderWithTemplate(templateFn, parentElement, data, callback) {
  parentElement.insertAdjacentHTML('afterbegin', templateFn);

  if (callback) {
    callback(data);
  }
}

export async function loadHeaderFooter() {
  const headerTemplate = await fetch('/partials/header.html').then(res => res.text());
  const footerTemplate = await fetch('/partials/footer.html').then(res => res.text());

  const headerElement = document.querySelector('#main-header');
  const footerElement = document.querySelector('#main-footer');

  if (headerElement) {
    headerElement.innerHTML = headerTemplate;
  } else {
    console.error('No se encontró el elemento #main-header');
  }

  if (footerElement) {
    footerElement.innerHTML = footerTemplate;
  }
}

export function productCardTemplate(product) {
  const percentage = ((product.calories / 2000) * 100).toFixed(0);

  return `
    <div class="product-card">
      <div class="card-grid">
        <div class="col-left">
          <h3>${product.name}</h3>
          <div class="img-container">
            <img src="${product.image}" alt="${product.name}"> </div>
        </div>

        <div class="col-right"> <div class="advice-box hidden" id="advice-${product.id}">
            <h4>Don Cerdonio Takes Care of You!</h4>
            <p>This delicious dish has <strong>${product.calories} Kcal</strong>. 
            For a person who will not exercise today, this is almost 
            the <strong>${percentage}%</strong> than recommended (2000 kcal). 
            Enjoy it and try to keep your dinner light!</p>
          </div>
          <div class="price-tag">Price: $${product.price.toFixed(2)}</div>
        </div>
      </div>

      <button class="add-to-cart-btn" data-id="${product.id}">
        Add to Cart
      </button>
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

    if (data.cod !== 200) {
      console.warn('Weather API error:',)
    }

    const tempDisplay = document.querySelector('#temp-display');
    const weatherIcon = document.querySelector('#weather-icon-placeholder');

    if (tempDisplay) {
      tempDisplay.textContent = `${Math.round(data.main.temp)}°C`
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




