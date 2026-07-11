document.addEventListener('DOMContentLoaded', () => {

    /* ============================================================
       STARFIELD — animated canvas background
       ============================================================ */
    (function starfield() {
        const canvas = document.getElementById('starfield');
        if (!canvas) return;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const ctx = canvas.getContext('2d');
        let w, h, dpr, stars, shootTimer = 0, running = true;

        function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = canvas.width = Math.floor(innerWidth * dpr);
            h = canvas.height = Math.floor(innerHeight * dpr);
            canvas.style.width = innerWidth + 'px';
            canvas.style.height = innerHeight + 'px';
            const count = Math.min(260, Math.floor((innerWidth * innerHeight) / 6500));
            stars = Array.from({ length: count }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                r: (Math.random() * 1.3 + 0.2) * dpr,
                base: Math.random() * 0.5 + 0.25,
                tw: Math.random() * Math.PI * 2,          // twinkle phase
                sp: Math.random() * 0.015 + 0.004,        // twinkle speed
                drift: (Math.random() * 0.05 + 0.01) * dpr,
                hue: Math.random() < 0.15 ? (Math.random() < 0.5 ? '139,92,246' : '56,189,248') : '255,255,255',
            }));
        }

        let shoot = null;
        function spawnShoot() {
            const startX = Math.random() * w * 0.7;
            shoot = { x: startX, y: Math.random() * h * 0.4, vx: (6 + Math.random() * 4) * dpr, vy: (3 + Math.random() * 2) * dpr, life: 0, max: 60 };
        }

        function frame() {
            if (!running) return;
            ctx.clearRect(0, 0, w, h);
            for (const s of stars) {
                s.tw += s.sp;
                const o = s.base + Math.sin(s.tw) * 0.35;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${s.hue},${Math.max(0, o).toFixed(2)})`;
                ctx.fill();
                s.y += s.drift;                 // gentle downward drift
                if (s.y > h) { s.y = 0; s.x = Math.random() * w; }
            }
            // shooting star
            if (!reduce) {
                if (!shoot && ++shootTimer > 220 && Math.random() < 0.02) { spawnShoot(); shootTimer = 0; }
                if (shoot) {
                    shoot.life++;
                    const tailX = shoot.x - shoot.vx * 6, tailY = shoot.y - shoot.vy * 6;
                    const grad = ctx.createLinearGradient(shoot.x, shoot.y, tailX, tailY);
                    grad.addColorStop(0, 'rgba(255,255,255,0.9)');
                    grad.addColorStop(1, 'rgba(255,255,255,0)');
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = 1.6 * dpr;
                    ctx.beginPath();
                    ctx.moveTo(shoot.x, shoot.y);
                    ctx.lineTo(tailX, tailY);
                    ctx.stroke();
                    shoot.x += shoot.vx; shoot.y += shoot.vy;
                    if (shoot.life > shoot.max || shoot.x > w || shoot.y > h) shoot = null;
                }
            }
            requestAnimationFrame(frame);
        }

        resize();
        addEventListener('resize', resize);
        document.addEventListener('visibilitychange', () => {
            running = !document.hidden;
            if (running) frame();
        });
        if (reduce) {
            // paint one static frame
            for (const s of stars) {
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${s.hue},${s.base.toFixed(2)})`;
                ctx.fill();
            }
        } else {
            frame();
        }
    })();

    /* ============================================================
       STORE — catalogue + cart
       ============================================================ */
    const products = [
        { id: 1, cat: 'VOID-001', name: "5B' Armor Denim",          price: 4240, image: 'assets/products/armor-denim.svg' },
        { id: 2, cat: 'VOID-002', name: "22' Concrete Cuban Shirt", price: 3143, image: 'assets/products/cuban-shirt.svg' },
        { id: 3, cat: 'VOID-003', name: "Tribal Onix Denim 'SB'",   price: 3250, image: 'assets/products/tribal-denim.svg' },
        { id: 4, cat: 'VOID-004', name: "Tribal Onix Tee 'SB'",     price: 2345, image: 'assets/products/tribal-tee.svg' },
        { id: 5, cat: 'VOID-005', name: 'Merc X LH44 Oversized Tee', price: 2899, image: 'assets/products/merc-lh44.svg' },
        { id: 6, cat: 'VOID-006', name: 'Void Core Hoodie',         price: 4800, image: 'assets/products/void-hoodie.svg' },
        { id: 7, cat: 'VOID-007', name: 'Null Cargo Pants',         price: 3900, image: 'assets/products/null-cargo.svg' },
        { id: 8, cat: 'VOID-008', name: 'Eclipse Bomber Jacket',    price: 6500, image: 'assets/products/eclipse-bomber.svg' },
    ];

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

    const STORAGE_KEY = 'void_cart';
    let cart = loadCart();

    function loadCart() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
        catch { return []; }
    }
    function saveCart() { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); }

    const formatPrice = (n) =>
        'Rs. ' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    function renderProducts() {
        productGrid.innerHTML = '';
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card group';
            card.innerHTML = `
                <div class="card-frame aspect-[4/5]">
                    <span class="cat-id">${product.cat}</span>
                    <img src="${product.image}" alt="${product.name}"
                         class="w-full h-full object-cover transition duration-700 group-hover:scale-105">
                    <button data-id="${product.id}"
                        class="add-to-cart-btn absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition duration-300 bg-void-bone text-void-black py-3 text-xs uppercase tracking-[0.15em] font-semibold">
                        Add to cargo
                    </button>
                </div>
                <div class="mt-3 flex justify-between items-start gap-2">
                    <h3 class="text-xs uppercase tracking-wider text-void-bone leading-snug">${product.name}</h3>
                    <p class="text-xs text-void-mute font-mono whitespace-nowrap">${formatPrice(product.price)}</p>
                </div>
            `;
            productGrid.appendChild(card);
        });
        if (productCount) productCount.textContent = `${products.length} objects catalogued`;
    }

    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        const existing = cart.find(item => item.id === productId);
        if (existing) existing.quantity++;
        else cart.push({ ...product, quantity: 1 });
        updateCart();
        showToast(`Loaded — ${product.name}`);
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
        cartTotal.textContent = formatPrice(cart.reduce((s, i) => s + i.price * i.quantity, 0));
        checkoutButton.disabled = cart.length === 0;
    }

    function renderCartItems() {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML =
                '<div class="h-full flex flex-col items-center justify-center text-center py-16"><p class="text-void-mute uppercase tracking-[0.2em] text-sm">Cargo bay empty</p><p class="text-void-mute/60 font-mono text-xs mt-2">Awaiting payload</p></div>';
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
                            <button data-id="${item.id}" class="qty-dec w-7 h-7 text-void-mute hover:text-void-bone">−</button>
                            <span class="w-8 text-center text-sm">${item.quantity}</span>
                            <button data-id="${item.id}" class="qty-inc w-7 h-7 text-void-mute hover:text-void-bone">+</button>
                        </div>
                        <button data-id="${item.id}" class="remove-from-cart-btn text-void-mute hover:text-void-bone text-xs uppercase tracking-[0.2em]">Jettison</button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(row);
        });
    }

    let toastTimer;
    function showToast(message) {
        toast.textContent = message;
        toast.classList.remove('opacity-0', 'translate-y-4');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.add('opacity-0', 'translate-y-4'), 2000);
    }

    const openCart = () => { cartModal.classList.remove('hidden'); document.body.style.overflow = 'hidden'; };
    const closeCart = () => { cartModal.classList.add('hidden'); document.body.style.overflow = ''; };

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
        else if (item && target.classList.contains('qty-inc')) updateQuantity(id, item.quantity + 1);
        else if (item && target.classList.contains('qty-dec')) updateQuantity(id, item.quantity - 1);
    });

    checkoutButton.addEventListener('click', () => {
        if (cart.length === 0) return;
        showToast('Checkout is a demo — no payment taken');
    });

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            newsletterForm.reset();
            newsletterMsg.textContent = 'Signal received. Standby for coordinates.';
        });
    }

    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    renderProducts();
    updateCart();
});
