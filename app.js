/**
 * BankSphere AI - Application Logic & State Management
 * Tagline: Smart Banking. Smarter Decisions.
 */

// Application Global State
const getInitialTheme = () => {
  try {
    return (typeof localStorage !== 'undefined' && localStorage.getItem('banksphere_theme')) || 'dark';
  } catch (e) {
    return 'dark';
  }
};

const state = {
  theme: getInitialTheme(),
  currency: 'USD',
  currencyRates: {
    USD: { symbol: '$', rate: 1.0 },
    EUR: { symbol: '€', rate: 0.92 },
    GBP: { symbol: '£', rate: 0.79 },
    JPY: { symbol: '¥', rate: 152.4 },
    CAD: { symbol: 'CA$', rate: 1.36 }
  },
  accounts: {
    checking: 28450.75,
    savings: 84320.10,
    vault: 24150.00,
    investments: 12000.00
  },
  card: {
    isFrozen: false,
    limit: 10000,
    spentThisMonth: 3420.50,
    number: '4890 •••• •••• 8219',
    realNumber: '4890 3290 8472 8219',
    cvv: '849',
    exp: '09/29',
    pin: '7392'
  },
  transactions: [
    { id: 'TX-9021', name: 'OpenAI API Services', category: 'Technology & Cloud', amount: -184.20, date: 'Today, 2:40 PM', type: 'expense', icon: '⚡' },
    { id: 'TX-9020', name: 'Client Inflow: Vertex Labs Wire', category: 'Business Revenue', amount: 14500.00, date: 'Today, 11:15 AM', type: 'income', icon: '🏢' },
    { id: 'TX-9019', name: 'Whole Foods Market', category: 'Groceries & Living', amount: -94.35, date: 'Yesterday', type: 'expense', icon: '🛒' },
    { id: 'TX-9018', name: 'SphereAI Automated High-Yield Yield', category: 'Yield & Dividends', amount: 379.44, date: 'Nov 14, 2026', type: 'income', icon: '📈' },
    { id: 'TX-9017', name: 'Uber Black Ride', category: 'Travel & Mobility', amount: -62.10, date: 'Nov 13, 2026', type: 'expense', icon: '🚗' },
    { id: 'TX-9016', name: 'Stripe Merchant Payout', category: 'Revenue', amount: 6840.00, date: 'Nov 12, 2026', type: 'income', icon: '💳' },
    { id: 'TX-9015', name: 'Equinox Gym Club', category: 'Wellness & Health', amount: -280.00, date: 'Nov 11, 2026', type: 'expense', icon: '🏋️' }
  ],
  charts: {
    cashflow: null,
    categories: null
  }
};

