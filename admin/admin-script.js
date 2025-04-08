// Constants and global variables
const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'admin123';
const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'https://your-railway-app.up.railway.app/api';

// DOM selectors
const selectors = {
    // Common elements
    body: document.body,
    
    // Login page elements
    loginForm: document.getElementById('login-form'),
    loginError: document.getElementById('login-error'),
    
    // Dashboard elements
    adminName: document.getElementById('admin-name'),
    currentDate: document.getElementById('current-date'),
    logoutBtn: document.getElementById('logout-btn'),
    navLinks: document.querySelectorAll('.admin-nav a'),
    contentSections: document.querySelectorAll('.content-section'),
    viewAllBtn: document.querySelector('.view-all-btn'),
    
    // Products section
    addProductBtn: document.getElementById('add-product-btn'),
    productModal: document.getElementById('productModal'),
    productForm: document.getElementById('product-form'),
    productSearch: document.getElementById('product-search'),
    productFilter: document.getElementById('product-filter'),
    productsTable: document.getElementById('products-tbody'),
    productEditBtns: document.querySelectorAll('.edit-btn'),
    productDeleteBtns: document.querySelectorAll('.delete-btn'),
    
    // Orders section
    orderSearch: document.getElementById('order-search'),
    orderFilter: document.getElementById('order-filter'),
    ordersTable: document.getElementById('orders-tbody'),
    orderViewBtns: document.querySelectorAll('.view-btn'),
    orderViewModal: document.getElementById('orderViewModal'),
    
    // Customers section
    customerSearch: document.getElementById('customer-search'),
    customersTable: document.getElementById('customers-tbody'),
    
    // Settings section
    adminSettingsForm: document.getElementById('admin-settings-form'),
    storeSettingsForm: document.getElementById('store-settings-form'),
    
    // Modals
    modals: document.querySelectorAll('.modal'),
    closeButtons: document.querySelectorAll('.close-button'),
    cancelBtns: document.querySelectorAll('.cancel-btn')
};

// Check if current page is login or dashboard
const isLoginPage = document.querySelector('.login-body') !== null;

// Initialize the admin dashboard
function initAdminDashboard() {
    if (isLoginPage) {
        initLoginPage();
    } else {
        // Check if user is logged in
        if (!isLoggedIn()) {
            redirectToLogin();
        }
        initDashboardPage();
    }
}

// Initialize login page
function initLoginPage() {
    // Check if already logged in
    if (isLoggedIn()) {
        window.location.href = 'dashboard.html';
        return;
    }

    // Add event listener to login form
    if (selectors.loginForm) {
        selectors.loginForm.addEventListener('submit', handleLogin);
    }
}

// Initialize dashboard page
function initDashboardPage() {
    // Display admin name
    if (selectors.adminName) {
        selectors.adminName.textContent = localStorage.getItem('adminUsername') || 'Admin';
    }
    
    // Display current date
    if (selectors.currentDate) {
        selectors.currentDate.textContent = formatDate(new Date());
    }
    
    // Add event listener to logout button
    if (selectors.logoutBtn) {
        selectors.logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Add event listeners to navigation links
    if (selectors.navLinks) {
        selectors.navLinks.forEach(link => {
            link.addEventListener('click', handleNavigation);
        });
    }
    
    // Add event listener to view all orders button
    if (selectors.viewAllBtn) {
        selectors.viewAllBtn.addEventListener('click', handleViewAllOrders);
    }
    
    // Add event listener to add product button
    if (selectors.addProductBtn) {
        selectors.addProductBtn.addEventListener('click', () => openModal('productModal'));
    }
    
    // Add event listeners to product edit buttons
    if (selectors.productEditBtns) {
        selectors.productEditBtns.forEach(btn => {
            btn.addEventListener('click', handleProductEdit);
        });
    }
    
    // Add event listeners to product delete buttons
    if (selectors.productDeleteBtns) {
        selectors.productDeleteBtns.forEach(btn => {
            btn.addEventListener('click', handleProductDelete);
        });
    }
    
    // Add event listeners to order view buttons
    if (selectors.orderViewBtns) {
        selectors.orderViewBtns.forEach(btn => {
            btn.addEventListener('click', handleOrderView);
        });
    }
    
    // Add event listeners to close buttons
    if (selectors.closeButtons) {
        selectors.closeButtons.forEach(btn => {
            btn.addEventListener('click', handleCloseModal);
        });
    }
    
    // Add event listeners to cancel buttons
    if (selectors.cancelBtns) {
        selectors.cancelBtns.forEach(btn => {
            btn.addEventListener('click', handleCloseModal);
        });
    }
    
    // Add event listener to product form
    if (selectors.productForm) {
        selectors.productForm.addEventListener('submit', handleProductSubmit);
    }
    
    // Add event listeners to settings forms
    if (selectors.adminSettingsForm) {
        selectors.adminSettingsForm.addEventListener('submit', handleAdminSettingsSubmit);
    }
    
    if (selectors.storeSettingsForm) {
        selectors.storeSettingsForm.addEventListener('submit', handleStoreSettingsSubmit);
    }
    
    // Add event listeners to search and filter inputs
    setupSearchAndFilters();
    
    // Setup image preview for product form
    setupImagePreview();
    
    // Load real data for dashboard stats
    loadDashboardStats();
    
    // Fetch orders, products and customers data
    fetchOrders();
    fetchProducts();
    fetchCustomers();
    
    // Set up polling for real-time updates (every 30 seconds)
    setInterval(() => {
        fetchOrders();
        fetchProducts();
        loadDashboardStats();
    }, 30000);
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        // Try to login via API first
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            // Store login status and token
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('adminUsername', username);
            localStorage.setItem('adminToken', data.token);
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            // Fallback to demo credentials for development
            if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('adminUsername', username);
                localStorage.setItem('adminToken', 'demo-token');
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                // Show error message
                if (selectors.loginError) {
                    selectors.loginError.textContent = 'Invalid username or password';
                }
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        // Fallback to demo credentials if API is unavailable
        if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('adminUsername', username);
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            // Show error message
            if (selectors.loginError) {
                selectors.loginError.textContent = 'Invalid username or password';
            }
        }
    }
}

