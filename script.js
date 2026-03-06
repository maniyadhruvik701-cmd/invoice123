// ============================
// DATA STORE
// ============================
let supplierInfo = {};
let buyerInfo = {};
let items = [];
let invoiceInfo = {};
let transportInfo = {};
let discountPct = 0;
let igstPct = 0;
let editingItemIndex = -1;

function saveDraft() {
    const draft = {
        items,
        buyerInfo,
        supplierInfo,
        invoiceInfo,
        transportInfo,
        discountPct,
        igstPct,
        lastSection: document.getElementById('section-history').classList.contains('active') ? 'history' : 'entry'
    };
    localStorage.setItem('currentDraft', JSON.stringify(draft));
}

function loadDraft() {
    const saved = localStorage.getItem('currentDraft');
    if (saved) {
        const draft = JSON.parse(saved);
        items = draft.items || [];
        buyerInfo = draft.buyerInfo || {};
        supplierInfo = draft.supplierInfo || supplierInfo;
        invoiceInfo = draft.invoiceInfo || {};
        transportInfo = draft.transportInfo || {};
        discountPct = draft.discountPct || 0;
        igstPct = draft.igstPct || 0;

        renderItems();
        renderBuyer();
        renderSupplier();
        renderInvoiceInfo();

        if (draft.lastSection === 'history') {
            switchSection('history');
        }
    }
}

// ============================
// SECTION SWITCH
// ============================
function switchSection(section) {
    const entryPanel = document.getElementById('section-entry');
    const historyPanel = document.getElementById('section-history');
    const btnEntry = document.getElementById('switch-entry');
    const btnHistory = document.getElementById('switch-history');
    const slider = document.getElementById('switch-slider');

    if (section === 'entry') {
        entryPanel.classList.add('active');
        historyPanel.classList.remove('active');
        btnEntry.classList.add('active');
        btnHistory.classList.remove('active');
        slider.classList.remove('right');
    } else {
        historyPanel.classList.add('active');
        entryPanel.classList.remove('active');
        btnHistory.classList.add('active');
        btnEntry.classList.remove('active');
        slider.classList.add('right');
        renderHistory();
    }

    // Save section state to draft
    saveDraft();

    // Re-trigger animation
    const activePanel = section === 'entry' ? entryPanel : historyPanel;
    activePanel.style.animation = 'none';
    activePanel.offsetHeight; // trigger reflow
    activePanel.style.animation = '';
}

// ============================
// GENERIC DIALOG OPEN / CLOSE
// ============================
function openDialog(id) {
    const modal = document.getElementById(id);
    modal.style.display = 'flex';

    if (id === 'supplier-dialog') prefillSupplier();
    if (id === 'buyer-dialog') prefillBuyer();
    if (id === 'meta-dialog') prefillMeta();
}

function openAddItemDialog() {
    resetItemForm();
    openDialog('item-dialog');
}

function closeDialog(id) {
    document.getElementById(id).style.display = 'none';
}

// Close on overlay click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.style.display = 'none';
    }
});

// ============================
// SUPPLIER INFO
// ============================
function loadDefaultSupplier() {
    const saved = localStorage.getItem('supplierProfile');
    if (saved) {
        supplierInfo = JSON.parse(saved);
    } else {
        supplierInfo = {
            name: "Vyani Enterprise",
            address: "467, Pandol",
            city: "Surat",
            pincode: "395004",
            state: "Gujarat",
            phone: "7777900729"
        };
    }
}

function prefillSupplier() {
    document.getElementById('f-supplier-name').value = supplierInfo.name || '';
    document.getElementById('f-supplier-address').value = supplierInfo.address || '';
    document.getElementById('f-supplier-city').value = supplierInfo.city || '';
    document.getElementById('f-supplier-pincode').value = supplierInfo.pincode || '';
    document.getElementById('f-supplier-state').value = supplierInfo.state || '';
    document.getElementById('f-supplier-phone').value = supplierInfo.phone || '';
}

