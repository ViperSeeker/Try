document.addEventListener('DOMContentLoaded', function() {
    // Initialize shopping cart and purchases
    let cart = [];
    let purchases = [];
    
    // API base URL setup for server communication
    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000/api' 
        : 'https://your-railway-app-name.railway.app/api';
    
    // Function to submit orders to the server
    async function submitOrderToServer(purchase) {
        try {
            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(purchase)
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error submitting order:', error);
            // Return error to handle fallback
            return { success: false, error: error.message };
        }
    }

    // Function to get order status updates (for purchase history page)
    async function fetchOrderStatus(orderId) {
        try {
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch order status');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching order status:', error);
            return null;
        }
    }
    
    // Try to load cart and purchases from localStorage
    if (localStorage.getItem('coconutchCart')) {
        cart = JSON.parse(localStorage.getItem('coconutchCart'));
    }
    
    if (localStorage.getItem('coconutchPurchases')) {
        purchases = JSON.parse(localStorage.getItem('coconutchPurchases'));
    }
    
    // Update cart count on load
    updateCartCount();
    
    // Load purchases
    updatePurchasesDisplay();
    
    // Logo click refresh
    const homeLogo = document.getElementById('home-logo');
    if (homeLogo) {
        homeLogo.addEventListener('click', function() {
            // Refresh page and go to home tab
            location.reload();
        });
    }
    
    // Tab navigation
    const menuItems = document.querySelectorAll('.menu-item');
    const contentSections = document.querySelectorAll('.content-section');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all menu items
            menuItems.forEach(mi => mi.classList.remove('active'));
            // Add active class to clicked menu item
            this.classList.add('active');
            
            // Hide all content sections
            contentSections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Show the selected content section
            const targetSection = document.getElementById(this.dataset.section);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
    
    // Product image click for product details
    const productImages = document.querySelectorAll('.product-image');
    const productDetailModal = document.getElementById('productDetailModal');
    const productDetailCloseButton = productDetailModal.querySelector('.close-button');
    
    productImages.forEach(image => {
        image.addEventListener('click', function() {
            const productName = this.dataset.product;
            openProductDetailModal(productName);
        });
    });
    
    productDetailCloseButton.addEventListener('click', function() {
        productDetailModal.style.display = 'none';
    });
    
    // Shop buttons
    const shopNowButtons = document.querySelectorAll('.shop-now');
    shopNowButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get target section
            const targetSection = this.dataset.target;
            
            // Remove active class from all menu items
            menuItems.forEach(mi => mi.classList.remove('active'));
            
            // Add active class to target menu item
            const targetMenuItem = document.querySelector(`.menu-item[data-section="${targetSection}"]`);
            if (targetMenuItem) {
                targetMenuItem.classList.add('active');
            }
            
            // Hide all content sections
            contentSections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Show the target section
            const productsSection = document.getElementById(targetSection);
            if (productsSection) {
                productsSection.classList.add('active');
            }
        });
    });
    
    // Add to Cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const cartCountElement = document.getElementById('cart-count');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const product = this.dataset.product;
            const price = parseFloat(this.dataset.price);
            
            // Check if product already exists in cart
            const existingProductIndex = cart.findIndex(item => item.product === product);
            
            if (existingProductIndex !== -1) {
                // Increment quantity if product already in cart
                cart[existingProductIndex].quantity += 1;
            } else {
                // Add new item to cart
                cart.push({
                    product: product,
                    price: price,
                    quantity: 1
                });
            }
            
            // Update cart count
            updateCartCount();
            
            // Save cart to localStorage
            localStorage.setItem('coconutchCart', JSON.stringify(cart));
            
            // Show notification instead of alert
            showCartNotification(`${product} added to cart!`);
        });
    });
    
    // Buy Now buttons
    const buyNowButtons = document.querySelectorAll('.buy-now');
    buyNowButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get parent product card
            const productCard = this.closest('.product-card');
            if (!productCard) return;
            
            const productName = productCard.querySelector('h3').textContent;
            const priceText = productCard.querySelector('.price').textContent;
            const price = parseFloat(priceText.replace('₱', ''));
            
            // Clear cart and add only this product
            cart = [{
                product: productName,
                price: price,
                quantity: 1
            }];
            
            // Update cart count
            updateCartCount();
            
            // Save cart to localStorage
            localStorage.setItem('coconutchCart', JSON.stringify(cart));
            
            // Open payment modal directly
            openPaymentModal();
        });
    });
    
    // View Cart button
    const viewCartButton = document.getElementById('view-cart');
    if (viewCartButton) {
        viewCartButton.addEventListener('click', function() {
            openCartModal();
        });
    }
    
    // Cart Modal
    const cartModal = document.getElementById('cartModal');
    const cartCloseButton = cartModal.querySelector('.close-button');
    
    cartCloseButton.addEventListener('click', function() {
        cartModal.style.display = 'none';
    });
    
    // Payment Modal
    const paymentModal = document.getElementById('paymentModal');
    const paymentCloseButton = paymentModal.querySelector('.close-button');
    
    paymentCloseButton.addEventListener('click', function() {
        paymentModal.style.display = 'none';
    });
    
    // Checkout button in cart modal
    const checkoutButton = document.getElementById('checkout');
    checkoutButton.addEventListener('click', function() {
        if (cart.length === 0) {
            showCartNotification('Your cart is empty!');
            return;
        }
        
        // Close cart modal and open payment modal
        cartModal.style.display = 'none';
        openPaymentModal();
    });
    
    // Payment method selection
    const paymentMethodRadios = document.querySelectorAll('input[name="payment-method"]');
    const gcashPaymentDiv = document.getElementById('gcash-payment');
    const codPaymentDiv = document.getElementById('cod-payment');
    const gcashReferenceGroup = document.getElementById('gcash-reference-group');
    
    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'gcash') {
                gcashPaymentDiv.style.display = 'block';
                codPaymentDiv.style.display = 'none';
                gcashReferenceGroup.style.display = 'block';
            } else if (this.value === 'cod') {
                gcashPaymentDiv.style.display = 'none';
                codPaymentDiv.style.display = 'block';
                gcashReferenceGroup.style.display = 'none';
            }
        });
    });
    
    // Payment form submission
    const paymentForm = document.getElementById('payment-form');
    paymentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const address = document.getElementById('address').value;
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
        
        // Validate GCash reference number if GCash is selected
        if (paymentMethod === 'gcash') {
            const gcashReference = document.getElementById('gcash-reference').value;
            if (!gcashReference) {
                showCartNotification('Please enter your GCash Reference Number');
                return;
            }
        }
        
        // Create new purchase record
        const purchaseDate = new Date();
        const purchaseId = 'ORD-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        
        const purchase = {
            id: purchaseId,
            date: purchaseDate.toISOString(),
            name: name,
            email: email,
            address: address,
            paymentMethod: paymentMethod,
            gcashReference: paymentMethod === 'gcash' ? document.getElementById('gcash-reference').value : '',
            items: JSON.parse(JSON.stringify(cart)),
            status: 'Processing',
            total: cart.reduce((total, item) => total + (item.price * item.quantity), 0)
        };
        
        // Show loading indicator
        showCartNotification('Processing your order...');
        
        // Try to submit to server first
        try {
            const response = await submitOrderToServer(purchase);
            
            if (response.success) {
                // Server submission successful
                // Add to local purchases with server-generated ID if provided
                if (response.orderId) {
                    purchase.id = response.orderId;
                }
                purchases.unshift(purchase);
                localStorage.setItem('coconutchPurchases', JSON.stringify(purchases));
                
                showCartNotification(`Thank you for your order, ${name}! Your order #${purchase.id} has been received.`);
            } else {
                // Fall back to localStorage if server submission fails
                purchases.unshift(purchase);
                localStorage.setItem('coconutchPurchases', JSON.stringify(purchases));
                showCartNotification(`Thank you for your order, ${name}! Your order has been saved locally.`);
            }
            
            // Update purchases display
            updatePurchasesDisplay();
            
            // Clear cart and close modal
            cart = [];
            updateCartCount();
            paymentModal.style.display = 'none';
            
            // Save empty cart to localStorage
            localStorage.setItem('coconutchCart', JSON.stringify(cart));
            
            // Reset form
            paymentForm.reset();
        } catch (error) {
            // Handle offline case - save to localStorage only
            purchases.unshift(purchase);
            localStorage.setItem('coconutchPurchases', JSON.stringify(purchases));
            
            showCartNotification('Could not connect to server. Your order has been saved locally.');
            console.error('Order submission error:', error);
            
            // Update purchases display
            updatePurchasesDisplay();
            
            // Clear cart and close modal
            cart = [];
            updateCartCount();
            paymentModal.style.display = 'none';
            
            // Save empty cart to localStorage
            localStorage.setItem('coconutchCart', JSON.stringify(cart));
            
            // Reset form
            paymentForm.reset();
        }
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
        if (event.target === paymentModal) {
            paymentModal.style.display = 'none';
        }
        if (event.target === productDetailModal) {
            productDetailModal.style.display = 'none';
        }
    });
    
    // Cart notification
    const cartNotification = document.getElementById('cartNotification');
    
    // Helper Functions
    function updateCartCount() {
        // Calculate total items in cart
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = totalItems;
        }
    }
    
    function showCartNotification(message) {
        const notificationMessage = document.getElementById('notification-message');
        notificationMessage.textContent = message;
        
        // Show notification
        cartNotification.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(function() {
            cartNotification.classList.remove('show');
        }, 3000);
    }
    
    function openCartModal() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalElement = document.getElementById('cart-total');
        
        // Clear previous items
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            cartTotalElement.textContent = 'Total: ₱0.00';
        } else {
            // Calculate total price
            let totalPrice = 0;
            
            // Add each item to the cart modal
            cart.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                totalPrice += itemTotal;
                
                const cartItemElement = document.createElement('div');
                cartItemElement.className = 'cart-item';
                cartItemElement.innerHTML = `
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.product}</div>
                        <div class="cart-item-price">₱${item.price.toFixed(2)}</div>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease-quantity" data-index="${index}">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-index="${index}">
                        <button class="quantity-btn increase-quantity" data-index="${index}">+</button>
                    </div>
                    <div class="cart-item-total">₱${itemTotal.toFixed(2)}</div>
                    <button class="remove-item" data-index="${index}">×</button>
                `;
                
                cartItemsContainer.appendChild(cartItemElement);
            });
            
            // Update total price
            cartTotalElement.textContent = `Total: ₱${totalPrice.toFixed(2)}`;
            
            // Add event listeners for quantity buttons
            addCartItemEventListeners();
        }
        
        cartModal.style.display = 'block';
    }
    
    function addCartItemEventListeners() {
        // Decrease quantity buttons
        const decreaseButtons = document.querySelectorAll('.decrease-quantity');
        decreaseButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                if (cart[index].quantity > 1) {
                    cart[index].quantity -= 1;
                    updateCartDisplay();
                }
            });
        });
        
        // Increase quantity buttons
        const increaseButtons = document.querySelectorAll('.increase-quantity');
        increaseButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                cart[index].quantity += 1;
                updateCartDisplay();
            });
        });
        
        // Quantity input fields
        const quantityInputs = document.querySelectorAll('.quantity-input');
        quantityInputs.forEach(input => {
            input.addEventListener('change', function() {
                const index = parseInt(this.dataset.index);
                const newQuantity = parseInt(this.value);
                
                if (isNaN(newQuantity) || newQuantity < 1) {
                    this.value = cart[index].quantity;
                    return;
                }
                
                cart[index].quantity = newQuantity;
                updateCartDisplay();
            });
        });
        
        // Remove item buttons
        const removeButtons = document.querySelectorAll('.remove-item');
        removeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                cart.splice(index, 1);
                updateCartDisplay();
                updateCartCount();
                
                // Save cart to localStorage
                localStorage.setItem('coconutchCart', JSON.stringify(cart));
            });
        });
    }
    
    function updateCartDisplay() {
        // Re-open the cart modal to refresh the display
        openCartModal();
    }
    
    function openPaymentModal() {
        // Calculate total price for payment confirmation
        const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        // Display the payment modal
        paymentModal.style.display = 'block';
    }
    
    function openProductDetailModal(productName) {
        // Product database with details
        const productDetails = {
            'Pure Coconut Oil': {
                name: 'PURE COCONUT OIL',
                price: 60.00,
                description: 'Our 100% pure coconut oil is cold-pressed to preserve all natural nutrients and benefits. This versatile product can be used for skin moisturizing, hair conditioning, and even as a natural makeup remover. Free from additives, preservatives, and artificial fragrances.',
                benefits: ['Natural moisturizer for skin and hair', 'Helps reduce appearance of fine lines', 'Suitable for all skin types', 'Antimicrobial properties'],
                size: '50ml',
                ingredients: 'Pure, virgin coconut oil (Cocos nucifera)'
            },
            'Lemongrass Coconut Oil': {
                name: 'LEMONGRASS COCONUT OIL',
                price: 65.00,
                description: 'Our lemongrass-infused coconut oil combines the nourishing properties of coconut oil with refreshing lemongrass essence. This invigorating blend helps enhance relaxation while promoting skin health and providing a pleasant citrus aroma.',
                benefits: ['Natural mood enhancer', 'Promotes relaxation', 'Helps repel insects', 'Refreshing citrus scent'],
                size: '50ml',
                ingredients: 'Virgin coconut oil (Cocos nucifera), Lemongrass essential oil (Cymbopogon)'
            },
            'Origanum Coconut Oil': {
                name: 'ORIGANUM COCONUT OIL',
                price: 65.00,
                description: 'This specialty blend combines the moisturizing benefits of coconut oil with origanum (oregano) for a powerful wellness boost. Oregano is known for its strong antimicrobial properties, making this oil perfect for massage during cold season or for soothing muscle discomfort.',
                benefits: ['Powerful natural antiseptic', 'Immune-boosting properties', 'Soothes tired muscles', 'Warming sensation'],
                size: '50ml',
                ingredients: 'Virgin coconut oil (Cocos nucifera), Origanum (Oregano) essential oil (Origanum vulgare)'
            },
            'Peppermint Coconut Oil': {
                name: 'PEPPERMINT COCONUT OIL',
                price: 80.00,
                description: 'Our premium peppermint-infused coconut oil delivers a cooling sensation perfect for relieving muscle tension and easing headaches. The refreshing scent helps clear the mind while the coconut oil base delivers deep hydration to the skin.',
                benefits: ['Cooling sensation', 'Relieves muscle tension', 'Helps ease headaches', 'Mental clarity and focus'],
                size: '50ml',
                ingredients: 'Virgin coconut oil (Cocos nucifera), Peppermint essential oil (Mentha piperita)'
            }
        };
        
        // Get product info
        const product = productDetails[productName];
        if (!product) return;
        
        // Populate product detail container
        const productDetailContainer = document.getElementById('product-detail-container');
        
        // Replace spaces with hyphens and convert to lowercase for image filename
        const imageFileName = productName.toLowerCase().replace(/ /g, '-');
        
        productDetailContainer.innerHTML = `
            <div class="product-detail">
                <div class="product-detail-top">
                    <div class="product-detail-image">
                        <img src="images/${imageFileName}.jpg" alt="${product.name}">
                    </div>
                    <div class="product-detail-info">
                        <h2 class="product-detail-title">${product.name}</h2>
                        <div class="product-detail-price">₱${product.price.toFixed(2)}</div>
                        <p class="product-detail-description">${product.description}</p>
                        <div class="product-detail-actions">
                            <button class="add-to-cart" data-product="${productName}" data-price="${product.price}">ADD TO CART</button>
                            <button class="buy-now">BUY NOW</button>
                        </div>
                    </div>
                </div>
                
                <div class="product-detail-meta">
                    <div class="meta-item">
                        <div class="meta-label">Size:</div>
                        <div class="meta-value">${product.size}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Ingredients:</div>
                        <div class="meta-value">${product.ingredients}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Benefits:</div>
                        <div class="meta-value">
                            <ul class="benefits-list">
                                ${product.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners to the new buttons
        const addToCartButton = productDetailContainer.querySelector('.add-to-cart');
        addToCartButton.addEventListener('click', function() {
            const product = this.dataset.product;
            const price = parseFloat(this.dataset.price);
            
            // Check if product already exists in cart
            const existingProductIndex = cart.findIndex(item => item.product === product);
            
            if (existingProductIndex !== -1) {
                // Increment quantity if product already in cart
                cart[existingProductIndex].quantity += 1;
            } else {
                // Add new item to cart
                cart.push({
                    product: product,
                    price: price,
                    quantity: 1
                });
            }
            
            // Update cart count
            updateCartCount();
            
            // Save cart to localStorage
            localStorage.setItem('coconutchCart', JSON.stringify(cart));
            
            // Show notification
            showCartNotification(`${product} added to cart!`);
            
            // Close the product detail modal
            productDetailModal.style.display = 'none';
        });
        
        const buyNowButton = productDetailContainer.querySelector('.buy-now');
        buyNowButton.addEventListener('click', function() {
            const product = addToCartButton.dataset.product;
            const price = parseFloat(addToCartButton.dataset.price);
            
            // Clear cart and add only this product
            cart = [{
                product: product,
                price: price,
                quantity: 1
            }];
            
            // Update cart count
            updateCartCount();
            
            // Save cart to localStorage
            localStorage.setItem('coconutchCart', JSON.stringify(cart));
            
            // Close the product detail modal
            productDetailModal.style.display = 'none';
            
            // Open payment modal directly
            openPaymentModal();
        });
        
        // Display the modal
        productDetailModal.style.display = 'block';
    }
    
    async function updatePurchasesDisplay() {
        const purchasesList = document.getElementById('purchases-list');
        const noPurchasesMessage = document.getElementById('no-purchases-message');
        
        if (!purchasesList || !noPurchasesMessage) return;
        
        if (purchases.length === 0) {
            purchasesList.style.display = 'none';
            noPurchasesMessage.style.display = 'block';
        } else {
            purchasesList.style.display = 'block';
            noPurchasesMessage.style.display = 'none';
            
            // Clear the list
            purchasesList.innerHTML = '';
            
            // Process each purchase
            for (const purchase of purchases) {
                // Try to get latest status from server (if online)
                try {
                    const latestData = await fetchOrderStatus(purchase.id);
                    if (latestData && latestData.status) {
                        purchase.status = latestData.status;
                        // Update in localStorage too
                        localStorage.setItem('coconutchPurchases', JSON.stringify(purchases));
                    }
                } catch (error) {
                    // Use cached status if server unavailable
                    console.log('Using cached order status');
                }
                
                const purchaseDate = new Date(purchase.date);
                const formattedDate = purchaseDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                
                const purchaseElement = document.createElement('div');
                purchaseElement.className = 'purchase-item';
                
                let itemsList = '';
                purchase.items.forEach(item => {
                    itemsList += `
                        <div class="purchase-product">
                            <span class="purchase-product-name">${item.product}</span>
                            <span class="purchase-product-quantity">x${item.quantity}</span>
                            <span class="purchase-product-price">₱${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `;
                });
                
                purchaseElement.innerHTML = `
                    <div class="purchase-header">
                        <div class="purchase-id">Order #${purchase.id}</div>
                        <div class="purchase-date">${formattedDate}</div>
                        <div class="purchase-status ${purchase.status.toLowerCase()}">${purchase.status}</div>
                    </div>
                    <div class="purchase-details">
                        <div class="purchase-products">
                            ${itemsList}
                        </div>
                        <div class="purchase-info">
                            <div class="purchase-info-item">
                                <span class="info-label">Total:</span>
                                <span class="info-value">₱${purchase.total.toFixed(2)}</span>
                            </div>
                            <div class="purchase-info-item">
                                <span class="info-label">Payment Method:</span>
                                <span class="info-value">${purchase.paymentMethod === 'gcash' ? 'GCash' : 'Cash on Delivery'}</span>
                            </div>
                            <div class="purchase-info-item">
                                <span class="info-label">Delivery Address:</span>
                                <span class="info-value">${purchase.address}</span>
                            </div>
                        </div>
                    </div>
                `;
                
                purchasesList.appendChild(purchaseElement);
            }
        }
    }
});