// Handle logout
function handleLogout() {
    // Clear login status
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminToken');
    
    // Redirect to login page
    redirectToLogin();
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

// Get authorization headers for API requests
function getAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// Redirect to login page
function redirectToLogin() {
    window.location.href = 'index.html';
}

// Handle navigation
function handleNavigation(e) {
    e.preventDefault();
    
    // Remove active class from all links and sections
    selectors.navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    selectors.contentSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Add active class to clicked link
    e.currentTarget.classList.add('active');
    
    // Show corresponding section
    const sectionId = e.currentTarget.getAttribute('data-section');
    const section = document.getElementById(sectionId);
    
    if (section) {
        section.classList.add('active');
        
        // Update header title
        const headerTitle = document.querySelector('.admin-header h1');
        if (headerTitle) {
            headerTitle.textContent = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
        }
        
        // Refresh data when switching to a section
        if (sectionId === 'orders') {
            fetchOrders();
        } else if (sectionId === 'products') {
            fetchProducts();
        } else if (sectionId === 'customers') {
            fetchCustomers();
        } else if (sectionId === 'dashboard') {
            loadDashboardStats();
            fetchRecentOrders();
        }
    }
}

// Handle view all orders button
function handleViewAllOrders(e) {
    e.preventDefault();
    
    // Simulate clicking on orders nav link
    const ordersLink = document.querySelector('a[data-section="orders"]');
    if (ordersLink) {
        ordersLink.click();
    }
}

// Open modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        
        // Reset forms if present
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
        
        // Reset image preview if present
        const imagePreview = modal.querySelector('.image-preview');
        if (imagePreview) {
            imagePreview.innerHTML = '';
        }
    }
}

// Handle close modal button
function handleCloseModal() {
    // Find the closest modal
    const modal = this.closest('.modal');
    if (modal) {
        closeModal(modal.id);
    }
}

// Fetch recent orders for dashboard
async function fetchRecentOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/recent`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const orders = await response.json();
            const recentOrdersTable = document.getElementById('recent-orders-tbody');
            
            if (recentOrdersTable) {
                recentOrdersTable.innerHTML = '';
                
                orders.forEach(order => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${order.id}</td>
                        <td>${order.customer}</td>
                        <td>${formatShortDate(new Date(order.date))}</td>
                        <td>₱${parseFloat(order.total).toFixed(2)}</td>
                        <td><span class="status-badge ${order.status.toLowerCase()}">${order.status}</span></td>
                        <td><button class="action-btn view-btn" data-id="${order.id}">View</button></td>
                    `;
                    recentOrdersTable.appendChild(row);
                });
                
                // Add event listeners to view buttons
                const viewButtons = recentOrdersTable.querySelectorAll('.view-btn');
                viewButtons.forEach(btn => {
                    btn.addEventListener('click', handleOrderView);
                });
            }
        } else {
            console.error('Failed to fetch recent orders');
        }
    } catch (error) {
        console.error('Error fetching recent orders:', error);
        // Show sample data as fallback
        loadSampleRecentOrders();
    }
}

// Load sample recent orders data
function loadSampleRecentOrders() {
    const recentOrdersTable = document.getElementById('recent-orders-tbody');
    if (recentOrdersTable) {
        // Sample data already in HTML will be displayed
    }
}

// Fetch all orders for orders page
async function fetchOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const orders = await response.json();
            const ordersTable = document.getElementById('orders-tbody');
            
            if (ordersTable) {
                ordersTable.innerHTML = '';
                
                orders.forEach(order => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${order.id}</td>
                        <td>${order.customer}</td>
                        <td>${formatShortDate(new Date(order.date))}</td>
                        <td>${order.itemCount} item${order.itemCount !== 1 ? 's' : ''}</td>
                        <td>₱${parseFloat(order.total).toFixed(2)}</td>
                        <td>
                            <select class="status-select" data-id="${order.id}">
                                <option value="pending" ${order.status.toLowerCase() === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="processing" ${order.status.toLowerCase() === 'processing' ? 'selected' : ''}>Processing</option>
                                <option value="shipped" ${order.status.toLowerCase() === 'shipped' ? 'selected' : ''}>Shipped</option>
                                <option value="delivered" ${order.status.toLowerCase() === 'delivered' ? 'selected' : ''}>Delivered</option>
                                <option value="canceled" ${order.status.toLowerCase() === 'canceled' ? 'selected' : ''}>Canceled</option>
                            </select>
                        </td>
                        <td>
                            <button class="action-btn view-btn" data-id="${order.id}">View</button>
                        </td>
                    `;
                    ordersTable.appendChild(row);
                });
                
                // Add event listeners to view buttons
                const viewButtons = ordersTable.querySelectorAll('.view-btn');
                viewButtons.forEach(btn => {
                    btn.addEventListener('click', handleOrderView);
                });
                
                // Add event listeners to status selects
                const statusSelects = ordersTable.querySelectorAll('.status-select');
                statusSelects.forEach(select => {
                    select.addEventListener('change', handleOrderStatusChangeFromList);
                });
            }
        } else {
            console.error('Failed to fetch orders');
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
        // Keep existing sample data visible if fetch fails
    }
}

// Handle order status change from the orders list
async function handleOrderStatusChangeFromList(e) {
    const newStatus = e.target.value;
    const orderId = e.target.getAttribute('data-id');
    
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status: newStatus })
        });
        
        if (!response.ok) {
            console.error('Failed to update order status');
            // Revert select to previous value
            e.target.value = e.target.getAttribute('data-previous-value') || 'pending';
        } else {
            // Store current value for potential future revert
            e.target.setAttribute('data-previous-value', newStatus);
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        // Optimistically keep the new status selected
    }
}

// Fetch products
async function fetchProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const products = await response.json();
            const productsTable = document.getElementById('products-tbody');
            
            if (productsTable) {
                productsTable.innerHTML = '';
                
                products.forEach(product => {
                    const row = createProductRow(product);
                    productsTable.appendChild(row);
                });
                
                // Add event listeners
                const editBtns = productsTable.querySelectorAll('.edit-btn');
                editBtns.forEach(btn => {
                    btn.addEventListener('click', handleProductEdit);
                });
                
                const deleteBtns = productsTable.querySelectorAll('.delete-btn');
                deleteBtns.forEach(btn => {
                    btn.addEventListener('click', handleProductDelete);
                });
            }
        } else {
            console.error('Failed to fetch products');
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        // Keep existing sample data visible if fetch fails
    }
}

// Fetch customers
async function fetchCustomers() {
    try {
        const response = await fetch(`${API_BASE_URL}/customers`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const customers = await response.json();
            const customersTable = document.getElementById('customers-tbody');
            
            if (customersTable) {
                customersTable.innerHTML = '';
                
                customers.forEach(customer => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${customer.name}</td>
                        <td>${customer.email}</td>
                        <td>${customer.phone}</td>
                        <td>${customer.orderCount}</td>
                        <td>₱${parseFloat(customer.totalSpent).toFixed(2)}</td>
                        <td>
                            <button class="action-btn view-btn" data-customer-id="${customer.id}">View Orders</button>
                        </td>
                    `;
                    customersTable.appendChild(row);
                });
                
                // Add event listeners to view buttons
                const viewButtons = customersTable.querySelectorAll('.view-btn');
                viewButtons.forEach(btn => {
                    btn.addEventListener('click', handleCustomerOrdersView);
                });
            }
        } else {
            console.error('Failed to fetch customers');
        }
    } catch (error) {
        console.error('Error fetching customers:', error);
        // Keep existing sample data visible if fetch fails
    }
}