function saveSupplierInfo() {
    supplierInfo = {
        name: document.getElementById('f-supplier-name').value.trim(),
        address: document.getElementById('f-supplier-address').value.trim(),
        city: document.getElementById('f-supplier-city').value.trim(),
        pincode: document.getElementById('f-supplier-pincode').value.trim(),
        state: document.getElementById('f-supplier-state').value.trim(),
        phone: document.getElementById('f-supplier-phone').value.trim()
    };
    // Save as default profile for future invoices
    localStorage.setItem('supplierProfile', JSON.stringify(supplierInfo));
    renderSupplier();
    saveDraft();
    closeDialog('supplier-dialog');
}

function renderSupplier() {
    const el = document.getElementById('d-supplier');
    if (!el) return;
    if (!supplierInfo.name) {
        el.innerHTML = '<p class="empty-hint">Click "🏢 Supplier Info" to enter supplier details</p>';
        return;
    }
    el.innerHTML = `
        <p><strong>${supplierInfo.name}</strong></p>
        ${supplierInfo.address ? '<p>Address: ' + supplierInfo.address + '</p>' : ''}
        <p>${supplierInfo.city ? 'City: ' + supplierInfo.city + ', ' : ''}${supplierInfo.pincode ? 'Pincode: ' + supplierInfo.pincode : ''}</p>
        ${supplierInfo.state ? '<p>State: ' + supplierInfo.state + '</p>' : ''}
        ${supplierInfo.phone ? '<p>Ph: ' + supplierInfo.phone + '</p>' : ''}
    `;
}

// ============================
// BUYER INFO
// ============================
function prefillBuyer() {
    document.getElementById('f-buyer-name').value = buyerInfo.name || '';
    document.getElementById('f-buyer-address').value = buyerInfo.address || '';

    document.getElementById('f-buyer-city').value = buyerInfo.city || '';
    document.getElementById('f-buyer-pincode').value = buyerInfo.pincode || '';
    document.getElementById('f-buyer-state').value = buyerInfo.state || '';
    document.getElementById('f-buyer-phone').value = buyerInfo.phone || '';
}

function saveBuyerInfo() {
    buyerInfo = {
        name: document.getElementById('f-buyer-name').value.trim(),
        address: document.getElementById('f-buyer-address').value.trim(),

        city: document.getElementById('f-buyer-city').value.trim(),
        pincode: document.getElementById('f-buyer-pincode').value.trim(),
        state: document.getElementById('f-buyer-state').value.trim(),
        phone: document.getElementById('f-buyer-phone').value.trim()
    };
    renderBuyer();
    saveDraft();
    closeDialog('buyer-dialog');
}

function renderBuyer() {
    const el = document.getElementById('d-buyer');
    if (!el) return;
    if (!buyerInfo.name) {
        el.innerHTML = '<p class="empty-hint">Click "👤 Buyer Info" to enter buyer details</p>';
        return;
    }
    el.innerHTML = `
        <p><strong>${buyerInfo.name}</strong></p>
        ${buyerInfo.address ? '<p>Address: ' + buyerInfo.address + '</p>' : ''}

        ${buyerInfo.city ? '<p>City: ' + buyerInfo.city + '</p>' : ''}
        ${buyerInfo.pincode ? '<p>Pincode: ' + buyerInfo.pincode + '</p>' : ''}
        ${buyerInfo.state ? '<p>State: ' + buyerInfo.state + '</p>' : ''}
        ${buyerInfo.phone ? '<p>Ph: ' + buyerInfo.phone + '</p>' : ''}
    `;
}

function prefillMeta() {
    document.getElementById('f-inv-no').value = invoiceInfo.invNo || '';
    document.getElementById('f-inv-date').value = invoiceInfo.invDate || '';
    document.getElementById('f-inv-lr').value = invoiceInfo.lr || transportInfo.lr || '';
    document.getElementById('f-inv-agent').value = invoiceInfo.agent || '';
    document.getElementById('f-inv-disc').value = discountPct || 0;
    document.getElementById('f-inv-igst').value = igstPct || 0;
}

