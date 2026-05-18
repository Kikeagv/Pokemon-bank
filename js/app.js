const STORAGE_KEY = 'pokemonBankState';
const SESSION_KEY = 'pokemonBankSession';

const defaultState = {
  user: {
    name: 'Ash Ketchum',
    pin: '1234',
    account: '0987654321',
    balance: 500
  },
  transactions: []
};

const money = new Intl.NumberFormat('es-SV', {
  style: 'currency',
  currency: 'USD'
});

function cloneDefaultState() {
  return JSON.parse(JSON.stringify(defaultState));
}

function getState() {
  const savedState = localStorage.getItem(STORAGE_KEY);

  if (!savedState) {
    const initialState = cloneDefaultState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
    return initialState;
  }

  try {
    const parsedState = JSON.parse(savedState);
    return {
      ...cloneDefaultState(),
      ...parsedState,
      user: {
        ...cloneDefaultState().user,
        ...(parsedState.user || {})
      },
      transactions: Array.isArray(parsedState.transactions) ? parsedState.transactions : []
    };
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
    return getState();
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function isLoggedIn() {
  return sessionStorage.getItem(SESSION_KEY) === 'active';
}

function requireSession() {
  const currentPage = document.body.dataset.page;

  if (currentPage !== 'login' && !isLoggedIn()) {
    window.location.href = 'index.html';
  }
}

function setText(selector, value) {
  document.querySelectorAll(selector).forEach((element) => {
    element.textContent = value;
  });
}

function renderAccountInfo() {
  const state = getState();
  setText('[data-user-name]', state.user.name);
  setText('[data-user-account]', state.user.account);
  setText('[data-user-balance]', money.format(state.user.balance));
}

function bindLogout() {
  document.querySelectorAll('[data-logout]').forEach((logoutLink) => {
    logoutLink.addEventListener('click', (event) => {
      event.preventDefault();
      sessionStorage.removeItem(SESSION_KEY);
      window.location.href = 'index.html';
    });
  });
}

function showFieldError(input, message) {
  input.classList.add('is-invalid');
  const feedback = input.closest('.mb-3')?.querySelector('.invalid-feedback');

  if (feedback) {
    feedback.textContent = message;
  }
}

function clearFieldError(input) {
  input.classList.remove('is-invalid');
  const feedback = input.closest('.mb-3')?.querySelector('.invalid-feedback');

  if (feedback) {
    feedback.textContent = '';
  }
}

function validateAmount(input, label = 'Monto') {
  clearFieldError(input);
  const errors = validate.single(input.value, {
    presence: { allowEmpty: false, message: `^Ingrese el ${label.toLowerCase()}.` },
    numericality: {
      greaterThan: 0,
      lessThanOrEqualTo: 5000,
      message: '^El monto debe ser mayor que 0 y no exceder $5,000.'
    }
  });

  if (errors) {
    showFieldError(input, errors[0]);
    input.focus();
    return null;
  }

  return Number(Number(input.value).toFixed(2));
}

function buildTransaction(type, description, amount, balance) {
  return {
    id: `PB-${Date.now()}`,
    date: new Date().toISOString(),
    type,
    description,
    amount,
    balance
  };
}

function addTransaction(type, description, amount) {
  const state = getState();
  const newBalance = Number((state.user.balance + amount).toFixed(2));
  state.user.balance = newBalance;

  const transaction = buildTransaction(type, description, amount, newBalance);
  state.transactions.unshift(transaction);
  saveState(state);
  renderAccountInfo();
  return transaction;
}

function closeModal(modalId) {
  const modalElement = document.getElementById(modalId);
  const modal = bootstrap.Modal.getInstance(modalElement);

  if (modal) {
    modal.hide();
  }
}

function generateReceipt(transaction) {
  const state = getState();
  const { jsPDF } = window.jspdf;
  const receipt = new jsPDF();

  receipt.setFont('helvetica', 'bold');
  receipt.setFontSize(18);
  receipt.text('Pokemon Bank', 20, 22);
  receipt.setFontSize(12);
  receipt.text('Comprobante de transaccion', 20, 32);

  receipt.setFont('helvetica', 'normal');
  receipt.text(`Cliente: ${state.user.name}`, 20, 48);
  receipt.text(`Cuenta: ${state.user.account}`, 20, 58);
  receipt.text(`Codigo: ${transaction.id}`, 20, 68);
  receipt.text(`Fecha: ${formatDate(transaction.date)}`, 20, 78);
  receipt.text(`Tipo: ${transaction.type}`, 20, 88);
  receipt.text(`Detalle: ${transaction.description}`, 20, 98);
  receipt.text(`Monto: ${money.format(Math.abs(transaction.amount))}`, 20, 108);
  receipt.text(`Saldo resultante: ${money.format(transaction.balance)}`, 20, 118);

  receipt.setFontSize(10);
  receipt.text('Gracias por usar Pokemon Bank.', 20, 140);
  receipt.save(`comprobante-${transaction.id}.pdf`);
}

function formatDate(value) {
  return new Intl.DateTimeFormat('es-SV', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(value));
}

function askForReceipt(transaction, title) {
  swal({
    title,
    text: `${transaction.description}\nSaldo actual: ${money.format(transaction.balance)}`,
    icon: 'success',
    buttons: {
      cancel: 'Aceptar',
      pdf: {
        text: 'Imprimir PDF',
        value: 'pdf'
      }
    }
  }).then((value) => {
    if (value === 'pdf') {
      generateReceipt(transaction);
    }
  });
}

function handleLoginPage() {
  const pinInputs = Array.from(document.querySelectorAll('[data-pin-input]'));
  const keys = document.querySelectorAll('[data-key]');
  const clearButton = document.querySelector('[data-clear-pin]');
  const submitButton = document.querySelector('[data-submit-pin]');
  const forgotButton = document.querySelector('[data-forgot-pin]');

  function getPin() {
    return pinInputs.map((input) => input.value).join('');
  }

  function setNextDigit(value) {
    const emptyInput = pinInputs.find((input) => input.value === '');
    if (emptyInput) {
      emptyInput.value = value;
      emptyInput.focus();
    }
  }

  function clearPin() {
    pinInputs.forEach((input) => {
      input.value = '';
      input.removeAttribute('aria-invalid');
    });
    pinInputs[0].focus();
  }

  pinInputs.forEach((input, index) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '').slice(0, 1);
      if (input.value && pinInputs[index + 1]) {
        pinInputs[index + 1].focus();
      }
    });

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Backspace' && !input.value && pinInputs[index - 1]) {
        pinInputs[index - 1].focus();
      }
    });
  });

  keys.forEach((key) => {
    key.addEventListener('click', () => setNextDigit(key.dataset.key));
  });

  clearButton.addEventListener('click', clearPin);

  submitButton.addEventListener('click', () => {
    const state = getState();
    const pin = getPin();
    const errors = validate.single(pin, {
      presence: { allowEmpty: false, message: '^Ingrese su PIN.' },
      format: {
        pattern: /^\d{4}$/,
        message: '^El PIN debe tener 4 digitos.'
      }
    });

    if (errors) {
      pinInputs.forEach((input) => input.setAttribute('aria-invalid', 'true'));
      swal('PIN incompleto', errors[0], 'warning');
      return;
    }

    if (pin !== state.user.pin) {
      pinInputs.forEach((input) => input.setAttribute('aria-invalid', 'true'));
      swal('Acceso denegado', 'El PIN ingresado no coincide con el usuario de prueba.', 'error');
      clearPin();
      return;
    }

    sessionStorage.setItem(SESSION_KEY, 'active');
    window.location.href = 'acciones.html';
  });

  forgotButton.addEventListener('click', () => {
    swal('PIN de prueba', 'Use el PIN 1234 para ingresar como Ash Ketchum.', 'info');
  });
}