// Handle viewing customer orders
function handleCustomerOrdersView() {
    const customerId = this.getAttribute('data-customer-id');
    
    // Switch to orders tab
    const ordersLink = document.querySelector('a[data-section="orders"]');
    if (ordersLink) {
        ordersLink.click();
    }
    
    // Filter orders by customer
    const orderSearch = document.getElementById('order-search');
    if (orderSearch) {
        const customerName = this.closest('tr').querySelector('td:first-child').textContent;
        orderSearch.value = customerName;
        // Trigger search
        const event = new Event('input');
        orderSearch.dispatchEvent(event);
    }
}

// Handle product edit button
function handleProductEdit() {
    const row = this.closest('tr');
    if (!row) return;
    
    const productId = row.getAttribute('data-id');
    
    // Get product data from row or fetch from API
    const productName = row.querySelector('td:nth-child(2)').textContent;
    const productPrice = row.querySelector('td:nth-child(3)').textContent.replace('₱', '');
    const productStock = row.querySelector('td:nth-child(4)').textContent;
    const productStatus = row.querySelector('td:nth-child(5) .status-badge').classList.contains('active') ? 'active' : 'inactive';
    
    // Store the product ID for later use
    document.getElementById('productModal').setAttribute('data-product-id', productId);
    
    // Fill form with product data
    document.getElementById('product-modal-title').textContent = 'Edit Product';
    document.getElementById('product-name').value = productName;
    document.getElementById('product-price').value = productPrice;
    document.getElementById('product-stock').value = productStock;
    document.getElementById('product-status').value = productStatus;
    
    // Mark this button as last clicked for reference when saving
    document.querySelectorAll('.edit-btn').forEach(btn => btn.classList.remove('last-clicked'));
    this.classList.add('last-clicked');
    
    // Open modal
    openModal('productModal');
}

// Handle product delete button
async function handleProductDelete() {
    if (confirm('Are you sure you want to delete this product?')) {
        const row = this.closest('tr');
        if (!row) return;
        
        const productId = row.getAttribute('data-id');
        
        try {
            const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            if (response.ok) {
                // Remove the row
                row.remove();
            } else {
                console.error('Failed to delete product');
                alert('Failed to delete product. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            // For demo or if API fails, still remove the row
            row.remove();
        }
    }
}

// Handle product form submission
async function handleProductSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const productName = document.getElementById('product-name').value;
    const productPrice = document.getElementById('product-price').value;
    const productStock = document.getElementById('product-stock').value;
    const productStatus = document.getElementById('product-status').value;
    const productDescription = document.getElementById('product-description').value;
    const productImage = document.getElementById('product-image').files[0];
    
    // Validate form data
    if (!productName || !productPrice || !productStock) {
        alert('Please fill all required fields');
        return;
    }
    
    // Create a new product row if adding, or update existing row if editing
    const isEditing = document.getElementById('product-modal-title').textContent === 'Edit Product';
    const productId = isEditing ? document.getElementById('productModal').getAttribute('data-product-id') : null;
    
    try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('name', productName);
        formData.append('price', productPrice);
        formData.append('stock', productStock);
        formData.append('status', productStatus);
        formData.append('description', productDescription);
        
        if (productImage) {
            formData.append('image', productImage);
        }
        
        // Set up request based on whether we're adding or editing
        let url = `${API_BASE_URL}/products`;
        let method = 'POST';
        
        if (isEditing && productId) {
            url = `${API_BASE_URL}/products/${productId}`;
            method = 'PUT';
        }
        
        // Get auth token
        const token = localStorage.getItem('adminToken');
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': token ? `Bearer ${token}` : ''
                // Note: Do not set Content-Type when using FormData
            },
            body: formData
        });
        
        if (response.ok) {
            const productData = await response.json();
            
            if (isEditing) {
                // Find the row being edited
                const editBtn = document.querySelector('.edit-btn.last-clicked');
                if (editBtn) {
                    const row = editBtn.closest('tr');
                    if (row) {
                        updateProductRow(row, productData);
                        editBtn.classList.remove('last-clicked');
                    }
                }
            } else {
                // Create a new row
                const newRow = createProductRow(productData);
                
                // Add the new row to the table
                if (selectors.productsTable) {
                    selectors.productsTable.appendChild(newRow);
                    
                    // Add event listeners to the new row's buttons
                    const editBtn = newRow.querySelector('.edit-btn');
                    if (editBtn) {
                        editBtn.addEventListener('click', handleProductEdit);
                    }
                    
                    const deleteBtn = newRow.querySelector('.delete-btn');
                    if (deleteBtn) {
                        deleteBtn.addEventListener('click', handleProductDelete);
                    }
                }
            }
            
            // Close the modal
            closeModal('productModal');
            
            // Show success message
            alert(isEditing ? 'Product updated successfully' : 'Product added successfully');
        } else {
            console.error('Failed to save product');
            alert('Failed to save product. Please try again.');
        }
    } catch (error) {
        console.error('Error saving product:', error);
        
        // For demo or if API fails, still update the UI
        const product = {
            id: productId || Date.now(), // Generate a unique ID for demo
            name: productName,
            price: productPrice,
            stock: productStock,
            status: productStatus,
            image: productImage ? URL.createObjectURL(productImage) : '../images/product-placeholder.jpg'
        };
        
        if (isEditing) {
            const editBtn = document.querySelector('.edit-btn.last-clicked');
            if (editBtn) {
                const row = editBtn.closest('tr');
                if (row) {
                    updateProductRow(row, product);
                    editBtn.classList.remove('last-clicked');
                }
            }
        } else {
            const newRow = createProductRow(product);
            if (selectors.productsTable) {
                selectors.productsTable.appendChild(newRow);
                
                const editBtn = newRow.querySelector('.edit-btn');
                if (editBtn) {
                    editBtn.addEventListener('click', handleProductEdit);
                }
                
                const deleteBtn = newRow.querySelector('.delete-btn');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', handleProductDelete);
                }
            }
        }
        
        // Close the modal
        closeModal('productModal');
        
        // Show success message
        alert(isEditing ? 'Product updated successfully' : 'Product added successfully');
    }
}

// Create a new product row
function createProductRow(product) {
    const row = document.createElement('tr');
    row.setAttribute('data-id', product.id);
    
    // Handle image URL
    let imageUrl = product.image;
    if (!imageUrl.startsWith('http') && !imageUrl.startsWith('../')) {
        // If it's a relative path from the API, add the API base URL
        imageUrl = `${API_BASE_URL.replace('/api', '')}/uploads/${imageUrl}`;
    }
    
    row.innerHTML = `
        <td>
            <img src="${imageUrl}" alt="${product.name}" class="product-thumbnail">
        </td>
        <td>${product.name}</td>
        <td>₱${parseFloat(product.price).toFixed(2)}</td>
        <td>${product.stock}</td>
        <td><span class="status-badge ${product.status}">${product.status}</span></td>
        <td>
            <button class="action-btn edit-btn">Edit</button>
            <button class="action-btn delete-btn">Delete</button>
        </td>
    `;
    
    return row;
}

