// Simulação de banco de dados usando localStorage
let users = JSON.parse(localStorage.getItem('users')) || [];
let inventory = JSON.parse(localStorage.getItem('inventory')) || {
    equipment: [],
    vehicles: [],
    securityDevices: []
};
let activities = JSON.parse(localStorage.getItem('activities')) || [];
let profits = JSON.parse(localStorage.getItem('profits')) || [];

// Funções de autenticação
function register(event) {
    event.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const userType = document.getElementById('register-usertype').value;

    if (users.some(user => user.username === username)) {
        showNotification('Nome de usuário já existe', 'error');
        return;
    }

    const newUser = { username, email, password, userType };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    showNotification('Usuário registrado com sucesso!', 'success');
    window.location.href = 'index.html';
}

function login(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'dashboard.html';
    } else {
        showNotification('Usuário ou senha inválidos!', 'error');
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Funções do dashboard
function loadDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    loadRecentActivities();
    createSecurityChart();
    createResourcesChart();
    updateNavMenu();
}

function loadRecentActivities() {
    const recentActivitiesList = document.getElementById('recent-activities');
    if (!recentActivitiesList) return;

    recentActivitiesList.innerHTML = '';
    const recentActivities = activities.slice(-5).reverse();

    recentActivities.forEach(activity => {
        const li = document.createElement('li');
        li.textContent = `${activity.user} ${activity.action} - ${activity.timestamp}`;
        recentActivitiesList.appendChild(li);
    });
}

function createSecurityChart() {
    const ctx = document.getElementById('securityChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Incidentes', 'Alertas', 'Resolvidos'],
            datasets: [{
                label: 'Estatísticas de Segurança',
                data: [5, 10, 8],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function createResourcesChart() {
    const ctx = document.getElementById('resourcesChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Equipamentos', 'Veículos', 'Dispositivos de Segurança'],
            datasets: [{
                data: [
                    inventory.equipment.length,
                    inventory.vehicles.length,
                    inventory.securityDevices.length
                ],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
            }]
        },
        options: {
            responsive: true
        }
    });
}

// Funções de inventário
function loadInventory() {
    loadInventoryList('equipment', 'equipment-list');
    loadInventoryList('vehicles', 'vehicle-list');
    loadInventoryList('securityDevices', 'security-device-list');
    updateNavMenu();
}

function loadInventoryList(type, listId) {
    const list = document.getElementById(listId);
    if (!list) return;

    list.innerHTML = '';

    inventory[type].forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.name} - Qtd: ${item.quantity} - Valor: R$ ${item.value.toFixed(2)}</span>
            <div class="item-actions">
                <button onclick="editInventoryItem('${type}', ${index})"><i class="fas fa-edit"></i></button>
                <button onclick="deleteInventoryItem('${type}', ${index})"><i class="fas fa-trash"></i></button>
            </div>
        `;
        list.appendChild(li);
    });
}

function showAddItemModal(type) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('inventory-form');

    modalTitle.textContent = `Adicionar ${type === 'equipment' ? 'Equipamento' : type === 'vehicles' ? 'Veículo' : 'Dispositivo de Segurança'}`;
    form.onsubmit = (e) => addInventoryItem(e, type);

    modal.style.display = 'block';
}

function addInventoryItem(event, type) {
    event.preventDefault();
    const name = document.getElementById('item-name').value;
    const description = document.getElementById('item-description').value;
    const quantity = parseInt(document.getElementById('item-quantity').value);
    const value = parseFloat(document.getElementById('item-value').value);

    const newItem = { name, description, quantity, value };
    inventory[type].push(newItem);
    localStorage.setItem('inventory', JSON.stringify(inventory));

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    addActivity(currentUser.username, `adicionou um novo ${type === 'equipment' ? 'equipamento' : type === 'vehicles' ? 'veículo' : 'dispositivo de segurança'}`);

    loadInventory();
    closeModal();
    showNotification('Item adicionado com sucesso!', 'success');
    
    // Resetar o formulário
    document.getElementById('inventory-form').reset();
}

function editInventoryItem(type, index) {
    const item = inventory[type][index];
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('inventory-form');
    const nameInput = document.getElementById('item-name');
    const descriptionInput = document.getElementById('item-description');
    const quantityInput = document.getElementById('item-quantity');
    const valueInput = document.getElementById('item-value');

    modalTitle.textContent = `Editar ${type === 'equipment' ? 'Equipamento' : type === 'vehicles' ? 'Veículo' : 'Dispositivo de Segurança'}`;
    nameInput.value = item.name;
    descriptionInput.value = item.description;
    quantityInput.value = item.quantity;
    valueInput.value = item.value;

    form.onsubmit = (e) => {
        e.preventDefault();
        item.name = nameInput.value;
        item.description = descriptionInput.value;
        item.quantity = parseInt(quantityInput.value);
        item.value = parseFloat(valueInput.value);

        localStorage.setItem('inventory', JSON.stringify(inventory));
        loadInventory();
        closeModal();
        showNotification('Item atualizado com sucesso!', 'success');
    };

    modal.style.display = 'block';
}

function deleteInventoryItem(type, index) {
    if (confirm('Tem certeza que deseja excluir este item?')) {
        inventory[type].splice(index, 1);
        localStorage.setItem('inventory', JSON.stringify(inventory));
        loadInventory();
        showNotification('Item excluído com sucesso!', 'success');
    }
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
    document.getElementById('inventory-form').reset();
}

// Funções de atividades
function loadActivities() {
    const activitiesList = document.getElementById('activities-list');
    if (!activitiesList) return;

    activitiesList.innerHTML = '';
    activities.forEach((activity, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${activity.user} - ${activity.action} (${activity.type}) - ${activity.timestamp}</span>
            <div class="item-actions">
                <button onclick="deleteActivity(${index})"><i class="fas fa-trash"></i></button>
            </div>
        `;
        list.appendChild(li);
    });
    updateNavMenu();
}

