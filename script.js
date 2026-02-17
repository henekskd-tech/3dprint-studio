// ==================== КОНФИГУРАЦИЯ ====================

// 🔐 ДАННЫЕ АДМИНИСТРАТОРА
const ADMIN_CONFIG = {
    email: 'henekskd@gmail.com',
    password: 'Max07may',
    name: 'Администратор'
};

// ==================== СОСТОЯНИЕ ====================

let appState = {
    currentUser: null,
    isAdmin: false,
    cart: [],
    customers: [],
    orders: [],
    products: [],
    settings: {},
    delivery: {},
    payment: {}
};

// Временные данные для регистрации
let tempRegData = {
    email: null,
    code: null
};

// ==================== ИНИЦИАЛИЗАЦИЯ ====================

document.addEventListener('DOMContentLoaded', () => {
    loadDataFromStorage();
    checkExistingSession();
    initCategories();
});

function loadDataFromStorage() {
    const saved = localStorage.getItem('3dprint_data_v2');
    if (saved) {
        const data = JSON.parse(saved);
        appState.customers = data.customers || [];
        appState.orders = data.orders || [];
        appState.products = data.products || getDefaultProducts();
        appState.settings = data.settings || getDefaultSettings();
        appState.delivery = data.delivery || getDefaultDelivery();
        appState.payment = data.payment || getDefaultPayment();
    } else {
        appState.products = getDefaultProducts();
        appState.settings = getDefaultSettings();
        appState.delivery = getDefaultDelivery();
        appState.payment = getDefaultPayment();
        saveData();
    }
}

function getDefaultProducts() {
    return [
        {
            id: 1,
            title: 'Дракон - статуэтка Premium',
            price: 890,
            stock: 5,
            category: 'miniatures',
            description: 'Высокодетализированная статуэтка дракона. Высота 25см.',
            material: 'PLA Silk',
            color: 'Золотой металлик',
            dimensions: '150x120x250',
            weight: 180,
            print_time: '12 часов',
            sales_count: 12,
            status: 'active',
            created_at: '2024-01-15'
        },
        {
            id: 2,
            title: 'Кольцо "Волна" для литья',
            price: 1200,
            stock: 3,
            category: 'jewelry',
            description: 'Элегантное кольцо, модель для печати воском.',
            material: 'Castable Wax',
            color: 'Синий',
            dimensions: '20x20x15',
            weight: 8,
            print_time: '2 часа',
            sales_count: 8,
            status: 'active',
            created_at: '2024-01-14'
        },
        {
            id: 3,
            title: 'Корпус Raspberry Pi 4',
            price: 450,
            stock: 15,
            category: 'parts',
            description: 'Функциональный корпус с креплением для вентилятора.',
            material: 'PETG',
            color: 'Черный',
            dimensions: '90x65x35',
            weight: 45,
            print_time: '4 часа',
            sales_count: 45,
            status: 'active',
            created_at: '2024-01-13'
        }
    ];
}

function getDefaultSettings() {
    return {
        siteName: '3D Print Studio',
        heroTitle: 'Профессиональная 3D печать на заказ',
        heroSubtitle: 'Изготовление деталей любой сложности из PLA, PETG, ABS',
        aboutText: 'Мы специализируемся на 3D печати с 2019 года. Качество и скорость — наш приоритет.',
        phone: '+7 (999) 123-45-67',
        email: 'info@3dprintstudio.ru',
        address: 'г. Москва, ул. Примерная, д. 10',
        workHours: 'Пн-Пт: 10:00 - 20:00, Сб-Вс: 11:00 - 18:00'
    };
}

function getDefaultDelivery() {
    return {
        methods: [
            { id: 'cdek', name: 'СДЭК', enabled: true, description: 'Курьер или пункт выдачи' },
            { id: 'boxberry', name: 'Boxberry', enabled: true, description: 'Пункты выдачи по всей России' },
            { id: 'russian_post', name: 'Почта России', enabled: true, description: 'Доставка в отделение' }
        ],
        pickup: { enabled: true, address: 'г. Москва, ул. Примерная, д. 10, офис 305' },
        basePrice: 300,
        freeFrom: 3000
    };
}

function getDefaultPayment() {
    return {
        linkUrl: '',
        methodName: 'Оплата картой / СБП',
        instructions: 'После подтверждения заказа вы получите ссылку на оплату.'
    };
}

function saveData() {
    localStorage.setItem('3dprint_data_v2', JSON.stringify({
        customers: appState.customers,
        orders: appState.orders,
        products: appState.products,
        settings: appState.settings,
        delivery: appState.delivery,
        payment: appState.payment
    }));
}

