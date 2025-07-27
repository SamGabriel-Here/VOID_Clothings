document.addEventListener('DOMContentLoaded', () => {

    const productGrid = document.getElementById('product-grid');
    const cartButton = document.getElementById('cart-button');
    const cartModal = document.getElementById('cart-modal');
    const closeCartButton = document.getElementById('close-cart-button');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');


    // State
    let cart = [];

    // Dummy Product Data
    const products = [
        {
            id: 1,
            name: 'Merc X LH44 Oversized T-Shirt',
            price: 29.99,
            image: 'file:///Users/samgabriel/Desktop/MercXLewis.jpeg'
        },
        {
            id: 2,
            name: 'Modern Blue Jeans',
            price: 89.99,
            image: 'file:///Users/samgabriel/Desktop/BF4C722F-7C99-4689-8992-D39B7E2DE19A.webp'
        },
        {
            id: 3,
            name: 'Stylish Black Sneakers',
            price: 129.99,
            image: 'https://placehold.co/400x400/1F2937/FFFFFF?text=Sneakers'
        },
        {
            id: 4,
            name: 'Leather Strap Watch',
            price: 249.99,
            image: 'https://placehold.co/400x400/9A3412/FFFFFF?text=Watch'
        },
        {
            id: 5,
            name: 'Cozy Wool Scarf',
            price: 45.50,
            image: 'https://placehold.co/400x400/D97706/FFFFFF?text=Scarf'
        },
        {
            id: 6,
            name: 'Designer Sunglasses',
            price: 180.00,
            image: 'https://placehold.co/400x400/FBBF24/333333?text=Sunglasses'
        },
        {
            id: 7,
            name: 'Canvas Backpack',
            price: 75.00,
            image: 'https://placehold.co/400x400/10B981/FFFFFF?text=Backpack'
        },
        {
            id: 8,
            name: 'Minimalist Wallet',
            price: 55.00,
            image: 'https://placehold.co/400x400/6B7280/FFFFFF?text=Wallet'
        }
    ];

    // --- RENDER PRODUCTS ---
    function renderProducts() {
        productGrid.innerHTML = ''; // Clear existing products
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card bg-white rounded-lg shadow-md overflow-hidden';
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="w-full h-64 object-cover">
                <div class="p-6">
                    <h3 class="text-lg font-bold text-gray-800">${product.name}</h3>
                    <p class="text-gray-600 mt-2">$${product.price.toFixed(2)}</p>
                    <button data-id="${product.id}" class="add-to-cart-btn mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300">Add to Cart</button>
                </div>
            `;
            productGrid.appendChild(productCard);
        });
    }

    // --- CART LOGIC ---
    function addToCart(productId) {
        const productToAdd = products.find(p => p.id === productId);
        const existingCartItem = cart.find(item => item.id === productId);

        if (existingCartItem) {
            existingCartItem.quantity++;
        } else {
            cart.push({ ...productToAdd, quantity: 1 });
        }
        updateCart();
    }
    
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        updateCart();
    }
    
    function updateQuantity(productId, newQuantity) {
        const cartItem = cart.find(item => item.id === productId);
        if (cartItem) {
            if (newQuantity > 0) {
                cartItem.quantity = newQuantity;
            } else {
                removeFromCart(productId);
            }
        }
        updateCart();
    }

    function updateCart() {
        renderCartItems();
        updateCartCount();
        updateCartTotal();
    }

    function renderCartItems() {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-gray-500">Your cart is empty.</p>';
            return;
        }

        cartItemsContainer.innerHTML = '';
        cart.forEach(item => {
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'flex justify-between items-center py-3';
            cartItemElement.innerHTML = `
                <div class="flex items-center space-x-4">
                    <img src="${item.image}" alt="${item.name}" class="w-16 h-16 rounded-md object-cover">
                    <div>
                        <p class="font-bold">${item.name}</p>
                        <p class="text-sm text-gray-500">$${item.price.toFixed(2)}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-3">
                    <input type="number" min="1" value="${item.quantity}" data-id="${item.id}" class="quantity-input w-16 text-center border rounded-md">
                    <button data-id="${item.id}" class="remove-from-cart-btn text-red-500 hover:text-red-700">&times;</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemElement);
        });
    }

    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }

    function updateCartTotal() {
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        cartTotal.textContent = `$${total.toFixed(2)}`;
    }

    // --- EVENT LISTENERS ---
    
    // Toggle mobile menu
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // Open/Close Cart Modal
    cartButton.addEventListener('click', () => cartModal.classList.remove('hidden'));
    closeCartButton.addEventListener('click', () => cartModal.classList.add('hidden'));
    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.classList.add('hidden');
        }
    });

    // Add to cart
    productGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const productId = parseInt(e.target.dataset.id, 10);
            addToCart(productId);
        }
    });
    
    // Cart item interactions (remove, update quantity)
    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-from-cart-btn')) {
            const productId = parseInt(e.target.dataset.id, 10);
            removeFromCart(productId);
        }
    });

    cartItemsContainer.addEventListener('change', (e) => {
        if (e.target.classList.contains('quantity-input')) {
            const productId = parseInt(e.target.dataset.id, 10);
            const newQuantity = parseInt(e.target.value, 10);
            updateQuantity(productId, newQuantity);
        }
    });

    // --- INITIALIZATION ---
    renderProducts();
});
