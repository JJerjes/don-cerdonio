export function getCart() {
  return JSON.parse(localStorage.getItem('donCerdonio_cart')) || [];
}

export function saveCart(cart) {
  localStorage.setItem('donCerdonio_cart', JSON.stringify(cart));
}

export function addToCart(id) {
  const cart = getCart();
  if (!cart.includes(id)) {
    cart.push(id);
    saveCart(cart);
    return true;
  }
  return false;
}

export function removeFromCart(id) {
  let cart = getCart();
  cart = cart.filter(prodId => prodId !== id);
  saveCart(cart);
  return cart;
}