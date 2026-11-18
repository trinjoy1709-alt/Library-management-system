document.addEventListener('DOMContentLoaded', () => {
    const bookTableBody = document.getElementById('bookTableBody');
    const addBookForm = document.getElementById('addBookForm');
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const resetBtn = document.getElementById('resetBtn');

    // Modal elements
    const issueModal = document.getElementById('issueModal');
    const issueBookForm = document.getElementById('issueBookForm');
    const closeModalBtn = document.getElementById('closeModalBtn');

    let currentFilter = 'all';
    let searchQuery = '';

    function updateStats(books) {
        let total = 0;
        let issued = 0;
        books.forEach(b => {
            total += b.totalCopies;
            issued += b.issuedTo.length;
        });
        document.getElementById('totalBooksCount').textContent = total;
        document.getElementById('issuedBooksCount').textContent = issued;
        document.getElementById('availableBooksCount').textContent = total - issued;
    }

    function renderCatalog() {
        const books = LibraryManager.getBooks();
        updateStats(books);

        const filtered = books.filter(book => {
            const available = book.totalCopies - book.issuedTo.length;
            if (currentFilter === 'available' && available <= 0) return false;
            if (currentFilter === 'issued' && book.issuedTo.length === 0) return false;

            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const inMeta = book.title.toLowerCase().includes(q) ||
                               book.author.toLowerCase().includes(q) ||
                               book.isbn.toLowerCase().includes(q);
                const inBorrowers = book.issuedTo.some(
                    b => b.borrowerName.toLowerCase().includes(q) || b.borrowerId.toLowerCase().includes(q)
                );
                return inMeta || inBorrowers;
            }
            return true;
        });

        bookTableBody.innerHTML = '';

        if (filtered.length === 0) {
            bookTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#94a3b8; padding:24px;">No matching books found in catalog.</td></tr>`;
            return;
        }

        filtered.forEach(book => {
            const available = book.totalCopies - book.issuedTo.length;
            const tr = document.createElement('tr');

            const borrowersHtml = book.issuedTo.length === 0
                ? '<span style="color:#64748b; font-size:0.85rem;">None</span>'
                : book.issuedTo.map((b, idx) => `
                    <div class="borrower-item">
                        <span><strong>${b.borrowerName}</strong> (${b.borrowerId}) • Due: ${b.dueDate}</span>
                        <button class="btn btn-sm btn-return" onclick="handleReturn('${book.id}', ${idx})">Return</button>
                    </div>
                `).join('');

            tr.innerHTML = `
                <td>
                    <strong>${book.title}</strong><br>
                    <span style="color:#94a3b8; font-size:0.8rem;">ISBN: ${book.isbn}</span>
                </td>
                <td>${book.author}</td>
                <td>
                    <span class="badge ${available > 0 ? 'badge-available' : 'badge-empty'}">
                        ${available} / ${book.totalCopies} Available
                    </span>
                </td>
                <td>${borrowersHtml}</td>
                <td>
                    <button class="btn btn-sm btn-primary" ${available === 0 ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''} onclick="openIssueModal('${book.id}', '${book.title.replace(/'/g, "\\'")}')">
                        Issue
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="handleDelete('${book.id}')">Delete</button>
                </td>
            `;
            bookTableBody.appendChild(tr);
        });
    }

    // Add book handler
    addBookForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('bookTitle').value;
        const author = document.getElementById('bookAuthor').value;
        const isbn = document.getElementById('bookIsbn').value;
        const qty = document.getElementById('bookQty').value;

        LibraryManager.addBook(title, author, isbn, qty);
        addBookForm.reset();
        document.getElementById('bookQty').value = 1;
        renderCatalog();
    });

    // Search & filter listeners
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderCatalog();
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderCatalog();
        });
    });

    resetBtn.addEventListener('click', () => {
        LibraryManager.resetCatalog();
        renderCatalog();
    });

    // Modal handlers
    window.openIssueModal = (bookId, bookTitle) => {
        document.getElementById('issueBookId').value = bookId;
        document.getElementById('modalBookTitle').textContent = `Issue: ${bookTitle}`;
        const defaultDue = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
        document.getElementById('dueDate').value = defaultDue;
        issueModal.classList.remove('hidden');
    };

    closeModalBtn.addEventListener('click', () => {
        issueModal.classList.add('hidden');
        issueBookForm.reset();
    });

    issueBookForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const bookId = document.getElementById('issueBookId').value;
        const name = document.getElementById('borrowerName').value;
        const memberId = document.getElementById('borrowerId').value;
        const dueDate = document.getElementById('dueDate').value;

        try {
            LibraryManager.issueBook(bookId, name, memberId, dueDate);
            issueModal.classList.add('hidden');
            issueBookForm.reset();
            renderCatalog();
        } catch (err) {
            alert(err.message);
        }
    });

    window.handleReturn = (bookId, borrowerIdx) => {
        LibraryManager.returnBook(bookId, borrowerIdx);
        renderCatalog();
    };

    window.handleDelete = (bookId) => {
        if (confirm('Remove this book entry from the catalog?')) {
            LibraryManager.deleteBook(bookId);
            renderCatalog();
        }
    };

    renderCatalog();
});