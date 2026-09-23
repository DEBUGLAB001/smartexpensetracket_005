document.addEventListener('DOMContentLoaded', async () => {
    if (!api.getToken()) {
        window.location.href = 'index.html';
        return;
    }

    // Load initial data
    await loadProfile();
    await loadDashboardData();

    // Event Listeners
    document.getElementById('btn-logout').addEventListener('click', () => {
        api.logout();
    });

    const modal = document.getElementById('modal-expense');
    document.getElementById('btn-add-expense').addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    });

    // Form submission
    document.getElementById('form-expense').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const type = document.getElementById('exp-type').value;
        const walletId = document.getElementById('exp-wallet').value;
        const title = document.getElementById('exp-title').value;
        const amount = document.getElementById('exp-amount').value;
        const category = document.getElementById('exp-category').value;
        
        try {
            await api.request('/expenses', 'POST', { type, walletId, title, amount: Number(amount), category });
            modal.classList.add('hidden');
            document.getElementById('form-expense').reset();
            loadDashboardData();
        } catch (error) {
            console.error(error);
        }
    });

    // Wallets and Budgets are created dynamically via prompt for simplicity in this frontend
    document.getElementById('btn-add-wallet').addEventListener('click', async () => {
        const name = prompt('Wallet Name (e.g. Cash, Bank):');
        const balance = prompt('Initial Balance (e.g. 100):');
        if (name && balance) {
            await api.request('/wallets', 'POST', { walletName: name, balance: Number(balance) });
            loadDashboardData();
        }
    });

    document.getElementById('btn-add-budget').addEventListener('click', async () => {
        const category = prompt('Category (e.g. Food, Travel):');
        const limit = prompt('Monthly Limit:');
        const date = new Date();
        if (category && limit) {
            await api.request('/budgets', 'POST', { 
                category, 
                monthlyLimit: Number(limit), 
                month: date.getMonth() + 1, 
                year: date.getFullYear() 
            });
            loadDashboardData();
        }
    });
});

async function loadProfile() {
    try {
        const data = await api.request('/auth/profile');
        document.getElementById('user-name-display').textContent = `Hello, ${data.user.name}`;
    } catch (err) {
        api.logout();
    }
}

async function loadDashboardData() {
    try {
        const wallets = await api.request('/wallets');
        const budgets = await api.request('/budgets');
        const expenses = await api.request('/expenses');
        const summary = await api.request('/reports/summary');

        renderSummary(summary);
        renderWallets(wallets);
        renderBudgets(budgets);
        renderExpenses(expenses);
    } catch (err) {
        console.error('Failed to load dashboard', err);
    }
}

function renderSummary(summary) {
    document.getElementById('summary-balance').textContent = `$${summary.remainingBalance.toFixed(2)}`;
    document.getElementById('summary-income').textContent = `+$${summary.totalIncome.toFixed(2)}`;
    document.getElementById('summary-expense').textContent = `-$${summary.totalExpense.toFixed(2)}`;
}

function renderWallets(wallets) {
    const list = document.getElementById('wallets-list');
    const select = document.getElementById('exp-wallet');
    list.innerHTML = '';
    select.innerHTML = '';
    
    if (wallets.length === 0) {
        list.innerHTML = '<li><span class="text-secondary">No wallets yet. Click + New to add one.</span></li>';
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No wallets available (Add one first)';
        option.disabled = true;
        option.selected = true;
        select.appendChild(option);
        return;
    }
    
    wallets.forEach(w => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${w.walletName}</span> <strong>$${w.balance.toFixed(2)}</strong>`;
        list.appendChild(li);

        const option = document.createElement('option');
        option.value = w.id;
        option.textContent = w.walletName;
        select.appendChild(option);
    });
}

function renderBudgets(budgets) {
    const list = document.getElementById('budgets-list');
    list.innerHTML = '';
    
    budgets.forEach(b => {
        const div = document.createElement('div');
        div.className = 'budget-item';
        
        // Progress bar percentage calculation: (spent / limit) * 100
        const percentage = ((b.spentAmount || 0) / (b.monthlyLimit || 1)) * 100;
        const boundedPercent = Math.min(Math.max(percentage, 0), 100);

        div.innerHTML = `
            <div class="budget-info">
                <span>${b.category}</span>
                <span>$${b.spentAmount} / $${b.monthlyLimit}</span>
            </div>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${boundedPercent}%; ${b.exceeded ? 'background: var(--danger);' : ''}"></div>
            </div>
        `;
        list.appendChild(div);
    });
}

function renderExpenses(expenses) {
    const list = document.getElementById('transactions-list');
    list.innerHTML = '';
    
    // Sort by newest
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    expenses.slice(0, 10).forEach(e => {
        const tr = document.createElement('tr');
        const isIncome = e.type === 'income';
        const colorClass = isIncome ? 'text-success' : '';
        const sign = isIncome ? '+' : '-';
        
        const date = new Date(e.date).toLocaleDateString();
        
        tr.innerHTML = `
            <td>${e.title}</td>
            <td>${e.category || '-'}</td>
            <td>${date}</td>
            <td class="${colorClass}">${sign}$${Number(e.amount).toFixed(2)}</td>
            <td><button class="btn-sm" onclick="deleteExpense('${e.id}')">Delete</button></td>
        `;
        list.appendChild(tr);
    });
}

window.deleteExpense = async (id) => {
    if (confirm('Delete this transaction?')) {
        try {
            await api.request(`/expenses/${id}`, 'DELETE');
            loadDashboardData();
        } catch (err) {
            console.error(err);
        }
    }
};