function handleActionsPage() {
  const depositInput = document.getElementById('montoDeposito');
  const withdrawInput = document.getElementById('montoRetiro');
  const paymentInput = document.getElementById('montoPago');
  const serviceInput = document.getElementById('servicio');

  document.querySelector('[data-action="deposit"]').addEventListener('click', () => {
    const amount = validateAmount(depositInput);
    if (amount === null) return;

    const transaction = addTransaction('Deposito', 'Deposito en cajero Pokemon Bank', amount);
    depositInput.value = '';
    closeModal('modalDepositar');
    askForReceipt(transaction, 'Deposito realizado');
  });

  document.querySelectorAll('[data-quick-amount]').forEach((button) => {
    button.addEventListener('click', () => {
      withdrawInput.value = button.dataset.quickAmount;
      withdrawInput.focus();
    });
  });

  document.querySelector('[data-action="withdraw"]').addEventListener('click', () => {
    const amount = validateAmount(withdrawInput);
    const state = getState();
    if (amount === null) return;

    if (amount > state.user.balance) {
      showFieldError(withdrawInput, 'No posee saldo suficiente para este retiro.');
      swal('Saldo insuficiente', 'Ingrese un monto menor o igual al saldo disponible.', 'warning');
      return;
    }

    const transaction = addTransaction('Retiro', 'Retiro en cajero Pokemon Bank', amount * -1);
    withdrawInput.value = '';
    closeModal('modalRetirar');
    askForReceipt(transaction, 'Retiro realizado');
  });

  document.querySelector('[data-action="consult"]').addEventListener('click', () => {
    const state = getState();
    const transaction = addTransaction('Consulta', 'Consulta de saldo', 0);
    closeModal('modalConsultar');
    swal({
      title: 'Saldo disponible',
      text: `${state.user.name}, su saldo actual es ${money.format(state.user.balance)}.`,
      icon: 'info',
      buttons: {
        cancel: 'Aceptar',
        pdf: {
          text: 'Imprimir PDF',
          value: 'pdf'
        }
      }
    }).then((value) => {
      if (value === 'pdf') {
        generateReceipt(transaction);
      }
    });
  });

  document.querySelector('[data-action="payment"]').addEventListener('click', () => {
    clearFieldError(serviceInput);
    const serviceError = validate.single(serviceInput.value, {
      presence: { allowEmpty: false, message: '^Seleccione el servicio a pagar.' }
    });
    const amount = validateAmount(paymentInput);
    const state = getState();

    if (serviceError) {
      showFieldError(serviceInput, serviceError[0]);
      serviceInput.focus();
      return;
    }

    if (amount === null) return;

    if (amount > state.user.balance) {
      showFieldError(paymentInput, 'No posee saldo suficiente para pagar este servicio.');
      swal('Saldo insuficiente', 'Ingrese un monto menor o igual al saldo disponible.', 'warning');
      return;
    }

    const selectedService = serviceInput.options[serviceInput.selectedIndex].text;
    const transaction = addTransaction('Pago', selectedService, amount * -1);
    paymentInput.value = '';
    serviceInput.value = '';
    closeModal('modalPagar');
    askForReceipt(transaction, 'Pago realizado');
  });

}