// Formatting Helper
function formatMoney(amount, currency = state.currency) {
  const info = state.currencyRates[currency] || state.currencyRates.USD;
  const converted = amount * info.rate;
  
  if (currency === 'JPY') {
    return `${info.symbol}${Math.round(converted).toLocaleString()}`;
  }
  return `${info.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Calculate Total Net Worth
function getTotalNetWorth() {
  return state.accounts.checking + state.accounts.savings + state.accounts.vault + state.accounts.investments;
}

// Initialize Application on DOM Ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    initCalculators();
    initPortal();
    initCharts();
    initModals();
    initAIChat();
    initCardInteractions();
    updateFinancialDisplays();
  });
}

/* ==========================================================================
   Theme Management (Dark / Light)
   ========================================================================== */
function initTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  const themeToggle = document.getElementById('themeToggleBtn');
  if (themeToggle) {
    updateThemeIcon(themeToggle);
    themeToggle.addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', state.theme);
      localStorage.setItem('banksphere_theme', state.theme);
      updateThemeIcon(themeToggle);
      if (state.charts.cashflow) {
        state.charts.cashflow.destroy();
        state.charts.categories.destroy();
        initCharts();
      }
    });
  }
}

function updateThemeIcon(btn) {
  if (state.theme === 'light') {
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    btn.setAttribute('title', 'Switch to Dark Mode');
  } else {
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
    btn.setAttribute('title', 'Switch to Light Mode');
  }
}

/* ==========================================================================
   Navigation & Scroll Effects
   ========================================================================== */
function initNavigation() {
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.querySelector('.nav-links');
  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });
  }

  // Smooth scroll links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Currency select change
  const currencySelector = document.getElementById('currencySelector');
  if (currencySelector) {
    currencySelector.addEventListener('change', (e) => {
      state.currency = e.target.value;
      updateFinancialDisplays();
      updateCalculatorResults();
      updateLoanResults();
    });
  }
}

/* ==========================================================================
   Interactive Calculators (Compound Growth & Loan Simulator)
   ========================================================================== */
function initCalculators() {
  // Savings Growth Inputs
  const initDepositSlider = document.getElementById('savingsInitial');
  const monthlyDepositSlider = document.getElementById('savingsMonthly');
  const yearsSlider = document.getElementById('savingsYears');
  const apyRateInput = document.getElementById('savingsApy');

  const updateSavings = () => {
    if (!initDepositSlider) return;
    document.getElementById('savingsInitialVal').textContent = formatMoney(parseFloat(initDepositSlider.value));
    document.getElementById('savingsMonthlyVal').textContent = formatMoney(parseFloat(monthlyDepositSlider.value)) + '/mo';
    document.getElementById('savingsYearsVal').textContent = yearsSlider.value + ' Years';
    document.getElementById('savingsApyVal').textContent = apyRateInput.value + '% APY';

    updateCalculatorResults();
  };

  [initDepositSlider, monthlyDepositSlider, yearsSlider, apyRateInput].forEach(elem => {
    if (elem) elem.addEventListener('input', updateSavings);
  });

  // Loan & Credit Inputs
  const loanAmountSlider = document.getElementById('loanAmount');
  const loanTenureSlider = document.getElementById('loanTenure');

  const updateLoan = () => {
    if (!loanAmountSlider) return;
    document.getElementById('loanAmountVal').textContent = formatMoney(parseFloat(loanAmountSlider.value));
    document.getElementById('loanTenureVal').textContent = loanTenureSlider.value + ' Months';
    updateLoanResults();
  };

  [loanAmountSlider, loanTenureSlider].forEach(elem => {
    if (elem) elem.addEventListener('input', updateLoan);
  });

  // Run initial calculations
  updateSavings();
  updateLoan();
}

function updateCalculatorResults() {
  const p = parseFloat(document.getElementById('savingsInitial')?.value || 10000);
  const pmt = parseFloat(document.getElementById('savingsMonthly')?.value || 1000);
  const years = parseInt(document.getElementById('savingsYears')?.value || 10);
  const r = (parseFloat(document.getElementById('savingsApy')?.value || 5.4) / 100) / 12;
  const n = years * 12;

  // Future Value of initial sum + Future Value of series annuity
  const fvInitial = p * Math.pow(1 + r, n);
  const fvSeries = pmt * ((Math.pow(1 + r, n) - 1) / r);
  const totalFutureValue = fvInitial + fvSeries;
  const totalPrincipal = p + (pmt * n);
  const totalInterest = totalFutureValue - totalPrincipal;

  const totalElem = document.getElementById('calcTotalValue');
  const interestElem = document.getElementById('calcInterestEarned');

  if (totalElem) totalElem.textContent = formatMoney(totalFutureValue);
  if (interestElem) interestElem.textContent = '+' + formatMoney(totalInterest);
}

function updateLoanResults() {
  const principal = parseFloat(document.getElementById('loanAmount')?.value || 25000);
  const months = parseInt(document.getElementById('loanTenure')?.value || 36);
  const apr = 0.059; // 5.9% AI prime rate
  const monthlyRate = apr / 12;

  const monthlyPayment = (principal * (monthlyRate * Math.pow(1 + monthlyRate, months))) / (Math.pow(1 + monthlyRate, months) - 1);
  const totalPayable = monthlyPayment * months;
  const totalInterest = totalPayable - principal;

  const monthlyElem = document.getElementById('loanMonthlyPayment');
  const interestElem = document.getElementById('loanTotalCost');
  const approvalElem = document.getElementById('loanApprovalRate');

  if (monthlyElem) monthlyElem.textContent = formatMoney(monthlyPayment) + '/mo';
  if (interestElem) interestElem.textContent = formatMoney(totalInterest);
  if (approvalElem) {
    const score = principal > 75000 ? '94% Prime' : '99% Instant Pre-Approved';
    approvalElem.textContent = score;
  }
}

/* ==========================================================================
   Financial Displays & Portal Updates
   ========================================================================== */
function updateFinancialDisplays() {
  const netWorth = getTotalNetWorth();
  
  // Dashboard & Header Balances
  const elTotal = document.getElementById('portalTotalBalance');
  const elChecking = document.getElementById('portalCheckingBalance');
  const elSavings = document.getElementById('portalSavingsBalance');
  const elVault = document.getElementById('portalVaultBalance');

  if (elTotal) elTotal.textContent = formatMoney(netWorth);
  if (elChecking) elChecking.textContent = formatMoney(state.accounts.checking);
  if (elSavings) elSavings.textContent = formatMoney(state.accounts.savings);
  if (elVault) elVault.textContent = formatMoney(state.accounts.vault);

  // Render Transactions Table
  renderTransactions();
}

function renderTransactions(filter = 'all') {
  const container = document.getElementById('txTableBody');
  if (!container) return;

  container.innerHTML = '';
  const filtered = state.transactions.filter(tx => {
    if (filter === 'income') return tx.type === 'income';
    if (filter === 'expense') return tx.type === 'expense';
    return true;
  });

  filtered.forEach(tx => {
    const row = document.createElement('tr');
    const isPos = tx.type === 'income';
    const sign = isPos ? '+' : '';
    const amtClass = isPos ? 'tx-pos' : 'tx-neg';

    row.innerHTML = `
      <td>
        <div class="tx-merchant">
          <div class="tx-icon-circle">${tx.icon}</div>
          <div>
            <div class="tx-name">${tx.name}</div>
            <div class="tx-category">${tx.category} • <span style="opacity: 0.7;">${tx.id}</span></div>
          </div>
        </div>
      </td>
      <td style="color: var(--text-secondary);">${tx.date}</td>
      <td>
        <span class="badge ${isPos ? 'badge-emerald' : 'badge-indigo'}" style="font-size: 0.7rem; padding: 0.2rem 0.5rem;">
          ${isPos ? 'Verified Inflow' : 'AI Cleared'}
        </span>
      </td>
      <td class="tx-amount ${amtClass}" style="text-align: right;">
        ${sign}${formatMoney(Math.abs(tx.amount))}
      </td>
    `;
    container.appendChild(row);
  });
}

/* ==========================================================================
   Card Management (Lock/Unlock, Details Reveal)
   ========================================================================== */
function initCardInteractions() {
  const freezeBtn = document.getElementById('cardFreezeToggle');
  const cardBadge = document.getElementById('cardStatusBadge');
  const cardNumDisplay = document.getElementById('liveCardNumber');
  const revealPinBtn = document.getElementById('cardRevealPinBtn');
  const cardPinDisplay = document.getElementById('cardPinDisplay');

  if (freezeBtn) {
    freezeBtn.addEventListener('click', () => {
      state.card.isFrozen = !state.card.isFrozen;
      if (state.card.isFrozen) {
        freezeBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> Unfreeze Card`;
        freezeBtn.classList.remove('btn-secondary');
        freezeBtn.classList.add('btn-emerald');
        if (cardBadge) {
          cardBadge.textContent = 'FROZEN';
          cardBadge.className = 'badge badge-gold';
        }
        showNotification('Card Security', 'Your physical and virtual card has been temporarily frozen. Zero transactions will be permitted.');
      } else {
        freezeBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> Freeze Card`;
        freezeBtn.classList.remove('btn-emerald');
        freezeBtn.classList.add('btn-secondary');
        if (cardBadge) {
          cardBadge.textContent = 'ACTIVE';
          cardBadge.className = 'badge badge-emerald';
        }
        showNotification('Card Activated', 'Your BankSphere card is active and ready for tap, chip, or online payments.');
      }
    });
  }

  if (revealPinBtn && cardPinDisplay) {
    let pinRevealed = false;
    revealPinBtn.addEventListener('click', () => {
      pinRevealed = !pinRevealed;
      if (pinRevealed) {
        cardPinDisplay.textContent = state.card.pin;
        revealPinBtn.textContent = 'Hide PIN';
      } else {
        cardPinDisplay.textContent = '••••';
        revealPinBtn.textContent = 'View PIN';
      }
    });
  }

  // Copy card number with visual feedback
  const copyCardBtn = document.getElementById('copyCardNumBtn');
  if (copyCardBtn) {
    copyCardBtn.addEventListener('click', () => {
      navigator.clipboard?.writeText(state.card.realNumber.replace(/\s+/g, ''));
      showNotification('Copied to Clipboard', `Card number ${state.card.realNumber} copied securely.`);
    });
  }
}

/* ==========================================================================
   Portal Tabs & Navigation
   ========================================================================== */
function initPortal() {
  const navBtns = document.querySelectorAll('.portal-nav-item button');
  navBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      navBtns.forEach(b => b.parentElement.classList.remove('active'));
      btn.parentElement.classList.add('active');
      const tabName = btn.getAttribute('data-tab');
      // Simulated tab switch feedback
      showNotification('BankSphere AI Portal', `Switched view to ${btn.textContent.trim()}`);
    });
  });

  // Filter transaction buttons
  const filterBtns = document.querySelectorAll('.tx-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      renderTransactions(filter);
    });
  });

  // Quick Switch Portal / Landing Page
  const portalToggle = document.getElementById('navPortalToggle');
  const portalSection = document.getElementById('portalSection');
  if (portalToggle && portalSection) {
    portalToggle.addEventListener('click', () => {
      portalSection.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

/* ==========================================================================
   Interactive Modals (Send Money & Open Account)
   ========================================================================== */
function initModals() {
  // Modal openers
  const openTransferBtns = document.querySelectorAll('[data-action="open-transfer"]');
  const transferModal = document.getElementById('transferModal');

  const openAccountBtns = document.querySelectorAll('[data-action="open-account"]');
  const accountModal = document.getElementById('openAccountModal');

  const closeBtns = document.querySelectorAll('.modal-close');

  openTransferBtns.forEach(b => {
    b.addEventListener('click', () => {
      transferModal.classList.add('active');
    });
  });

  openAccountBtns.forEach(b => {
    b.addEventListener('click', () => {
      accountModal.classList.add('active');
    });
  });

  closeBtns.forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    });
  });

  // Close when clicking outside modal box
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });

  // Send Money Form Submit
  const transferForm = document.getElementById('transferForm');
  if (transferForm) {
    transferForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const recipient = document.getElementById('transferRecipient').value.trim();
      const amount = parseFloat(document.getElementById('transferAmount').value);
      const note = document.getElementById('transferNote').value.trim() || 'Instant AI Wire';

      if (!recipient || isNaN(amount) || amount <= 0) {
        alert('Please specify a valid recipient and positive amount.');
        return;
      }

      if (amount > state.accounts.checking) {
        alert(`Insufficient checking balance. You have ${formatMoney(state.accounts.checking)} available.`);
        return;
      }

      // Deduct and add transaction
      state.accounts.checking -= amount;
      const newTx = {
        id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
        name: recipient,
        category: 'Instant Smart Transfer',
        amount: -amount,
        date: 'Just now',
        type: 'expense',
        icon: '💸'
      };

      state.transactions.unshift(newTx);
      updateFinancialDisplays();
      transferModal.classList.remove('active');
      transferForm.reset();

      showNotification('Transfer Cleared', `Successfully sent ${formatMoney(amount)} to ${recipient} via Sphere Rail. AI Fraud Risk: 0.00% (Instant Settlement)`);
    });
  }

  // Open Account Form Submit
  const accountForm = document.getElementById('accountForm');
  if (accountForm) {
    accountForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('accName').value.trim();
      const email = document.getElementById('accEmail').value.trim();
      const initialDeposit = parseFloat(document.getElementById('accDeposit').value || 1000);

      accountModal.classList.remove('active');
      accountForm.reset();

      // Bump balances
      state.accounts.checking += initialDeposit;
      state.transactions.unshift({
        id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
        name: 'Initial Account Deposit',
        category: 'Funding & Capital',
        amount: initialDeposit,
        date: 'Just now',
        type: 'income',
        icon: '💎'
      });

      updateFinancialDisplays();
      showNotification('Welcome to BankSphere AI!', `Congratulations ${name}! Your AI High-Yield Treasury account is active with an initial deposit of ${formatMoney(initialDeposit)}.`);
    });
  }
}

/* ==========================================================================
   Chart.js Visualizations (Cash Flow & Expenses)
   ========================================================================== */
function initCharts() {
  const isDark = state.theme === 'dark';
  const textColor = isDark ? '#94A3B8' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  // Cashflow Line Chart
  const cashflowCtx = document.getElementById('cashflowChart')?.getContext('2d');
  if (cashflowCtx) {
    const gradient = cashflowCtx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, 'rgba(0, 242, 254, 0.35)');
    gradient.addColorStop(1, 'rgba(0, 242, 254, 0.0)');

    state.charts.cashflow = new Chart(cashflowCtx, {
      type: 'line',
      data: {
        labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov (Live)'],
        datasets: [
          {
            label: 'Inflow & Treasury Yield ($)',
            data: [18200, 22400, 21800, 28900, 31200, 38450],
            borderColor: '#00F2FE',
            backgroundColor: gradient,
            fill: true,
            tension: 0.42,
            borderWidth: 3,
            pointBackgroundColor: '#00F2FE',
            pointRadius: 4,
            pointHoverRadius: 7
          },
          {
            label: 'Outflow & Operating Expenses ($)',
            data: [9400, 11200, 10500, 13100, 12800, 14200],
            borderColor: '#6366F1',
            borderDash: [5, 5],
            fill: false,
            tension: 0.42,
            borderWidth: 2,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11 } }
          },
          tooltip: {
            backgroundColor: 'rgba(13, 20, 36, 0.95)',
            titleColor: '#F8FAFC',
            bodyColor: '#38BDF8',
            borderColor: 'rgba(0, 242, 254, 0.3)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11 } }
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              font: { family: 'Plus Jakarta Sans', size: 11 },
              callback: value => '$' + (value / 1000) + 'k'
            }
          }
        }
      }
    });
  }

  // Category Doughnut Chart
  const catCtx = document.getElementById('categoryChart')?.getContext('2d');
  if (catCtx) {
    state.charts.categories = new Chart(catCtx, {
      type: 'doughnut',
      data: {
        labels: ['Cloud & AI Tools', 'Salaries & Payroll', 'Marketing & Ads', 'Living & Travel', 'Automated Savings'],
        datasets: [{
          data: [32, 28, 16, 12, 12],
          backgroundColor: [
            '#00F2FE',
            '#4FACFE',
            '#6366F1',
            '#10B981',
            '#F59E0B'
          ],
          borderWidth: 2,
          borderColor: isDark ? '#0D1424' : '#FFFFFF',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11 }, boxWidth: 12 }
          }
        },
        cutout: '72%'
      }
    });
  }
}

/* ==========================================================================
   SphereAI Assistant Conversational Widget
   ========================================================================== */
function initAIChat() {
  const launcher = document.getElementById('aiChatLauncher');
  const chatWindow = document.getElementById('aiChatWindow');
  const closeBtn = document.getElementById('aiChatClose');
  const sendBtn = document.getElementById('aiChatSend');
  const input = document.getElementById('aiChatInput');
  const messagesBox = document.getElementById('aiChatMessages');

  if (launcher && chatWindow) {
    launcher.addEventListener('click', () => {
      chatWindow.classList.toggle('hidden');
      if (!chatWindow.classList.contains('hidden')) {
        input?.focus();
      }
    });
  }

  if (closeBtn && chatWindow) {
    closeBtn.addEventListener('click', () => {
      chatWindow.classList.add('hidden');
    });
  }

  const handleSend = () => {
    const text = input.value.trim();
    if (!text) return;

    appendChatMessage('user', text);
    input.value = '';

    // Simulate AI thinking and reply
    setTimeout(() => {
      const reply = generateAIResponse(text);
      appendChatMessage('assistant', reply);
      messagesBox.scrollTop = messagesBox.scrollHeight;
    }, 600);
  };

  if (sendBtn && input) {
    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }

  // Suggestion chips
  document.querySelectorAll('.chat-suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      input.value = prompt;
      handleSend();
    });
  });
}

function appendChatMessage(sender, text) {
  const box = document.getElementById('aiChatMessages');
  if (!box) return;

  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${sender}`;
  bubble.innerHTML = text;
  box.appendChild(bubble);
  box.scrollTop = box.scrollHeight;
}

