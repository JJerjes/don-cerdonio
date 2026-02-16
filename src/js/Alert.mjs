export default class Alert {
  constructor() {
  }

  _getContainer() {
    let container = document.querySelector('#alert-list');

    if (!container) {
      container = document.createElement('div');
      container.id = 'alert-list';

      const main = document.querySelector('main') || document.querySelector('.container');

      if (main) {
        main.before(container);
      } else {
        document.body.prepend(container);
      }
    }
    return container;
  }

  render(message) {
    const container = this._getContainer();

    const alertElement = document.createElement('div');
    alertElement.className = 'alert';

    alertElement.innerHTML = `
      <p>${message} <i class="fa-solid fa-piggy-bank"></i></p>
      <span class="close-alert">&times;</span>
    `;

    container.prepend(alertElement);

    alertElement.querySelector('.close-alert').addEventListener('click', () => {
      this.removeAlert(alertElement);
    });

    setTimeout(() => {
      this.removeAlert(alertElement);
    }, 4000);
  }

  removeAlert(alertElement) {
    if (alertElement && alertElement.parentNode) {
      alertElement.classList.add('fade-out');
      alertElement.addEventListener('animationend', () => {
        alertElement.remove();
      });
    }
  }
}