function saveInvoiceMeta() {
    invoiceInfo = {
        invNo: document.getElementById('f-inv-no').value.trim(),
        invDate: document.getElementById('f-inv-date').value,
        lr: document.getElementById('f-inv-lr').value.trim(),
        agent: document.getElementById('f-inv-agent').value.trim()
    };
    transportInfo = {
        lr: document.getElementById('f-inv-lr').value.trim()
    };
    discountPct = parseFloat(document.getElementById('f-inv-disc').value) || 0;
    igstPct = parseFloat(document.getElementById('f-inv-igst').value) || 0;

    renderInvoiceInfo();
    renderTransport();
    recalcTotals();
    saveDraft();
    closeDialog('meta-dialog');
}

function renderInvoiceInfo() {
    const el = document.getElementById('d-invoice-info');
    if (!el) return;
    if (!invoiceInfo.invNo && !invoiceInfo.invDate) {
        el.innerHTML = '<p class="empty-hint">Click "📄 Invoice Details" to enter meta info</p>';
        return;
    }
    el.innerHTML = `
        <div class="meta-row"><span>Inv No:</span> <strong>${invoiceInfo.invNo || '-'}</strong></div>
        <div class="meta-row"><span>Date:</span> <strong>${invoiceInfo.invDate || '-'}</strong></div>
        ${invoiceInfo.agent ? `<div class="meta-row"><span>Agent:</span> <strong>${invoiceInfo.agent}</strong></div>` : ''}
    `;
}

function renderTransport() {
    const el = document.getElementById('d-transport');
    if (!el) return;
    if (!transportInfo.lr) {
        el.innerHTML = '<p class="empty-hint">Click "📄 Invoice Details" to enter transport info</p>';
        return;
    }
    el.innerHTML = `
        <div class="meta-row"><span>LR No:</span> <strong>${transportInfo.lr || '-'}</strong></div>
    `;
}