function initCategories() {
    const categories = {
        miniatures: 'Миниатюры',
        jewelry: 'Ювелирные изделия',
        decor: 'Декор',
        parts: 'Запчасти',
        prototypes: 'Прототипы',
        toys: 'Игрушки',
        tools: 'Инструменты',
        other: 'Другое'
    };
    
    const selects = ['adminCategorySelect', 'catalogCategory'];
    selects.forEach(id => {
        const select = document.getElementById(id);
        if (select && select.options.length <= 1) {
            Object.entries(categories).forEach(([val, name]) => {
                select.innerHTML += `<option value="${val}">${name}</option>`;
            });
        }
    });
}

// ==================== НАВИГАЦИЯ ПО АВТОРИЗАЦИИ ====================

function switchAuthMode(mode) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(mode === 'login' ? 'tabLogin' : 'tabRegister').classList.add('active');
    
    document.getElementById('loginForm').classList.toggle('active', mode === 'login');
    document.getElementById('registerForm').classList.toggle('active', mode === 'register');
    document.getElementById('adminLoginForm').classList.remove('active');
}

function showAdminLogin() {
    document.querySelectorAll('.auth-form-section').forEach(s => s.classList.remove('active'));
    document.getElementById('adminLoginForm').classList.add('active');
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
}

function showCustomerLogin() {
    switchAuthMode('login');
    resetLoginForm();
}

function resetLoginForm() {
    document.getElementById('loginStep1').classList.add('active');
    document.getElementById('loginStep2Existing').classList.remove('active');
    document.getElementById('loginStep2New').classList.remove('active');
    document.getElementById('loginEmail').value = '';
    document.getElementById('existingUserPassword').value = '';
}

// ==================== ВХОД КЛИЕНТА ====================

function checkEmailExists(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.toLowerCase().trim();
    
    // Проверка на админа
    if (email === ADMIN_CONFIG.email) {
        showToast('Используйте вход для администратора', 'warning');
        showAdminLogin();
        document.getElementById('adminEmail').value = email;
        return;
    }
    
    const customer = appState.customers.find(c => c.email.toLowerCase() === email);
    
    if (customer) {
        // Существующий пользователь
        document.getElementById('existingUserEmail').textContent = email;
        document.getElementById('loginStep1').classList.remove('active');
        document.getElementById('loginStep2Existing').classList.add('active');
    } else {
        // Новый пользователь
        document.getElementById('newUserEmail').textContent = email;
        document.getElementById('loginStep1').classList.remove('active');
        document.getElementById('loginStep2New').classList.add('active');
    }
}

function backToLoginEmail() {
    resetLoginForm();
}

function loginExistingUser(e) {
    e.preventDefault();
    const email = document.getElementById('existingUserEmail').textContent;
    const password = document.getElementById('existingUserPassword').value;
    
    const customer = appState.customers.find(c => c.email.toLowerCase() === email.toLowerCase());
    
    if (!customer) {
        showToast('Ошибка: пользователь не найден', 'error');
        return;
    }
    
    if (customer.password !== password) {
        showToast('Неверный пароль', 'error');
        return;
    }
    
    // Успешный вход
    appState.currentUser = customer;
    appState.isAdmin = false;
    
    sessionStorage.setItem('session', JSON.stringify({
        type: 'customer',
        email: customer.email
    }));
    
    showCustomerSite();
    showToast(`Добро пожаловать, ${customer.name || customer.email}!`, 'success');
}

function switchToRegister() {
    const email = document.getElementById('newUserEmail').textContent;
    document.getElementById('registerEmail').value = email;
    switchAuthMode('register');
    startRegistrationFromLogin(email);
}

// ==================== РЕГИСТРАЦИЯ ====================

function startRegistration(e) {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value.toLowerCase().trim();
    
    // Проверка на админа
    if (email === ADMIN_CONFIG.email) {
        showToast('Этот email зарезервирован', 'error');
        return;
    }
    
    // Проверка существования
    if (appState.customers.some(c => c.email.toLowerCase() === email)) {
        showToast('Аккаунт с этим email уже существует. Войдите.', 'warning');
        switchAuthMode('login');
        document.getElementById('loginEmail').value = email;
        return;
    }
    
    startRegistrationFromLogin(email);
}

function startRegistrationFromLogin(email) {
    tempRegData.email = email;
    tempRegData.code = generateCode();
    
    // ИМИТАЦИЯ ОТПРАВКИ КОДА
    console.log('=== КОД ПОДТВЕРЖДЕНИЯ ===');
    console.log('Email:', email);
    console.log('Код:', tempRegData.code);
    console.log('========================');
    
    document.getElementById('codeSentToEmail').textContent = email;
    document.getElementById('registerStep1').classList.remove('active');
    document.getElementById('registerStep2').classList.add('active');
    
    showToast(`Код отправлен на ${email} (смотрите консоль)`, 'success');
    
    // Автозаполнение для демо
    setTimeout(() => {
        const inputs = document.querySelectorAll('#registerStep2 .code-digit');
        inputs.forEach((input, i) => {
            input.value = tempRegData.code[i];
        });
        document.getElementById('registerCodeFull').value = tempRegData.code;
    }, 800);
    
    startResendTimer();
}

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function moveCodeFocus(input, index) {
    if (input.value && index < 5) {
        document.querySelectorAll('#registerStep2 .code-digit')[index + 1].focus();
    }
    updateRegisterCode();
}