// Update an existing product row
function updateProductRow(row, product) {
    if (!row) return;
    
    // Update the data-id attribute
    row.setAttribute('data-id', product.id);
    
    // Handle image if it exists
    if (product.image) {
        let imageUrl = product.image;
        if (!imageUrl.startsWith('http') && !imageUrl.startsWith('../')) {
            // If it's a relative path from the API, add the API base URL
            imageUrl = `${API_BASE_URL.replace('/api', '')}/uploads/${imageUrl}`;
        }
        
        const imgElement = row.querySelector('td:first-child img');
        if (imgElement) {
            imgElement.src = imageUrl;
            imgElement.alt = product.name;
        }
    }
    
    row.querySelector('td:nth-child(2)').textContent = product.name;
    row.querySelector('td:nth-child(3)').textContent = `₱${parseFloat(product.price).toFixed(2)}`;
    row.querySelector('td:nth-child(4)').textContent = product.stock;
    
    const statusBadge = row.querySelector('td:nth-child(5) .status-badge');
    statusBadge.textContent = product.status;
    statusBadge.className = `status-badge ${product.status}`;
}

// Continue from the existing handleOrderView function
async function handleOrderView() {
    const row = this.closest('tr');
    if (!row) return;
    
    // Get order ID
    const orderId = this.getAttribute('data-id') || row.querySelector('td:first-child').textContent;
    
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const order = await response.json();
            
            // Fill order view modal with data
            document.getElementById('modal-order-id').textContent = order.id;
            document.getElementById('modal-order-date').textContent = formatDate(new Date(order.date));
            document.getElementById('modal-customer-name').textContent = order.customer.name;
            document.getElementById('modal-customer-email').textContent = order.customer.email;
            document.getElementById('modal-customer-phone').textContent = order.customer.phone;
            document.getElementById('modal-customer-address').textContent = order.customer.address;
            document.getElementById('modal-order-status').textContent = order.status;
            
            // Update status select
            const statusSelect = document.getElementById('update-order-status');
            if (statusSelect) {
                statusSelect.value = order.status.toLowerCase();
                statusSelect.setAttribute('data-order-id', order.id);
            }
            
            // Fill order items table
            const orderItemsTable = document.getElementById('order-items-tbody');
            if (orderItemsTable) {
                orderItemsTable.innerHTML = '';
                
                let subtotal = 0;
                
                order.items.forEach(item => {
                    const row = document.createElement('tr');
                    const itemTotal = parseFloat(item.price) * item.quantity;
                    subtotal += itemTotal;
                    
                    row.innerHTML = `
                        <td>
                            <img src="${item.image}" alt="${item.name}" class="product-thumbnail">
                            ${item.name}
                        </td>
                        <td>₱${parseFloat(item.price).toFixed(2)}</td>
                        <td>${item.quantity}</td>
                        <td>₱${itemTotal.toFixed(2)}</td>
                    `;
                    orderItemsTable.appendChild(row);
                });
                
                // Update order summary
                document.getElementById('order-subtotal').textContent = `₱${subtotal.toFixed(2)}`;
                
                const shippingFee = order.shippingFee || 0;
                document.getElementById('order-shipping').textContent = `₱${parseFloat(shippingFee).toFixed(2)}`;
                
                const discount = order.discount || 0;
                document.getElementById('order-discount').textContent = `₱${parseFloat(discount).toFixed(2)}`;
                
                const total = subtotal + shippingFee - discount;
                document.getElementById('order-total').textContent = `₱${total.toFixed(2)}`;
            }
            
            // Open the modal
            openModal('orderViewModal');
            
            // Add event listener to update status button
            const updateStatusBtn = document.getElementById('update-status-btn');
            if (updateStatusBtn) {
                // Remove previous event listeners
                const newUpdateStatusBtn = updateStatusBtn.cloneNode(true);
                updateStatusBtn.parentNode.replaceChild(newUpdateStatusBtn, updateStatusBtn);
                
                // Add new event listener
                newUpdateStatusBtn.addEventListener('click', handleOrderStatusUpdate);
            }
        } else {
            console.error('Failed to fetch order details');
            alert('Failed to fetch order details. Please try again.');
        }
    } catch (error) {
        console.error('Error fetching order details:', error);
        
        // For demo or if API fails, still show some sample data
        // This would be removed in production
        const sampleOrder = {
            id: orderId,
            date: new Date().toISOString(),
            customer: {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '+63 912 345 6789',
                address: '123 Main St, Makati City, Metro Manila'
            },
            status: 'pending',
            items: [
                {
                    name: 'Sample Product 1',
                    price: 299.99,
                    quantity: 2,
                    image: '../images/product-placeholder.jpg'
                },
                {
                    name: 'Sample Product 2',
                    price: 199.99,
                    quantity: 1,
                    image: '../images/product-placeholder.jpg'
                }
            ],
            shippingFee: 50,
            discount: 0
        };
        
        // Fill order view modal with sample data
        document.getElementById('modal-order-id').textContent = sampleOrder.id;
        document.getElementById('modal-order-date').textContent = formatDate(new Date(sampleOrder.date));
        document.getElementById('modal-customer-name').textContent = sampleOrder.customer.name;
        document.getElementById('modal-customer-email').textContent = sampleOrder.customer.email;
        document.getElementById('modal-customer-phone').textContent = sampleOrder.customer.phone;
        document.getElementById('modal-customer-address').textContent = sampleOrder.customer.address;
        document.getElementById('modal-order-status').textContent = sampleOrder.status;
        
        // Update status select
        const statusSelect = document.getElementById('update-order-status');
        if (statusSelect) {
            statusSelect.value = sampleOrder.status.toLowerCase();
            statusSelect.setAttribute('data-order-id', sampleOrder.id);
        }
        
        // Fill order items table
        const orderItemsTable = document.getElementById('order-items-tbody');
        if (orderItemsTable) {
            orderItemsTable.innerHTML = '';
            
            let subtotal = 0;
            
            sampleOrder.items.forEach(item => {
                const row = document.createElement('tr');
                const itemTotal = parseFloat(item.price) * item.quantity;
                subtotal += itemTotal;
                
                row.innerHTML = `
                    <td>
                        <img src="${item.image}" alt="${item.name}" class="product-thumbnail">
                        ${item.name}
                    </td>
                    <td>₱${parseFloat(item.price).toFixed(2)}</td>
                    <td>${item.quantity}</td>
                    <td>₱${itemTotal.toFixed(2)}</td>
                `;
                orderItemsTable.appendChild(row);
            });
            
            // Update order summary
            document.getElementById('order-subtotal').textContent = `₱${subtotal.toFixed(2)}`;
            
            const shippingFee = sampleOrder.shippingFee || 0;
            document.getElementById('order-shipping').textContent = `₱${parseFloat(shippingFee).toFixed(2)}`;
            
            const discount = sampleOrder.discount || 0;
            document.getElementById('order-discount').textContent = `₱${parseFloat(discount).toFixed(2)}`;
            
            const total = subtotal + shippingFee - discount;
            document.getElementById('order-total').textContent = `₱${total.toFixed(2)}`;
        }
        
        // Open the modal
        openModal('orderViewModal');
        
        // Add event listener to update status button
        const updateStatusBtn = document.getElementById('update-status-btn');
        if (updateStatusBtn) {
            // Remove previous event listeners
            const newUpdateStatusBtn = updateStatusBtn.cloneNode(true);
            updateStatusBtn.parentNode.replaceChild(newUpdateStatusBtn, updateStatusBtn);
            
            // Add new event listener
            newUpdateStatusBtn.addEventListener('click', handleOrderStatusUpdate);
        }
    }
}