function renderHistoryPage() {
  const historyBody = document.querySelector('[data-history-body]');
  const state = getState();

  if (!state.transactions.length) {
    historyBody.innerHTML = `
      <tr>
        <td colspan="5" class="pb-empty-state">Aun no hay transacciones registradas.</td>
      </tr>
    `;
    return;
  }

  historyBody.innerHTML = state.transactions.map((transaction) => {
    const amountClass = transaction.amount > 0 ? 'pb-amount-positive' : transaction.amount < 0 ? 'pb-amount-negative' : '';
    const prefix = transaction.amount > 0 ? '+' : transaction.amount < 0 ? '-' : '';

    return `
      <tr>
        <td>${formatDate(transaction.date)}</td>
        <td>${transaction.type}</td>
        <td>${transaction.description}</td>
        <td class="${amountClass}">${prefix}${money.format(Math.abs(transaction.amount))}</td>
        <td>${money.format(transaction.balance)}</td>
      </tr>
    `;
  }).join('');
}

function renderChartPage() {
  const state = getState();
  const counts = ['Deposito', 'Retiro', 'Pago', 'Consulta'].map((type) => {
    return state.transactions.filter((transaction) => transaction.type === type).length;
  });

  const chartCanvas = document.getElementById('chartTransacciones');
  const totalTransactions = counts.reduce((total, count) => total + count, 0);

  document.querySelector('[data-chart-total]').textContent = totalTransactions;
  document.querySelector('[data-chart-empty]').hidden = totalTransactions > 0;

  new Chart(chartCanvas, {
    type: 'bar',
    data: {
      labels: ['Depositos', 'Retiros', 'Pagos', 'Consultas'],
      datasets: [{
        label: 'Numero de transacciones',
        data: counts,
        backgroundColor: ['#2e7d32', '#c62828', '#3154a4', '#f5b700'],
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  requireSession();
  const page = document.body.dataset.page;

  if (page === 'login') {
    handleLoginPage();
    return;
  }

  renderAccountInfo();
  bindLogout();

  if (page === 'actions') {
    handleActionsPage();
  }

  if (page === 'history') {
    renderHistoryPage();
  }

  if (page === 'chart') {
    renderChartPage();
  }
});