function submitCode(input) {
    updateRegisterCode();
    if (input.value) {
        verifyRegisterCode({ preventDefault: () => {} });
    }
}

function updateRegisterCode() {
    const digits = Array.from(document.querySelectorAll('#registerStep2 .code-digit')).map(i => i.value);
    document.getElementById('registerCodeFull').value = digits.join('');
}

function verifyRegisterCode(e) {
    e.preventDefault();
    const enteredCode = document.getElementById('registerCodeFull').value;
    
    if (enteredCode !== tempRegData.code) {
        showToast('Неверный код', 'error');
        return;
    }
    
    // Код верный, переход к созданию пароля
    document.getElementById('registerStep2').classList.remove('active');
    document.getElementById('registerStep3').classList.add('active');
}

function backToRegisterEmail() {
    document.getElementById('registerStep2').classList.remove('active');
    document.getElementById('registerStep1').classList.add('active');
    document.querySelectorAll('#registerStep2 .code-digit').forEach(i => i.value = '');
}

function resendRegisterCode() {
    tempRegData.code = generateCode();
    console.log('=== НОВЫЙ КОД ===');
    console.log('Email:', tempRegData.email);
    console.log('Код:', tempRegData.code);
    console.log('==================');
    
    showToast('Новый код отправлен (смотрите консоль)', 'success');
    startResendTimer();
}

function startResendTimer() {
    const btn = document.querySelector('.resend-code .btn-text');
    const timer = document.getElementById('resendTimer');
    let seconds = 60;
    
    btn.disabled = true;
    timer.textContent = ` (${seconds}с)`;
    
    const interval = setInterval(() => {
        seconds--;
        timer.textContent = ` (${seconds}с)`;
        if (seconds <= 0) {
            clearInterval(interval);
            btn.disabled = false;
            timer.textContent = '';
        }
    }, 1000);
}

function createAccount(e) {
    e.preventDefault();
    const password = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    
    if (password.length < 6) {
        showToast('Пароль должен быть минимум 6 символов', 'error');
        return;
    }
    
    if (password !== confirm) {
        showToast('Пароли не совпадают', 'error');
        return;
    }
    
    // Создание аккаунта
    const newCustomer = {
        email: tempRegData.email,
        password: password,
        name: '',
        phone: '',
        created_at: new Date().toISOString(),
        orders_count: 0,
        total_spent: 0
    };
    
    appState.customers.push(newCustomer);
    saveData();
    
    appState.currentUser = newCustomer;
    appState.isAdmin = false;
    
    sessionStorage.setItem('session', JSON.stringify({
        type: 'customer',
        email: newCustomer.email
    }));
    
    // Очистка формы
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    document.querySelectorAll('#registerStep2 .code-digit').forEach(i => i.value = '');
    
    showCustomerSite();
    showToast('Аккаунт создан! Добро пожаловать!', 'success');
}

// ==================== ВХОД АДМИНА ====================

function handleAdminLogin(e) {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value.toLowerCase().trim();
    const password = document.getElementById('adminPassword').value;
    
    if (email !== ADMIN_CONFIG.email || password !== ADMIN_CONFIG.password) {
        showToast('Неверный email или пароль', 'error');
        return;
    }
    
    appState.isAdmin = true;
    appState.currentUser = {
        email: ADMIN_CONFIG.email,
        name: ADMIN_CONFIG.name,
        isAdmin: true
    };
    
    sessionStorage.setItem('session', JSON.stringify({
        type: 'admin',
        email: ADMIN_CONFIG.email
    }));
    
    showAdminPanel();
    showToast('Добро пожаловать в панель управления!', 'success');
}

// ==================== ГОСТЬ ====================

function continueAsGuest() {
    appState.currentUser = { 
        email: 'guest@temp.com', 
        isGuest: true,
        name: 'Гость'
    };
    appState.isAdmin = false;
    showCustomerSite();
    showToast('Вы вошли как гость. Оформить заказ можно, но история не сохранится.', 'info');
}

// ==================== СЕССИИ ====================