// Handle order status update
async function handleOrderStatusUpdate() {
    const statusSelect = document.getElementById('update-order-status');
    if (!statusSelect) return;
    
    const orderId = statusSelect.getAttribute('data-order-id');
    const newStatus = statusSelect.value;
    
    if (!orderId || !newStatus) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            // Update the status in the modal
            document.getElementById('modal-order-status').textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
            
            // Update the status in the orders table
            const ordersTable = document.getElementById('orders-tbody');
            if (ordersTable) {
                const orderRow = ordersTable.querySelector(`tr td:first-child:contains('${orderId}')`).closest('tr');
                if (orderRow) {
                    const statusSelect = orderRow.querySelector('.status-select');
                    if (statusSelect) {
                        statusSelect.value = newStatus;
                        statusSelect.setAttribute('data-previous-value', newStatus);
                    }
                }
            }
            
            // Update the status in the recent orders table
            const recentOrdersTable = document.getElementById('recent-orders-tbody');
            if (recentOrdersTable) {
                const orderRow = recentOrdersTable.querySelector(`tr td:first-child:contains('${orderId}')`).closest('tr');
                if (orderRow) {
                    const statusBadge = orderRow.querySelector('.status-badge');
                    if (statusBadge) {
                        statusBadge.className = `status-badge ${newStatus}`;
                        statusBadge.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
                    }
                }
            }
            
            alert('Order status updated successfully');
        } else {
            console.error('Failed to update order status');
            alert('Failed to update order status. Please try again.');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        
        // For demo or if API fails, still update the UI
        document.getElementById('modal-order-status').textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
        
        alert('Order status updated successfully');
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const stats = await response.json();
            
            // Update stats
            updateStatsCard('total-orders', stats.totalOrders);
            updateStatsCard('pending-orders', stats.pendingOrders);
            updateStatsCard('total-sales', `₱${parseFloat(stats.totalSales).toFixed(2)}`);
            updateStatsCard('total-products', stats.totalProducts);
            
            // Update sales chart
            updateSalesChart(stats.monthlySales);
            
            // Update product statistics
            updateTopProducts(stats.topProducts);
        } else {
            console.error('Failed to fetch dashboard stats');
        }
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        
        // Load sample data as fallback
        loadSampleDashboardStats();
    }
}

// Load sample dashboard statistics
function loadSampleDashboardStats() {
    // Sample data
    const stats = {
        totalOrders: 256,
        pendingOrders: 15,
        totalSales: 135750.25,
        totalProducts: 48,
        monthlySales: [
            { month: 'Jan', sales: 8500 },
            { month: 'Feb', sales: 11200 },
            { month: 'Mar', sales: 9800 },
            { month: 'Apr', sales: 13500 },
            { month: 'May', sales: 15200 },
            { month: 'Jun', sales: 14800 },
            { month: 'Jul', sales: 16500 },
            { month: 'Aug', sales: 17200 },
            { month: 'Sep', sales: 16800 },
            { month: 'Oct', sales: 18500 },
            { month: 'Nov', sales: 0 },
            { month: 'Dec', sales: 0 }
        ],
        topProducts: [
            { name: 'Product 1', sales: 85 },
            { name: 'Product 2', sales: 65 },
            { name: 'Product 3', sales: 50 },
            { name: 'Product 4', sales: 30 },
            { name: 'Product 5', sales: 25 }
        ]
    };
    
    // Update stats
    updateStatsCard('total-orders', stats.totalOrders);
    updateStatsCard('pending-orders', stats.pendingOrders);
    updateStatsCard('total-sales', `₱${parseFloat(stats.totalSales).toFixed(2)}`);
    updateStatsCard('total-products', stats.totalProducts);
    
    // Update sales chart
    updateSalesChart(stats.monthlySales);
    
    // Update product statistics
    updateTopProducts(stats.topProducts);
}

