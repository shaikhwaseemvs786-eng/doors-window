document.addEventListener('DOMContentLoaded', () => {
    // State
    let items = [];
    const gstRate = 18; // Default GST

    // DOM Elements
    const dateInput = document.getElementById('date');
    const addItemBtn = document.getElementById('addItemBtn');
    const invoiceTableBody = document.querySelector('#invoiceTable tbody');
    const emptyState = document.getElementById('emptyState');
    const subTotalDisplay = document.getElementById('subTotalDisplay');
    const gstInput = document.getElementById('gstInput');
    const grandTotalDisplay = document.getElementById('grandTotalDisplay');
    const printBtn = document.getElementById('printBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const themeToggleBtn = document.getElementById('theme-toggle');

    // Inputs
    const itemNameSelect = document.getElementById('itemName');
    const customItemNameInput = document.getElementById('customItemName');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const isSqFtCheckbox = document.getElementById('isSqFt');
    const quantityInput = document.getElementById('quantity');
    const rateInput = document.getElementById('rate');
    const rateLabel = document.getElementById('rateLabel');
    const itemTotalPreview = document.getElementById('itemTotalPreview');

    // Initialize Date
    dateInput.valueAsDate = new Date();

    // Event Listeners
    itemNameSelect.addEventListener('change', toggleCustomItem);
    addItemBtn.addEventListener('click', addItem);
    invoiceTableBody.addEventListener('click', handleTableActions);
    gstInput.addEventListener('input', calculateTotals);
    printBtn.addEventListener('click', printInvoice);
    clearAllBtn.addEventListener('click', clearAll);
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Theme Toggle Logic
    function toggleTheme() {
        document.body.classList.toggle('light-mode');
        const icon = themeToggleBtn.querySelector('i');
        if (document.body.classList.contains('light-mode')) {
            icon.classList.replace('fa-moon', 'fa-sun');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
        }
    }

    // Live Calculations for Preview
    [widthInput, heightInput, quantityInput, rateInput, isSqFtCheckbox].forEach(input => {
        input.addEventListener('input', updatePreview);
    });

    // Toggle Custom Item Input
    function toggleCustomItem() {
        if (itemNameSelect.value === 'Custom') {
            customItemNameInput.classList.remove('hidden');
            customItemNameInput.focus();
        } else {
            customItemNameInput.classList.add('hidden');
        }
    }

    // Update Label based on pricing mode
    isSqFtCheckbox.addEventListener('change', () => {
        rateLabel.textContent = isSqFtCheckbox.checked ? 'per sq.ft' : 'per unit';
        updatePreview();
    });

    // Calculate Item Total for Preview
    function calculateItemPrice(width, height, qty, rate, isArea) {
        let total = 0;
        let area = 0;

        if (isArea) {
            area = width * height;
            total = area * rate * qty;
        } else {
            total = rate * qty;
        }
        return { total, area };
    }

    function updatePreview() {
        const width = parseFloat(widthInput.value) || 0;
        const height = parseFloat(heightInput.value) || 0;
        const qty = parseFloat(quantityInput.value) || 1;
        const rate = parseFloat(rateInput.value) || 0;
        const isArea = isSqFtCheckbox.checked;

        const { total } = calculateItemPrice(width, height, qty, rate, isArea);
        itemTotalPreview.textContent = `₹${total.toFixed(2)}`;
    }

    // Add Item to List
    function addItem() {
        const itemType = itemNameSelect.value;
        const description = itemType === 'Custom' ? customItemNameInput.value : itemType;

        if (!description) {
            alert('Please enter an item description');
            return;
        }

        const width = parseFloat(widthInput.value) || 0;
        const height = parseFloat(heightInput.value) || 0;
        const qty = parseFloat(quantityInput.value) || 1;
        const rate = parseFloat(rateInput.value) || 0;
        const isArea = isSqFtCheckbox.checked;

        if (rate <= 0) {
            alert('Please enter a valid rate');
            return;
        }

        if (isArea && (width <= 0 || height <= 0)) {
            alert('Dimensions are required for area-based pricing');
            return;
        }

        const { total, area } = calculateItemPrice(width, height, qty, rate, isArea);

        const newItem = {
            id: Date.now(),
            description,
            width,
            height,
            isArea,
            qty,
            area,
            rate,
            total
        };

        items.push(newItem);
        renderTable();
        calculateTotals();
        resetInputs();
    }

    // Render Table
    function renderTable() {
        invoiceTableBody.innerHTML = '';

        if (items.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
        }

        items.forEach((item, index) => {
            const tr = document.createElement('tr');

            const dimText = item.isArea ? `${item.width} x ${item.height}` : '-';
            const qtyText = item.isArea ? `${item.area.toFixed(2)} sq.ft` : `${item.qty} Nos`;

            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.description}</td>
                <td>${dimText}</td>
                <td>${qtyText}</td>
                <td>₹${item.rate.toFixed(2)}</td>
                <td>₹${item.total.toFixed(2)}</td>
                <td>
                    <button class="delete-btn" data-id="${item.id}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
            invoiceTableBody.appendChild(tr);
        });
    }

    // Handle Delete
    function handleTableActions(e) {
        if (e.target.closest('.delete-btn')) {
            const id = Number(e.target.closest('.delete-btn').dataset.id);
            items = items.filter(item => item.id !== id);
            renderTable();
            calculateTotals();
        }
    }

    // Calculate Totals
    function calculateTotals() {
        const subTotal = items.reduce((sum, item) => sum + item.total, 0);
        const gstPercent = parseFloat(gstInput.value) || 0;
        const gstAmount = (subTotal * gstPercent) / 100;
        const grandTotal = subTotal + gstAmount;

        subTotalDisplay.textContent = `₹${subTotal.toFixed(2)}`;
        grandTotalDisplay.textContent = `₹${grandTotal.toFixed(2)}`;
    }

    // Reset Inputs
    function resetInputs() {
        widthInput.value = '';
        heightInput.value = '';
        quantityInput.value = '1';
        rateInput.value = '';
        customItemNameInput.value = '';
        if (itemNameSelect.value === 'Custom') customItemNameInput.classList.add('hidden');
        itemNameSelect.value = itemNameSelect.options[0].value;
        itemTotalPreview.textContent = '₹0.00';
    }

    // Clear All
    function clearAll() {
        if (confirm('Are you sure you want to clear all items?')) {
            items = [];
            renderTable();
            calculateTotals();
        }
    }

    // Print Logic
    function printInvoice() {
        if (items.length === 0) {
            alert('Add items to bill before printing');
            return;
        }

        // Fill Print Template
        document.getElementById('printCustomerName').textContent = document.getElementById('customerName').value || 'Cash Customer';
        document.getElementById('printCustomerPhone').textContent = document.getElementById('customerPhone').value || '-';
        document.getElementById('printBillNo').textContent = document.getElementById('billNo').value;

        const dateObj = new Date(dateInput.value);
        document.getElementById('printDate').textContent = dateObj.toLocaleDateString('en-IN');

        const printTableBody = document.getElementById('printTableBody');
        printTableBody.innerHTML = '';

        items.forEach((item, index) => {
            const tr = document.createElement('tr');
            const dimText = item.isArea ? `${item.width} x ${item.height}` : '-';
            const qtyText = item.isArea ? `${item.area.toFixed(2)} sq.ft` : `${item.qty} Nos`;

            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.description}</td>
                <td>${dimText}</td>
                <td>${qtyText}</td>
                <td>₹${item.rate.toFixed(2)}</td>
                <td>₹${item.total.toFixed(2)}</td>
            `;
            printTableBody.appendChild(tr);
        });

        document.getElementById('printSubTotal').textContent = subTotalDisplay.textContent;
        const gstPercent = parseFloat(gstInput.value) || 0;
        const subTotal = items.reduce((sum, item) => sum + item.total, 0);
        document.getElementById('printGST').textContent = `₹${((subTotal * gstPercent) / 100).toFixed(2)} (${gstPercent}%)`;
        document.getElementById('printGrandTotal').textContent = grandTotalDisplay.textContent;

        window.print();
    }
});
