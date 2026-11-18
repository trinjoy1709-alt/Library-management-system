/**
 * Core Data & Inventory Manager for Library Management System
 */
const LibraryManager = {
    STORAGE_KEY: 'lms_catalog_v1',

    defaultCatalog: [
        {
            id: 'BK-101',
            title: 'Introduction to Algorithms (CLRS)',
            author: 'Thomas H. Cormen',
            isbn: '978-0262046305',
            totalCopies: 5,
            issuedTo: [
                { borrowerName: 'Aarav Sharma', borrowerId: 'CSE-24-011', dueDate: '2026-11-28' }
            ]
        },
        {
            id: 'BK-102',
            title: 'Clean Code',
            author: 'Robert C. Martin',
            isbn: '978-0132350884',
            totalCopies: 3,
            issuedTo: []
        },
        {
            id: 'BK-103',
            title: 'Artificial Intelligence: A Modern Approach',
            author: 'Stuart Russell & Peter Norvig',
            isbn: '978-0134610993',
            totalCopies: 2,
            issuedTo: [
                { borrowerName: 'Priya Nair', borrowerId: 'AIML-24-029', dueDate: '2026-11-24' },
                { borrowerName: 'Rohan Das', borrowerId: 'AIML-24-015', dueDate: '2026-11-26' }
            ]
        }
    ],

    getBooks() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (!stored) {
            this.saveBooks(this.defaultCatalog);
            return JSON.parse(JSON.stringify(this.defaultCatalog));
        }
        return JSON.parse(stored);
    },

    saveBooks(books) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(books));
    },

    resetCatalog() {
        const fresh = JSON.parse(JSON.stringify(this.defaultCatalog));
        this.saveBooks(fresh);
        return fresh;
    },

    addBook(title, author, isbn, quantity) {
        const books = this.getBooks();
        const existing = books.find(b => b.isbn.trim() === isbn.trim());
        
        if (existing) {
            existing.totalCopies += Number(quantity);
        } else {
            books.unshift({
                id: 'BK-' + Date.now().toString().slice(-4),
                title: title.trim(),
                author: author.trim(),
                isbn: isbn.trim(),
                totalCopies: Number(quantity),
                issuedTo: []
            });
        }
        this.saveBooks(books);
        return books;
    },

    issueBook(bookId, borrowerName, borrowerId, dueDate) {
        const books = this.getBooks();
        const book = books.find(b => b.id === bookId);
        if (!book) throw new Error('Book not found.');

        const available = book.totalCopies - book.issuedTo.length;
        if (available <= 0) throw new Error('No copies available for issue.');

        book.issuedTo.push({
            borrowerName: borrowerName.trim(),
            borrowerId: borrowerId.trim(),
            dueDate
        });
        this.saveBooks(books);
        return books;
    },

    returnBook(bookId, borrowerIndex) {
        const books = this.getBooks();
        const book = books.find(b => b.id === bookId);
        if (book && book.issuedTo[borrowerIndex]) {
            book.issuedTo.splice(borrowerIndex, 1);
            this.saveBooks(books);
        }
        return books;
    },

    deleteBook(bookId) {
        const books = this.getBooks().filter(b => b.id !== bookId);
        this.saveBooks(books);
        return books;
    }
};