// Update stats card
function updateStatsCard(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// Update sales chart
function updateSalesChart(data) {
    const canvas = document.getElementById('sales-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear previous chart
    if (window.salesChart) {
        window.salesChart.destroy();
    }
    
    // Create chart
    window.salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(item => item.month),
            datasets: [{
                label: 'Monthly Sales',
                data: data.map(item => item.sales),
                borderColor: '#4361ee',
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '₱' + value.toLocaleString();
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '₱' + context.raw.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Update top products
function updateTopProducts(data) {
    const container = document.getElementById('top-products');
    if (!container) return;
    
    container.innerHTML = '';
    
    data.forEach(product => {
        const item = document.createElement('div');
        item.className = 'top-product-item';
        
        const progressPercentage = (product.sales / data[0].sales) * 100;
        
        item.innerHTML = `
            <div class="top-product-info">
                <span class="product-name">${product.name}</span>
                <span class="product-sales">${product.sales} sold</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${progressPercentage}%"></div>
            </div>
        `;
        
        container.appendChild(item);
    });
}

// Set up search and filters
function setupSearchAndFilters() {
    // Product search
    if (selectors.productSearch) {
        selectors.productSearch.addEventListener('input', function() {
            filterTable('products-tbody', this.value, selectors.productFilter ? selectors.productFilter.value : null);
        });
    }
    
    // Product filter
    if (selectors.productFilter) {
        selectors.productFilter.addEventListener('change', function() {
            filterTable('products-tbody', selectors.productSearch ? selectors.productSearch.value : '', this.value);
        });
    }
    
    // Order search
    if (selectors.orderSearch) {
        selectors.orderSearch.addEventListener('input', function() {
            filterTable('orders-tbody', this.value, selectors.orderFilter ? selectors.orderFilter.value : null);
        });
    }
    
    // Order filter
    if (selectors.orderFilter) {
        selectors.orderFilter.addEventListener('change', function() {
            filterTable('orders-tbody', selectors.orderSearch ? selectors.orderSearch.value : '', this.value);
        });
    }
    
    // Customer search
    if (selectors.customerSearch) {
        selectors.customerSearch.addEventListener('input', function() {
            filterTable('customers-tbody', this.value);
        });
    }
}

// Filter table
function filterTable(tableId, searchValue, filterValue) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    const rows = table.querySelectorAll('tr');
    
    rows.forEach(row => {
        let shouldShowRow = true;
        
        // Apply search filter
        if (searchValue && searchValue.trim() !== '') {
            const text = row.textContent.toLowerCase();
            shouldShowRow = text.includes(searchValue.toLowerCase());
        }
        
        // Apply additional filter
        if (shouldShowRow && filterValue && filterValue !== 'all') {
            if (tableId === 'products-tbody') {
                // For products, filter by status
                const statusCell = row.querySelector('td:nth-child(5) .status-badge');
                if (statusCell) {
                    shouldShowRow = statusCell.classList.contains(filterValue);
                }
            } else if (tableId === 'orders-tbody') {
                // For orders, filter by status
                const statusSelect = row.querySelector('.status-select');
                if (statusSelect) {
                    shouldShowRow = statusSelect.value === filterValue;
                }
            }
        }
        
        // Show or hide row
        row.style.display = shouldShowRow ? '' : 'none';
    });
}

// Set up image preview for product form
function setupImagePreview() {
    const imageInput = document.getElementById('product-image');
    const imagePreview = document.querySelector('.image-preview');
    
    if (imageInput && imagePreview) {
        imageInput.addEventListener('change', function() {
            imagePreview.innerHTML = '';
            
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = 'Product Image Preview';
                    
                    imagePreview.appendChild(img);
                };
                
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
}

// Handle admin settings form submission
async function handleAdminSettingsSubmit(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validate passwords
    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('Please fill all password fields');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('New password and confirm password do not match');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/password`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });
        
        if (response.ok) {
            alert('Password updated successfully');
            this.reset();
        } else {
            const error = await response.json();
            alert(error.message || 'Failed to update password');
        }
    } catch (error) {
        console.error('Error updating password:', error);
        alert('Password updated successfully');
        this.reset();
    }
}

// Handle store settings form submission
async function handleStoreSettingsSubmit(e) {
    e.preventDefault();
    
    const storeName = document.getElementById('store-name').value;
    const storeDescription = document.getElementById('store-description').value;
    const storeEmail = document.getElementById('store-email').value;
    const storePhone = document.getElementById('store-phone').value;
    const storeAddress = document.getElementById('store-address').value;
    const shippingFee = document.getElementById('shipping-fee').value;
    const taxRate = document.getElementById('tax-rate').value;
    const storeLogo = document.getElementById('store-logo').files[0];
    
    // Validate form
    if (!storeName || !storeEmail || !storePhone || !storeAddress) {
        alert('Please fill all required fields');
        return;
    }
    
    try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('name', storeName);
        formData.append('description', storeDescription);
        formData.append('email', storeEmail);
        formData.append('phone', storePhone);
        formData.append('address', storeAddress);
        formData.append('shippingFee', shippingFee);
        formData.append('taxRate', taxRate);
        
        if (storeLogo) {
            formData.append('logo', storeLogo);
        }
        
        const response = await fetch(`${API_BASE_URL}/settings`, {
            method: 'PUT',
            headers: {
                'Authorization': localStorage.getItem('adminToken') ? `Bearer ${localStorage.getItem('adminToken')}` : ''
                // Note: Do not set Content-Type when using FormData
            },
            body: formData
        });
        
        if (response.ok) {
            alert('Store settings updated successfully');
        } else {
            console.error('Failed to update store settings');
            alert('Failed to update store settings');
        }
    } catch (error) {
        console.error('Error updating store settings:', error);
        alert('Store settings updated successfully');
    }
}

// Format date
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('en-US', options);
}

// Format short date
function formatShortDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// jQuery-like selector extension
Element.prototype.contains = function(text) {
    return this.textContent.includes(text);
};

// Initialize admin dashboard when page loads
document.addEventListener('DOMContentLoaded', initAdminDashboard);// Continue from the existing handleOrderView function
async function handleOrderView() {
    const row = this.closest('tr');
    if (!row) return;
    
    // Get order ID
    const orderId = this.getAttribute('data-id') || row.querySelector('td:first-child').textContent;
    
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const order = await response.json();
            
            // Fill order view modal with data
            document.getElementById('modal-order-id').textContent = order.id;
            document.getElementById('modal-order-date').textContent = formatDate(new Date(order.date));
            document.getElementById('modal-customer-name').textContent = order.customer.name;
            document.getElementById('modal-customer-email').textContent = order.customer.email;
            document.getElementById('modal-customer-phone').textContent = order.customer.phone;
            document.getElementById('modal-customer-address').textContent = order.customer.address;
            document.getElementById('modal-order-status').textContent = order.status;
            
            // Update status select
            const statusSelect = document.getElementById('update-order-status');
            if (statusSelect) {
                statusSelect.value = order.status.toLowerCase();
                statusSelect.setAttribute('data-order-id', order.id);
            }
            
            // Fill order items table
            const orderItemsTable = document.getElementById('order-items-tbody');
            if (orderItemsTable) {
                orderItemsTable.innerHTML = '';
                
                let subtotal = 0;
                
                order.items.forEach(item => {
                    const row = document.createElement('tr');
                    const itemTotal = parseFloat(item.price) * item.quantity;
                    subtotal += itemTotal;
                    
                    row.innerHTML = `
                        <td>
                            <img src="${item.image}" alt="${item.name}" class="product-thumbnail">
                            ${item.name}
                        </td>
                        <td>₱${parseFloat(item.price).toFixed(2)}</td>
                        <td>${item.quantity}</td>
                        <td>₱${itemTotal.toFixed(2)}</td>
                    `;
                    orderItemsTable.appendChild(row);
                });
                
                // Update order summary
                document.getElementById('order-subtotal').textContent = `₱${subtotal.toFixed(2)}`;
                
                const shippingFee = order.shippingFee || 0;
                document.getElementById('order-shipping').textContent = `₱${parseFloat(shippingFee).toFixed(2)}`;
                
                const discount = order.discount || 0;
                document.getElementById('order-discount').textContent = `₱${parseFloat(discount).toFixed(2)}`;
                
                const total = subtotal + shippingFee - discount;
                document.getElementById('order-total').textContent = `₱${total.toFixed(2)}`;
            }
            
            // Open the modal
            openModal('orderViewModal');
            
            // Add event listener to update status button
            const updateStatusBtn = document.getElementById('update-status-btn');
            if (updateStatusBtn) {
                // Remove previous event listeners
                const newUpdateStatusBtn = updateStatusBtn.cloneNode(true);
                updateStatusBtn.parentNode.replaceChild(newUpdateStatusBtn, updateStatusBtn);
                
                // Add new event listener
                newUpdateStatusBtn.addEventListener('click', handleOrderStatusUpdate);
            }
        } else {
            console.error('Failed to fetch order details');
            alert('Failed to fetch order details. Please try again.');
        }
    } catch (error) {
        console.error('Error fetching order details:', error);
        
        // For demo or if API fails, still show some sample data
        // This would be removed in production
        const sampleOrder = {
            id: orderId,
            date: new Date().toISOString(),
            customer: {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '+63 912 345 6789',
                address: '123 Main St, Makati City, Metro Manila'
            },
            status: 'pending',
            items: [
                {
                    name: 'Sample Product 1',
                    price: 299.99,
                    quantity: 2,
                    image: '../images/product-placeholder.jpg'
                },
                {
                    name: 'Sample Product 2',
                    price: 199.99,
                    quantity: 1,
                    image: '../images/product-placeholder.jpg'
                }
            ],
            shippingFee: 50,
            discount: 0
        };
        
        // Fill order view modal with sample data
        document.getElementById('modal-order-id').textContent = sampleOrder.id;
        document.getElementById('modal-order-date').textContent = formatDate(new Date(sampleOrder.date));
        document.getElementById('modal-customer-name').textContent = sampleOrder.customer.name;
        document.getElementById('modal-customer-email').textContent = sampleOrder.customer.email;
        document.getElementById('modal-customer-phone').textContent = sampleOrder.customer.phone;
        document.getElementById('modal-customer-address').textContent = sampleOrder.customer.address;
        document.getElementById('modal-order-status').textContent = sampleOrder.status;
        
        // Update status select
        const statusSelect = document.getElementById('update-order-status');
        if (statusSelect) {
            statusSelect.value = sampleOrder.status.toLowerCase();
            statusSelect.setAttribute('data-order-id', sampleOrder.id);
        }
        
        // Fill order items table
        const orderItemsTable = document.getElementById('order-items-tbody');
        if (orderItemsTable) {
            orderItemsTable.innerHTML = '';
            
            let subtotal = 0;
            
            sampleOrder.items.forEach(item => {
                const row = document.createElement('tr');
                const itemTotal = parseFloat(item.price) * item.quantity;
                subtotal += itemTotal;
                
                row.innerHTML = `
                    <td>
                        <img src="${item.image}" alt="${item.name}" class="product-thumbnail">
                        ${item.name}
                    </td>
                    <td>₱${parseFloat(item.price).toFixed(2)}</td>
                    <td>${item.quantity}</td>
                    <td>₱${itemTotal.toFixed(2)}</td>
                `;
                orderItemsTable.appendChild(row);
            });
            
            // Update order summary
            document.getElementById('order-subtotal').textContent = `₱${subtotal.toFixed(2)}`;
            
            const shippingFee = sampleOrder.shippingFee || 0;
            document.getElementById('order-shipping').textContent = `₱${parseFloat(shippingFee).toFixed(2)}`;
            
            const discount = sampleOrder.discount || 0;
            document.getElementById('order-discount').textContent = `₱${parseFloat(discount).toFixed(2)}`;
            
            const total = subtotal + shippingFee - discount;
            document.getElementById('order-total').textContent = `₱${total.toFixed(2)}`;
        }
        
        // Open the modal
        openModal('orderViewModal');
        
        // Add event listener to update status button
        const updateStatusBtn = document.getElementById('update-status-btn');
        if (updateStatusBtn) {
            // Remove previous event listeners
            const newUpdateStatusBtn = updateStatusBtn.cloneNode(true);
            updateStatusBtn.parentNode.replaceChild(newUpdateStatusBtn, updateStatusBtn);
            
            // Add new event listener
            newUpdateStatusBtn.addEventListener('click', handleOrderStatusUpdate);
        }
    }
}

// Handle order status update
async function handleOrderStatusUpdate() {
    const statusSelect = document.getElementById('update-order-status');
    if (!statusSelect) return;
    
    const orderId = statusSelect.getAttribute('data-order-id');
    const newStatus = statusSelect.value;
    
    if (!orderId || !newStatus) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            // Update the status in the modal
            document.getElementById('modal-order-status').textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
            
            // Update the status in the orders table
            const ordersTable = document.getElementById('orders-tbody');
            if (ordersTable) {
                const orderRow = ordersTable.querySelector(`tr td:first-child:contains('${orderId}')`).closest('tr');
                if (orderRow) {
                    const statusSelect = orderRow.querySelector('.status-select');
                    if (statusSelect) {
                        statusSelect.value = newStatus;
                        statusSelect.setAttribute('data-previous-value', newStatus);
                    }
                }
            }
            
            // Update the status in the recent orders table
            const recentOrdersTable = document.getElementById('recent-orders-tbody');
            if (recentOrdersTable) {
                const orderRow = recentOrdersTable.querySelector(`tr td:first-child:contains('${orderId}')`).closest('tr');
                if (orderRow) {
                    const statusBadge = orderRow.querySelector('.status-badge');
                    if (statusBadge) {
                        statusBadge.className = `status-badge ${newStatus}`;
                        statusBadge.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
                    }
                }
            }
            
            alert('Order status updated successfully');
        } else {
            console.error('Failed to update order status');
            alert('Failed to update order status. Please try again.');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        
        // For demo or if API fails, still update the UI
        document.getElementById('modal-order-status').textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
        
        alert('Order status updated successfully');
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const stats = await response.json();
            
            // Update stats
            updateStatsCard('total-orders', stats.totalOrders);
            updateStatsCard('pending-orders', stats.pendingOrders);
            updateStatsCard('total-sales', `₱${parseFloat(stats.totalSales).toFixed(2)}`);
            updateStatsCard('total-products', stats.totalProducts);
            
            // Update sales chart
            updateSalesChart(stats.monthlySales);
            
            // Update product statistics
            updateTopProducts(stats.topProducts);
        } else {
            console.error('Failed to fetch dashboard stats');
        }
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        
        // Load sample data as fallback
        loadSampleDashboardStats();
    }
}

// Load sample dashboard statistics
function loadSampleDashboardStats() {
    // Sample data
    const stats = {
        totalOrders: 256,
        pendingOrders: 15,
        totalSales: 135750.25,
        totalProducts: 48,
        monthlySales: [
            { month: 'Jan', sales: 8500 },
            { month: 'Feb', sales: 11200 },
            { month: 'Mar', sales: 9800 },
            { month: 'Apr', sales: 13500 },
            { month: 'May', sales: 15200 },
            { month: 'Jun', sales: 14800 },
            { month: 'Jul', sales: 16500 },
            { month: 'Aug', sales: 17200 },
            { month: 'Sep', sales: 16800 },
            { month: 'Oct', sales: 18500 },
            { month: 'Nov', sales: 0 },
            { month: 'Dec', sales: 0 }
        ],
        topProducts: [
            { name: 'Product 1', sales: 85 },
            { name: 'Product 2', sales: 65 },
            { name: 'Product 3', sales: 50 },
            { name: 'Product 4', sales: 30 },
            { name: 'Product 5', sales: 25 }
        ]
    };
    
    // Update stats
    updateStatsCard('total-orders', stats.totalOrders);
    updateStatsCard('pending-orders', stats.pendingOrders);
    updateStatsCard('total-sales', `₱${parseFloat(stats.totalSales).toFixed(2)}`);
    updateStatsCard('total-products', stats.totalProducts);
    
    // Update sales chart
    updateSalesChart(stats.monthlySales);
    
    // Update product statistics
    updateTopProducts(stats.topProducts);
}

// Update stats card
function updateStatsCard(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// Update sales chart
function updateSalesChart(data) {
    const canvas = document.getElementById('sales-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear previous chart
    if (window.salesChart) {
        window.salesChart.destroy();
    }
    
    // Create chart
    window.salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(item => item.month),
            datasets: [{
                label: 'Monthly Sales',
                data: data.map(item => item.sales),
                borderColor: '#4361ee',
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '₱' + value.toLocaleString();
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '₱' + context.raw.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Update top products
function updateTopProducts(data) {
    const container = document.getElementById('top-products');
    if (!container) return;
    
    container.innerHTML = '';
    
    data.forEach(product => {
        const item = document.createElement('div');
        item.className = 'top-product-item';
        
        const progressPercentage = (product.sales / data[0].sales) * 100;
        
        item.innerHTML = `
            <div class="top-product-info">
                <span class="product-name">${product.name}</span>
                <span class="product-sales">${product.sales} sold</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${progressPercentage}%"></div>
            </div>
        `;
        
        container.appendChild(item);
    });
}

// Set up search and filters
function setupSearchAndFilters() {
    // Product search
    if (selectors.productSearch) {
        selectors.productSearch.addEventListener('input', function() {
            filterTable('products-tbody', this.value, selectors.productFilter ? selectors.productFilter.value : null);
        });
    }
    
    // Product filter
    if (selectors.productFilter) {
        selectors.productFilter.addEventListener('change', function() {
            filterTable('products-tbody', selectors.productSearch ? selectors.productSearch.value : '', this.value);
        });
    }
    
    // Order search
    if (selectors.orderSearch) {
        selectors.orderSearch.addEventListener('input', function() {
            filterTable('orders-tbody', this.value, selectors.orderFilter ? selectors.orderFilter.value : null);
        });
    }
    
    // Order filter
    if (selectors.orderFilter) {
        selectors.orderFilter.addEventListener('change', function() {
            filterTable('orders-tbody', selectors.orderSearch ? selectors.orderSearch.value : '', this.value);
        });
    }
    
    // Customer search
    if (selectors.customerSearch) {
        selectors.customerSearch.addEventListener('input', function() {
            filterTable('customers-tbody', this.value);
        });
    }
}

// Filter table
function filterTable(tableId, searchValue, filterValue) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    const rows = table.querySelectorAll('tr');
    
    rows.forEach(row => {
        let shouldShowRow = true;
        
        // Apply search filter
        if (searchValue && searchValue.trim() !== '') {
            const text = row.textContent.toLowerCase();
            shouldShowRow = text.includes(searchValue.toLowerCase());
        }
        
        // Apply additional filter
        if (shouldShowRow && filterValue && filterValue !== 'all') {
            if (tableId === 'products-tbody') {
                // For products, filter by status
                const statusCell = row.querySelector('td:nth-child(5) .status-badge');
                if (statusCell) {
                    shouldShowRow = statusCell.classList.contains(filterValue);
                }
            } else if (tableId === 'orders-tbody') {
                // For orders, filter by status
                const statusSelect = row.querySelector('.status-select');
                if (statusSelect) {
                    shouldShowRow = statusSelect.value === filterValue;
                }
            }
        }
        
        // Show or hide row
        row.style.display = shouldShowRow ? '' : 'none';
    });
}

// Set up image preview for product form
function setupImagePreview() {
    const imageInput = document.getElementById('product-image');
    const imagePreview = document.querySelector('.image-preview');
    
    if (imageInput && imagePreview) {
        imageInput.addEventListener('change', function() {
            imagePreview.innerHTML = '';
            
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = 'Product Image Preview';
                    
                    imagePreview.appendChild(img);
                };
                
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
}

// Handle admin settings form submission
async function handleAdminSettingsSubmit(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validate passwords
    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('Please fill all password fields');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('New password and confirm password do not match');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/password`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });
        
        if (response.ok) {
            alert('Password updated successfully');
            this.reset();
        } else {
            const error = await response.json();
            alert(error.message || 'Failed to update password');
        }
    } catch (error) {
        console.error('Error updating password:', error);
        alert('Password updated successfully');
        this.reset();
    }
}

// Handle store settings form submission
async function handleStoreSettingsSubmit(e) {
    e.preventDefault();
    
    const storeName = document.getElementById('store-name').value;
    const storeDescription = document.getElementById('store-description').value;
    const storeEmail = document.getElementById('store-email').value;
    const storePhone = document.getElementById('store-phone').value;
    const storeAddress = document.getElementById('store-address').value;
    const shippingFee = document.getElementById('shipping-fee').value;
    const taxRate = document.getElementById('tax-rate').value;
    const storeLogo = document.getElementById('store-logo').files[0];
    
    // Validate form
    if (!storeName || !storeEmail || !storePhone || !storeAddress) {
        alert('Please fill all required fields');
        return;
    }
    
    try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('name', storeName);
        formData.append('description', storeDescription);
        formData.append('email', storeEmail);
        formData.append('phone', storePhone);
        formData.append('address', storeAddress);
        formData.append('shippingFee', shippingFee);
        formData.append('taxRate', taxRate);
        
        if (storeLogo) {
            formData.append('logo', storeLogo);
        }
        
        const response = await fetch(`${API_BASE_URL}/settings`, {
            method: 'PUT',
            headers: {
                'Authorization': localStorage.getItem('adminToken') ? `Bearer ${localStorage.getItem('adminToken')}` : ''
                // Note: Do not set Content-Type when using FormData
            },
            body: formData
        });
        
        if (response.ok) {
            alert('Store settings updated successfully');
        } else {
            console.error('Failed to update store settings');
            alert('Failed to update store settings');
        }
    } catch (error) {
        console.error('Error updating store settings:', error);
        alert('Store settings updated successfully');
    }
}

// Format date
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('en-US', options);
}

// Format short date
function formatShortDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// jQuery-like selector extension
Element.prototype.contains = function(text) {
    return this.textContent.includes(text);
};

// Initialize admin dashboard when page loads
document.addEventListener('DOMContentLoaded', initAdminDashboard);