function generateAIResponse(query) {
  const q = query.toLowerCase();
  const netWorth = getTotalNetWorth();

  if (q.includes('balance') || q.includes('worth') || q.includes('how much')) {
    return `Your aggregate net worth across all BankSphere accounts is <strong>${formatMoney(netWorth)}</strong>. This includes <strong>${formatMoney(state.accounts.checking)}</strong> in checking and <strong>${formatMoney(state.accounts.savings)}</strong> earning 5.4% APY.`;
  }
  
  if (q.includes('apy') || q.includes('savings') || q.includes('interest')) {
    const monthlyYield = (state.accounts.savings * 0.054) / 12;
    return `BankSphere AI provides an industry-leading <strong>5.4% APY</strong> backed by our institutional partner treasury network. At your current savings balance, you are generating approximately <strong>${formatMoney(monthlyYield)}/month</strong> in risk-free yield.`;
  }

  if (q.includes('freeze') || q.includes('lock') || q.includes('lost card')) {
    state.card.isFrozen = true;
    const freezeBtn = document.getElementById('cardFreezeToggle');
    if (freezeBtn) {
      freezeBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> Unfreeze Card`;
    }
    return `🔒 I have instantly locked your BankSphere Card ending in <strong>8219</strong>. All recurring charges and authorizations are suspended until you unlock it from your portal.`;
  }

  if (q.includes('cash flow') || q.includes('spending') || q.includes('analyze')) {
    return `📊 <strong>Cash Flow Analysis:</strong><br>Over the last 30 days, your net operating margin is <strong>+63.1%</strong>. Your largest single expense bucket is <em>Cloud & AI Infrastructure</em> ($2,840), which is within your budgeted parameters. I recommend sweeping $3,500 into your 5.4% APY vault for optimal compound interest.`;
  }

  if (q.includes('loan') || q.includes('borrow') || q.includes('credit')) {
    return `💡 Your BankSphere AI Credit Score is rated <strong>Prime A+ (98.4/100)</strong> based on your verified recurring revenue. You qualify for instant pre-approved credit lines up to <strong>$150,000</strong> at 5.9% fixed APR with 0 origination fees.`;
  }

  if (q.includes('fraud') || q.includes('security') || q.includes('safe')) {
    return `🛡️ BankSphere AI operates 24/7 autonomous fraud defenses: biometric hardware keys, zero-knowledge wire verification, and FDIC insurance protection up to <strong>$5,000,000</strong> through our program bank network.`;
  }

  return `I am your SphereAI Financial Copilot. I can optimize your cash flow, simulate high-yield investments, execute secure transfers, or adjust card limits in real time. Try asking: <em>"Analyze my spending"</em> or <em>"How does 5.4% APY work?"</em>`;
}

/* ==========================================================================
   Toast Notifications
   ========================================================================== */
function showNotification(title, message) {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.style.position = 'fixed';
    toastContainer.style.top = '25px';
    toastContainer.style.right = '25px';
    toastContainer.style.zIndex = '9999';
    toastContainer.style.display = 'flex';
    toastContainer.style.flexDirection = 'column';
    toastContainer.style.gap = '10px';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.style.background = 'rgba(13, 20, 36, 0.95)';
  toast.style.backdropFilter = 'blur(16px)';
  toast.style.border = '1px solid rgba(0, 242, 254, 0.4)';
  toast.style.borderRadius = '12px';
  toast.style.padding = '14px 18px';
  toast.style.color = '#FFFFFF';
  toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(0,242,254,0.25)';
  toast.style.maxWidth = '360px';
  toast.style.fontSize = '0.88rem';
  toast.style.transform = 'translateX(50px)';
  toast.style.opacity = '0';
  toast.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';

  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: #00F2FE; margin-bottom: 4px;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      <span>${title}</span>
    </div>
    <div style="color: #94A3B8; font-size: 0.82rem; line-height: 1.4;">${message}</div>
  `;

  toastContainer.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
  });

  // Remove after 4.5 seconds
  setTimeout(() => {
    toast.style.transform = 'translateX(50px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 350);
  }, 4500);
}
