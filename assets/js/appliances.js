// API Base URL
const API_URL = 'http://localhost:3000/api';

// DOM Elements
const applianceTableBody = document.getElementById('appliances-table-body');
const addApplianceBtn = document.getElementById('add-appliance-btn');
const applianceModal = document.getElementById('appliance-modal');
const applianceForm = document.getElementById('appliance-form');
const modalTitle = document.getElementById('modal-title');
const cancelApplianceBtn = document.getElementById('cancel-appliance');
const deleteModal = document.getElementById('delete-confirmation');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const searchBox = document.querySelector('.search-box');
const errorDialog = document.getElementById('error-dialog');
const errorMessage = document.getElementById('error-message');
const errorOkBtn = document.getElementById('error-ok');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');

let currentApplianceId = null;
let currentPage = 1;
let totalPages = 1;
const itemsPerPage = 10;

// Load appliances on page load
document.addEventListener('DOMContentLoaded', () => loadAppliances(1));

// Event Listeners
addApplianceBtn.addEventListener('click', () => openModal('add'));
cancelApplianceBtn.addEventListener('click', closeModal);
applianceForm.addEventListener('submit', handleApplianceSubmit);
cancelDeleteBtn.addEventListener('click', () => deleteModal.classList.remove('active'));
confirmDeleteBtn.addEventListener('click', handleDeleteConfirm);
searchBox.addEventListener('input', debounce(handleSearch, 300));
errorOkBtn.addEventListener('click', () => errorDialog.classList.remove('active'));
prevPageBtn.addEventListener('click', () => loadAppliances(currentPage - 1));
nextPageBtn.addEventListener('click', () => loadAppliances(currentPage + 1));

// Load all appliances with pagination
async function loadAppliances(page = 1) {
    try {
        const response = await fetch(`${API_URL}/appliances?page=${page}&limit=${itemsPerPage}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error('Failed to load appliances');
        }

        displayAppliances(data.appliances);
        updatePagination(data.pagination);
    } catch (error) {
        console.error('Error loading appliances:', error);
        showError('Failed to load appliances');
    }
}

// Update pagination controls
function updatePagination(pagination) {
    currentPage = pagination.page;
    totalPages = pagination.totalPages;
    
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
}

// Display appliances in table
function displayAppliances(appliances) {
    applianceTableBody.innerHTML = '';
    
    appliances.forEach(appliance => {
        const row = document.createElement('tr');
        // Convert price to number and format it
        const price = parseFloat(appliance.price);
        row.innerHTML = `
            <td>${appliance.name}</td>
            <td>₱${price.toFixed(2)}</td>
            <td>${appliance.stock_quantity}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="openModal('edit', ${appliance.id})">
                        ✏️
                    </button>
                    <button class="btn-icon" onclick="openDeleteModal(${appliance.id})">
                        🗑️
                    </button>
                </div>
            </td>
        `;
        applianceTableBody.appendChild(row);
    });
}

// Show error dialog
function showError(message) {
    errorMessage.textContent = message;
    errorDialog.classList.add('active');
}

// Open modal for add/edit
function openModal(mode, applianceId = null) {
    currentApplianceId = applianceId;
    modalTitle.textContent = mode === 'add' ? 'Add New Appliance' : 'Edit Appliance';
    applianceModal.classList.add('active');
    
    if (mode === 'edit') {
        fetchAndPopulateAppliance(applianceId);
    } else {
        applianceForm.reset();
    }
}

// Close modal
function closeModal() {
    applianceModal.classList.remove('active');
    applianceForm.reset();
    currentApplianceId = null;
}

// Fetch and populate appliance data for editing
async function fetchAndPopulateAppliance(applianceId) {
    try {
        const response = await fetch(`${API_URL}/appliances/${applianceId}`);
        const appliance = await response.json();
        
        document.getElementById('name').value = appliance.name;
        document.getElementById('price').value = appliance.price;
        document.getElementById('stock').value = appliance.stock_quantity;
    } catch (error) {
        console.error('Error fetching appliance:', error);
        showError('Failed to load appliance data');
    }
}

// Handle form submit for both add and edit
async function handleApplianceSubmit(e) {
    e.preventDefault();
    
    const applianceData = {
        name: document.getElementById('name').value,
        price: parseFloat(document.getElementById('price').value),
        stock_quantity: parseInt(document.getElementById('stock').value)
    };
    
    try {
        const url = currentApplianceId 
            ? `${API_URL}/appliances/${currentApplianceId}`
            : `${API_URL}/appliances`;
            
        const method = currentApplianceId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(applianceData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to save appliance');
        }
        
        closeModal();
        loadAppliances();
    } catch (error) {
        console.error('Error saving appliance:', error);
        showError(error.message);
    }
}

// Open delete confirmation modal
function openDeleteModal(applianceId) {
    currentApplianceId = applianceId;
    deleteModal.classList.add('active');
}

// Handle delete confirmation
async function handleDeleteConfirm() {
    try {
        const response = await fetch(`${API_URL}/appliances/${currentApplianceId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }
        
        deleteModal.classList.remove('active');
        loadAppliances();
    } catch (error) {
        console.error('Error deleting appliance:', error);
        deleteModal.classList.remove('active');
        showError(error.message);
    }
}

// Handle search
async function handleSearch(e) {
    const searchTerm = e.target.value;
    
    try {
        if (searchTerm) {
            const response = await fetch(`${API_URL}/appliances/search?query=${searchTerm}`);
            if (!response.ok) {
                throw new Error('Search failed');
            }
            const appliances = await response.json();
            displayAppliances(appliances);
        } else {
            loadAppliances();
        }
    } catch (error) {
        console.error('Error searching appliances:', error);
        showError('Error searching appliances. Please try again.');
    }
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
} 