// ============================
// 2. ITEM ENTRY
// ============================
function resetItemForm() {
    editingItemIndex = -1;
    document.getElementById('item-dialog-title').innerText = '＋ Add Item Entry';
    document.getElementById('btn-save-item').innerText = 'Add Item';

    document.getElementById('f-item-desc').value = '';
    document.getElementById('f-item-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('f-item-challan').value = '';
    document.getElementById('f-item-amount').value = '';
    setTimeout(() => document.getElementById('f-item-desc').focus(), 200);
}

function saveItemEntry() {
    const desc = document.getElementById('f-item-desc').value.trim();
    if (!desc) { alert('Please enter description.'); return; }

    const itemData = {
        desc: desc,
        challanDate: document.getElementById('f-item-date').value,
        challanNo: document.getElementById('f-item-challan').value.trim(),
        amount: parseFloat(document.getElementById('f-item-amount').value) || 0
    };

    if (editingItemIndex > -1) {
        items[editingItemIndex] = itemData;
        editingItemIndex = -1;
    } else {
        items.push(itemData);
    }

    renderItems();
    saveDraft();
    closeDialog('item-dialog');
}

function editItem(index) {
    const item = items[index];
    if (!item) return;

    editingItemIndex = index;

    // Set UI to Edit Mode
    document.getElementById('item-dialog-title').innerText = '✏️ Edit Item Entry';
    document.getElementById('btn-save-item').innerText = 'Update Item';

    // Populate fields
    document.getElementById('f-item-desc').value = item.desc;
    document.getElementById('f-item-date').value = item.challanDate;
    document.getElementById('f-item-challan').value = item.challanNo;
    document.getElementById('f-item-amount').value = item.amount;

    // Show dialog
    const modal = document.getElementById('item-dialog');
    modal.style.display = 'flex';
}

function deleteItem(index) {
    items.splice(index, 1);
    renderItems();
    saveDraft();
}

function renderItems() {
    const tbody = document.getElementById('items-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (items.length === 0) {
        tbody.innerHTML = '<tr id="empty-row"><td colspan="6" class="empty-hint" style="padding:2rem">No items added. Click "＋ Add Item" to start.</td></tr>';
        recalcTotals();
        return;
    }

    items.forEach((item, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td>${item.desc}</td>
            <td>${formatDate(item.challanDate)}</td>
            <td>${item.challanNo}</td>
            <td style="text-align:right">₹ ${item.amount.toLocaleString('en-IN')}</td>
            <td style="text-align:center">
                <button class="edit-btn" onclick="editItem(${i})" title="Edit">✏️</button>
                <button class="delete-btn" onclick="deleteItem(${i})" title="Delete">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    recalcTotals();
}

function recalcTotals() {
    let grandTotal = 0;
    items.forEach(item => grandTotal += item.amount);

    const grandTotalEl = document.getElementById('d-grand-total');
    if (grandTotalEl) grandTotalEl.innerText = '₹ ' + grandTotal.toLocaleString('en-IN');

    const wordsEl = document.getElementById('d-amount-words');
    if (wordsEl) {
        if (grandTotal > 0) {
            wordsEl.innerHTML = `<strong>Amount Chargeable (in words):</strong><br>Indian Rupees ${numberToWords(grandTotal)} Only`;
        } else {
            wordsEl.innerHTML = '';
        }
    }
}

// ============================
// NUMBER TO WORDS (Indian system)
// ============================
function numberToWords(num) {
    if (num === 0) return 'Zero';
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function twoDigits(n) {
        if (n < 20) return ones[n];
        return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    }

    function threeDigits(n) {
        if (n >= 100) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + twoDigits(n % 100) : '');
        return twoDigits(n);
    }

    let result = '';
    if (num >= 10000000) { result += threeDigits(Math.floor(num / 10000000)) + ' Crore '; num %= 10000000; }
    if (num >= 100000) { result += twoDigits(Math.floor(num / 100000)) + ' Lakh '; num %= 100000; }
    if (num >= 1000) { result += twoDigits(Math.floor(num / 1000)) + ' Thousand '; num %= 1000; }
    if (num > 0) result += threeDigits(num);

    return result.trim();
}

/**
 * Formats yyyy-mm-dd to dd-mm-yyyy
 */
function formatDate(dateStr) {
    if (!dateStr || dateStr === '-') return '-';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
}

// ============================
// SAVE INVOICE
// ============================
function saveInvoice() {
    if (!buyerInfo.name) { alert('Please set Buyer details first.'); return; }
    if (items.length === 0) { alert('Please add at least one item.'); return; }

    const invoice = {
        invoiceInfo: { ...invoiceInfo },
        supplierInfo: { ...supplierInfo },
        buyerInfo: { ...buyerInfo },
        transportInfo: { ...transportInfo },
        items: [...items],
        discountPct, igstPct,
        savedAt: new Date().toISOString()
    };

    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    invoices.push(invoice);
    localStorage.setItem('invoices', JSON.stringify(invoices));
    alert('✅ Invoice saved successfully!');

    // Reset form after save
    resetAll(true);
    localStorage.removeItem('currentDraft'); // Clear draft after save
    // Switch to history section to show saved invoice
    switchSection('history');
}

// ============================
// RESET ALL
// ============================
function resetAll(skipConfirm) {
    if (!skipConfirm && !confirm('Are you sure you want to reset everything?')) return;
    invoiceInfo = {};
    buyerInfo = {};
    transportInfo = {};
    items = [];
    discountPct = 0;
    igstPct = 0;

    loadDefaultSupplier(); // reload default supplier
    renderSupplier();
    renderInvoiceInfo();
    renderBuyer();
    renderTransport();
    renderItems();
    localStorage.removeItem('currentDraft'); // Clear draft on full reset
}

// ============================
// HISTORY
// ============================
function renderHistory() {
    const container = document.getElementById('history-list');
    if (!container) return;

    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');

    // Update badge count
    updateHistoryBadge(invoices.length);

    if (invoices.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:3rem 1rem;">
                <div style="font-size:3rem; margin-bottom:1rem; opacity:0.5;">📋</div>
                <p class="empty-hint" style="font-size:1rem;">No saved invoices yet.</p>
                <p class="empty-hint" style="margin-top:0.5rem;">Switch to "Data Entry" to create your first invoice.</p>
            </div>`;
        return;
    }

    container.innerHTML = '';

    // Show newest first
    invoices.slice().reverse().forEach((inv, revIdx) => {
        const realIdx = invoices.length - 1 - revIdx;
        const buyer = inv.buyerInfo || {};
        const info = inv.invoiceInfo || {};
        const total = calcGrandTotal(inv);
        let date = info.invDate || (inv.savedAt ? inv.savedAt.split('T')[0] : '-');
        date = formatDate(date);

        const card = document.createElement('div');
        card.className = 'history-card';
        card.innerHTML = `
            <div class="history-card-info">
                <span class="hc-buyer">👤 ${buyer.name || 'Unknown Buyer'}</span>
                <span class="hc-meta">
                    Invoice: ${info.invNo || '-'} &nbsp;|&nbsp; Date: ${date} &nbsp;|&nbsp;
                    Phone: ${buyer.phone || '-'} &nbsp;|&nbsp;
                    Grand Total: ₹ ${total.toLocaleString('en-IN')}
                </span>
            </div>
            <div class="history-card-actions">
                <button class="icon-btn" onclick="viewInvoice(${realIdx})" title="View">👁️ View</button>
                <button class="icon-btn" onclick="printInvoice(${realIdx})" title="Print">🖨️ Print</button>
                <button class="icon-btn icon-btn-danger" onclick="deleteInvoice(${realIdx})" title="Delete">🗑️</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function updateHistoryBadge(count) {
    const btnHistory = document.getElementById('switch-history');
    if (!btnHistory) return;
    let badge = btnHistory.querySelector('.history-count-badge');
    if (count > 0) {
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'history-count-badge';
            btnHistory.appendChild(badge);
        }
        badge.textContent = count;
    } else if (badge) {
        badge.remove();
    }
}

function calcGrandTotal(inv) {
    let itemTotal = 0;
    (inv.items || []).forEach(item => itemTotal += (item.amount || 0));
    const disc = inv.discountPct || 0;
    const igst = inv.igstPct || 0;
    const discVal = Math.round(itemTotal * disc / 100);
    const subTotal = itemTotal - discVal;
    return subTotal + Math.round(subTotal * igst / 100);
}

function deleteInvoice(index) {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    invoices.splice(index, 1);
    localStorage.setItem('invoices', JSON.stringify(invoices));

    renderHistory();
}

function viewInvoice(index) {
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    const inv = invoices[index];
    if (!inv) return;

    // Load into current form
    invoiceInfo = inv.invoiceInfo || {};
    supplierInfo = inv.supplierInfo || JSON.parse(localStorage.getItem('supplierProfile')) || { name: "Vyani Enterprise" };
    buyerInfo = inv.buyerInfo || {};
    transportInfo = inv.transportInfo || {};
    items = inv.items || [];
    discountPct = inv.discountPct || 0;
    igstPct = inv.igstPct || 0;

    renderInvoiceInfo();
    renderBuyer();
    renderTransport();
    renderItems();
    saveDraft();

    // Switch to Data Entry section
    switchSection('entry');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================
// PRINT INVOICE
// ============================
function printInvoice(index) {
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    const inv = invoices[index];
    if (!inv) return;

    const buyer = inv.buyerInfo || {};
    const info = inv.invoiceInfo || {};
    const supplier = inv.supplierInfo || JSON.parse(localStorage.getItem('supplierProfile')) || { name: "Vyani Enterprise", address: "467, Pandol", city: "Surat", pincode: "395004", state: "Gujarat", phone: "7777900729" };
    const itms = inv.items || [];

    let grandTotal = 0;
    itms.forEach(item => grandTotal += (item.amount || 0));

    // Build items rows
    let itemRows = '';
    itms.forEach((item, i) => {
        itemRows += `<tr>
            <td>${i + 1}</td>
            <td>${item.desc}</td>
            <td>${formatDate(item.challanDate)}</td>
            <td>${item.challanNo}</td>
            <td style="text-align:right">₹ ${item.amount.toLocaleString('en-IN')}</td>
        </tr>`;
    });

    const html = `
    <div class="print-invoice">

        <!-- Supplier + Buyer Grid -->
        <div class="pi-grid">
            <div class="pi-cell">
                <strong>Supplier Detail:</strong><br>
                <strong>${supplier.name || '-'}</strong><br>
                Address: ${supplier.address || '-'}<br>
                City: ${supplier.city || '-'}, Pincode: ${supplier.pincode || '-'}<br>
                State: ${supplier.state || '-'}<br>
                Ph: ${supplier.phone || '-'}
            </div>
            <div class="pi-cell">
                <strong>Buyer Detail:</strong><br>
                <strong>${buyer.name || '-'}</strong><br>
                Address: ${buyer.address || '-'}<br>
                City: ${buyer.city || '-'}<br>
                Pincode: ${buyer.pincode || '-'}<br>
                State: ${buyer.state || '-'}<br>
                Phone No: ${buyer.phone || '-'}
            </div>
        </div>

        <!-- Items Table -->
        <table>
            <thead>
                <tr>
                    <th>Sr</th>
                    <th>Description</th>
                    <th>Challan Date</th>
                    <th>Challan No.</th>
                    <th style="text-align:right">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${itemRows}
            </tbody>
        </table>

        <!-- Totals -->
        <div class="pi-totals">
            <div class="pi-totals-inner">
                <div class="pi-grand"><span>Grand Total</span><span>₹ ${grandTotal.toLocaleString('en-IN')}</span></div>
            </div>
        </div>

        <div class="pi-words">
            <strong>Amount Chargeable (in words):</strong><br>
            Indian Rupees ${numberToWords(grandTotal)} Only
        </div>

        <div style="text-align:right; margin-top:10px; font-size:11px;">E & O.E</div>
        
        <div style="display:flex; justify-content:space-between; margin-top:60px; font-size:12px;">
            <div style="text-align:center; width:200px;">
                <div style="margin-bottom:40px; visibility:hidden;">.</div>
                <div style="border-top:1px solid #000; padding-top:5px;">Receiver's Signature</div>
            </div>
            <div style="text-align:center; width:250px;">
                <div style="font-weight:bold; margin-bottom:40px;">For, ${supplier.name || '-'}</div>
                <div style="border-top:1px solid #000; padding-top:5px;">Authorized Signatory</div>
            </div>
        </div>
    </div>`;

    document.getElementById('print-area').innerHTML = html;
    openDialog('print-dialog');
}

function doPrint() {
    window.print();
}

// ============================
// INIT: Load history on page load
// ============================
document.addEventListener('DOMContentLoaded', () => {
    // Update history badge count on load
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    updateHistoryBadge(invoices.length);
});

// Check logged in state on main app load
document.addEventListener('DOMContentLoaded', () => {
    const isAuthPage = window.location.pathname.includes('signin') || window.location.pathname.includes('signup');

    if (!localStorage.getItem('isAuthenticated') && !isAuthPage) {
        window.location.href = 'signin.html';
        return;
    }

    if (!isAuthPage) {
        loadDefaultSupplier();
        renderSupplier();
        loadDraft(); // Load any unsaved draft
    }
});

const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Signup is handled manually by admin now.');
        window.location.href = 'signin.html';
    });
}

const signinForm = document.getElementById('signin-form');
if (signinForm) {
    signinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;

        // AUTH LOGIC
        if (email === 'maniyadhruvik07@gmail.com' && password === 'maniya@#07') {
            alert('Welcome, Dhruvik!');
            localStorage.setItem('isAuthenticated', 'true');
            window.location.href = 'index.html';
        } else {
            alert('❌ Invalid email or password.');
        }
    });
}