function checkExistingSession() {
    const session = sessionStorage.getItem('session');
    if (!session) return;
    
    const data = JSON.parse(session);
    
    if (data.type === 'admin') {
        if (data.email === ADMIN_CONFIG.email) {
            appState.isAdmin = true;
            appState.currentUser = { email: ADMIN_CONFIG.email, name: ADMIN_CONFIG.name, isAdmin: true };
            showAdminPanel();
        }
    } else {
        const customer = appState.customers.find(c => c.email === data.email);
        if (customer) {
            appState.currentUser = customer;
            showCustomerSite();
        }
    }
}

// ==================== ПОКАЗ САЙТОВ ====================

function showCustomerSite() {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('customerSite').classList.remove('hidden');
    document.getElementById('adminPanel').classList.add('hidden');
    
    updateCustomerUI();
    renderCustomerHome();
}

function showAdminPanel() {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('customerSite').classList.add('hidden');
    document.getElementById('adminPanel').classList.remove('hidden');
    
    document.getElementById('adminEmailDisplay').textContent = ADMIN_CONFIG.email;
    updateAdminStats();
    loadAdminDashboard();
}

// ==================== ВЫХОД ====================

function customerLogout() {
    sessionStorage.removeItem('session');
    appState.currentUser = null;
    appState.cart = [];
    location.reload();
}

function adminLogout() {
    sessionStorage.removeItem('session');
    appState.isAdmin = false;
    appState.currentUser = null;
    location.reload();
}

// ==================== КЛИЕНТСКАЯ ЧАСТЬ ====================

function updateCustomerUI() {
    document.getElementById('siteName').textContent = appState.settings.siteName;
    document.getElementById('heroTitle').textContent = appState.settings.heroTitle;
    document.getElementById('heroSubtitle').textContent = appState.settings.heroSubtitle;
    document.getElementById('footerSiteName').textContent = appState.settings.siteName;
    document.getElementById('footerTagline').textContent = appState.settings.heroSubtitle.split('.')[0];
    document.getElementById('copyright').textContent = `© ${new Date().getFullYear()} ${appState.settings.siteName}`;
    
    if (appState.currentUser && !appState.currentUser.isGuest) {
        document.getElementById('customerEmailDisplay').textContent = appState.currentUser.email;
        document.getElementById('profileEmail').textContent = appState.currentUser.email;
        document.getElementById('profilePhone').textContent = appState.currentUser.phone || 'Не указан';
    }
    
    updateCartBadge();
}

function showCustomerPage(page) {
    document.querySelectorAll('.customer-page').forEach(p => p.classList.remove('active'));
    document.getElementById('customer' + page.charAt(0).toUpperCase() + page.slice(1)).classList.add('active');
    
    document.getElementById('customerDropdown').classList.remove('active');
    
    if (page === 'catalog') renderCatalog();
    if (page === 'cart') renderCart();
    if (page === 'checkout') renderCheckout();
    if (page === 'orders') renderCustomerOrders();
    if (page === 'about') renderAbout();
    if (page === 'delivery') renderDelivery();
    if (page === 'contacts') renderContacts();
    
    window.scrollTo(0, 0);
}

function toggleCustomerMenu() {
    document.getElementById('customerDropdown').classList.toggle('active');
}

function toggleCustomerSearch() {
    document.getElementById('customerSearchBar').classList.toggle('hidden');
}

// ... (остальные функции клиентской части остаются такими же, как в предыдущем ответе)

// ==================== АДМИН-ПАНЕЛЬ ====================

function showAdminSection(section) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    event.currentTarget?.classList.add('active');
    
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.getElementById('admin' + section.charAt(0).toUpperCase() + section.slice(1)).classList.add('active');
    
    const titles = {
        dashboard: 'Обзор магазина',
        products: 'Управление товарами',
        addProduct: 'Добавление товара',
        orders: 'Заказы',
        customers: 'Покупатели',
        content: 'Контент сайта',
        delivery: 'Настройки доставки',
        payment: 'Настройки оплаты'
    };
    document.getElementById('adminSectionTitle').textContent = titles[section];
    
    if (section === 'products') loadAdminProducts();
    if (section === 'orders') loadAdminOrders();
    if (section === 'customers') loadAdminCustomers();
    if (section === 'content') loadContentEditor();
    if (section === 'delivery') loadDeliverySettings();
    if (section === 'payment') loadPaymentSettings();
}

// ... (остальные функции админки остаются такими же)

// ==================== УТИЛИТЫ ====================

function togglePassword(id, btn) {
    const input = document.getElementById(id);
    const icon = btn.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas fa-${icons[type]}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function previewSite() {
    window.open('#', '_blank');
}

// Закрытие дропдаунов
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('customerDropdown');
    const trigger = document.querySelector('.user-menu-trigger');
    
    if (dropdown && trigger && !dropdown.contains(e.target) && !trigger.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});