function addActivity(user, action, type = 'Geral') {
    const activity = {
        user,
        action,
        type,
        timestamp: new Date().toLocaleString()
    };
    activities.push(activity);
    localStorage.setItem('activities', JSON.stringify(activities));
    loadActivities();
}

function deleteActivity(index) {
    if (confirm('Tem certeza que deseja excluir esta atividade?')) {
        activities.splice(index, 1);
        localStorage.setItem('activities', JSON.stringify(activities));
        loadActivities();
        showNotification('Atividade excluída com sucesso!', 'success');
    }
}

// Funções de lucros
function loadProfits() {
    const profitsList = document.getElementById('profits-list');
    if (!profitsList) return;

    profitsList.innerHTML = '';
    profits.forEach((profit, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>R$ ${profit.amount.toFixed(2)} - ${profit.description} - ${profit.timestamp}</span>
            <div class="item-actions">
                <button onclick="deleteProfit(${index})"><i class="fas fa-trash"></i></button>
            </div>
        `;
        profitsList.appendChild(li);
    });
    createProfitsChart();
    updateNavMenu();
}

function addProfit(event) {
    event.preventDefault();
    const amount = parseFloat(document.getElementById('profit-amount').value);
    const description = document.getElementById('profit-description').value;

    const profit = {
        amount,
        description,
        timestamp: new Date().toLocaleString()
    };
    profits.push(profit);
    localStorage.setItem('profits', JSON.stringify(profits));

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    addActivity(currentUser.username, `gerou um lucro de R$ ${amount.toFixed(2)}`, 'Financeiro');

    loadProfits();
    showNotification('Lucro gerado com sucesso!', 'success');
    document.getElementById('generate-profit-form').reset();
}

function deleteProfit(index) {
    if (confirm('Tem certeza que deseja excluir este registro de lucro?')) {
        profits.splice(index, 1);
        localStorage.setItem('profits', JSON.stringify(profits));
        loadProfits();
        showNotification('Registro de lucro excluído com sucesso!', 'success');
    }
}

function createProfitsChart() {
    const ctx = document.getElementById('profitsChart');
    if (!ctx) return;

    const monthlyProfits = profits.reduce((acc, profit) => {
        const date = new Date(profit.timestamp);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        acc[monthYear] = (acc[monthYear] || 0) + profit.amount;
        return acc;
    }, {});

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(monthlyProfits),
            datasets: [{
                label: 'Lucro Mensal',
                data: Object.values(monthlyProfits),
                borderColor: '#4CAF50',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value, index, values) {
                            return 'R$ ' + value.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

// Função de notificação
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.backgroundColor = type === 'error' ? '#F44336' : '#4CAF50';
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Controle de acesso
function updateNavMenu() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    const profitsLink = document.getElementById('profits-link');
    if (profitsLink) {
        profitsLink.style.display = currentUser.userType === 'owner' ? 'block' : 'none';
    }

    const addButtons = document.querySelectorAll('.add-btn');
    const itemActions = document.querySelectorAll('.item-actions');

    if (currentUser.userType === 'employee') {
        addButtons.forEach(btn => btn.style.display = 'none');
        itemActions.forEach(action => action.style.display = 'none');
    } else {
        addButtons.forEach(btn => btn.style.display = 'block');
        itemActions.forEach(action => action.style.display = 'flex');
    }
}

// Event listeners
if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', login);
}

if (document.getElementById('register-form')) {
    document.getElementById('register-form').addEventListener('submit', register);
}

if (document.getElementById('logout-btn')) {
    document.getElementById('logout-btn').addEventListener('click', logout);
}

if (document.getElementById('add-equipment')) {
    document.getElementById('add-equipment').addEventListener('click', () => showAddItemModal('equipment'));
}

if (document.getElementById('add-vehicle')) {
    document.getElementById('add-vehicle').addEventListener('click', () => showAddItemModal('vehicles'));
}

if (document.getElementById('add-security-device')) {
    document.getElementById('add-security-device').addEventListener('click', () => showAddItemModal('securityDevices'));
}

if (document.getElementById('add-activity-form')) {
    document.getElementById('add-activity-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const description = document.getElementById('activity-description').value;
        const type = document.getElementById('activity-type').value;
        const currentUser =   JSON.parse(localStorage.getItem('currentUser'));
        addActivity(currentUser.username, description, type);
        document.getElementById('add-activity-form').reset();
        showNotification('Atividade adicionada com sucesso!', 'success');
    });
}

if (document.getElementById('generate-profit-form')) {
    document.getElementById('generate-profit-form').addEventListener('submit', addProfit);
}

// Fechar modal
if (document.querySelector('.close')) {
    document.querySelector('.close').addEventListener('click', closeModal);
}

// Carregar conteúdo apropriado com base na página atual
if (window.location.pathname.includes('dashboard.html')) {
    loadDashboard();
} else if (window.location.pathname.includes('inventory.html')) {
    loadInventory();
} else if (window.location.pathname.includes('activities.html')) {
    loadActivities();
} else if (window.location.pathname.includes('profits.html')) {
    loadProfits();
}

// Verificar autenticação em páginas protegidas
if (window.location.pathname.includes('dashboard.html') || 
    window.location.pathname.includes('inventory.html') || 
    window.location.pathname.includes('activities.html') || 
    window.location.pathname.includes('profits.html')) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
    } else {
        updateNavMenu();
    }
}