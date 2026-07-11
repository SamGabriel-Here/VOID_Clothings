document.addEventListener('DOMContentLoaded', () => {

    // --- PRODUCT CATALOG ---
    // Swap the `image` paths in assets/products/ with real photography when ready.
    const products = [
        { id: 1, name: "5B' Armor Denim",          price: 4240, image: 'assets/products/armor-denim.svg' },
        { id: 2, name: "22' Concrete Cuban Shirt", price: 3143, image: 'assets/products/cuban-shirt.svg' },
        { id: 3, name: "Tribal Onix Denim 'SB'",   price: 3250, image: 'assets/products/tribal-denim.svg' },
        { id: 4, name: "Tribal Onix Tee 'SB'",     price: 2345, image: 'assets/products/tribal-tee.svg' },
        { id: 5, name: 'Merc X LH44 Oversized Tee', price: 2899, image: 'assets/products/merc-lh44.svg' },
        { id: 6, name: 'Void Core Hoodie',         price: 4800, image: 'assets/products/void-hoodie.svg' },
        { id: 7, name: 'Null Cargo Pants',         price: 3900, image: 'assets/products/null-cargo.svg' },
        { id: 8, name: 'Eclipse Bomber Jacket',    price: 6500, image: 'assets/products/eclipse-bomber.svg' },
    ];

    // --- ELEMENTS ---
    const productGrid = document.getElementById('product-grid');
    const productCount = document.getElementById('product-count');
    const cartButton = document.getElementById('cart-button');
    const cartModal = document.getElementById('cart-modal');
    const closeCartButton = document.getElementById('close-cart-button');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    const checkoutButton = document.getElementById('checkout-button');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const toast = document.getElementById('toast');
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterMsg = document.getElementById('newsletter-msg');

    // --- STATE (persisted) ---
    const STORAGE_KEY = 'void_cart';
    let cart = loadCart();

    function loadCart() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
        catch { return []; }
    }
    function saveCart() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }

    const formatPrice = (n) =>
        'Rs. ' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // --- RENDER PRODUCTS ---
    function renderProducts() {
        productGrid.innerHTML = '';
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card group';
            card.innerHTML = `
                <div class="relative overflow-hidden bg-void-panel border border-void-line aspect-[4/5]">
                    <img src="${product.image}" alt="${product.name}"
                         class="w-full h-full object-cover transition duration-500 group-hover:scale-105">
                    <button data-id="${product.id}"
                        class="add-to-cart-btn absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition duration-300 bg-void-bone text-void-black py-3 text-xs uppercase tracking-widest font-medium">
                        Add to bag
                    </button>
                </div>
                <div class="mt-3 flex justify-between items-start gap-2">
                    <h3 class="text-xs uppercase tracking-wider text-void-bone leading-snug">${product.name}</h3>
                    <p class="text-xs text-void-mute font-mono whitespace-nowrap">${formatPrice(product.price)}</p>
                </div>
            `;
            productGrid.appendChild(card);
        });
        if (productCount) productCount.textContent = `${products.length} pieces`;
    }

    // --- CART LOGIC ---
    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        const existing = cart.find(item => item.id === productId);
        if (existing) existing.quantity++;
        else cart.push({ ...product, quantity: 1 });
        updateCart();
        showToast(`Added — ${product.name}`);
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        updateCart();
    }

    function updateQuantity(productId, newQuantity) {
        const item = cart.find(i => i.id === productId);
        if (!item) return;
        if (newQuantity > 0) item.quantity = newQuantity;
        else cart = cart.filter(i => i.id !== productId);
        updateCart();
    }

    function updateCart() {
        saveCart();
        renderCartItems();
        const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.classList.toggle('hidden', totalItems === 0);
        const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
        cartTotal.textContent = formatPrice(total);
        checkoutButton.disabled = cart.length === 0;
    }

    function renderCartItems() {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML =
                '<div class="h-full flex flex-col items-center justify-center text-center py-16"><p class="text-void-mute uppercase tracking-widest text-sm">Your bag is empty</p></div>';
            return;
        }
        cartItemsContainer.innerHTML = '';
        cart.forEach(item => {
            const row = document.createElement('div');
            row.className = 'flex gap-4 py-4 border-b border-void-line';
            row.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="w-16 h-20 object-cover border border-void-line">
                <div class="flex-1 min-w-0">
                    <p class="text-xs uppercase tracking-wider">${item.name}</p>
                    <p class="text-void-mute font-mono text-xs mt-1">${formatPrice(item.price)}</p>
                    <div class="flex items-center gap-3 mt-3">
                        <div class="flex items-center border border-void-line">
                            <button data-id="${item.id}" class="qty-dec w-7 h-7 text-void-mute hover:text-white">−</button>
                            <span class="w-8 text-center text-sm">${item.quantity}</span>
                            <button data-id="${item.id}" class="qty-inc w-7 h-7 text-void-mute hover:text-white">+</button>
                        </div>
                        <button data-id="${item.id}" class="remove-from-cart-btn text-void-mute hover:text-white text-xs uppercase tracking-widest">Remove</button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(row);
        });
    }

    // --- TOAST ---
    let toastTimer;
    function showToast(message) {
        toast.textContent = message;
        toast.classList.remove('opacity-0', 'translate-y-4');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-4');
        }, 2000);
    }

    // --- CART DRAWER OPEN/CLOSE ---
    const openCart = () => { cartModal.classList.remove('hidden'); document.body.style.overflow = 'hidden'; };
    const closeCart = () => { cartModal.classList.add('hidden'); document.body.style.overflow = ''; };

    // --- EVENT LISTENERS ---
    mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    mobileMenu.addEventListener('click', (e) => { if (e.target.tagName === 'A') mobileMenu.classList.add('hidden'); });

    cartButton.addEventListener('click', openCart);
    closeCartButton.addEventListener('click', closeCart);
    cartModal.addEventListener('click', (e) => { if (e.target.hasAttribute('data-cart-overlay')) closeCart(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCart(); });

    productGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-to-cart-btn');
        if (btn) addToCart(parseInt(btn.dataset.id, 10));
    });

    cartItemsContainer.addEventListener('click', (e) => {
        const target = e.target.closest('[data-id]');
        if (!target) return;
        const id = parseInt(target.dataset.id, 10);
        const item = cart.find(i => i.id === id);
        if (target.classList.contains('remove-from-cart-btn')) removeFromCart(id);
        else if (target.classList.contains('qty-inc')) updateQuantity(id, item.quantity + 1);
        else if (target.classList.contains('qty-dec')) updateQuantity(id, item.quantity - 1);
    });

    checkoutButton.addEventListener('click', () => {
        if (cart.length === 0) return;
        showToast('Checkout is a demo — no payment taken');
    });

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            newsletterForm.reset();
            newsletterMsg.textContent = "You're on the list. Welcome to the void.";
        });
    }

    // --- INIT ---
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    renderProducts();
    updateCart();
});
