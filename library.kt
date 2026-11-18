package com.library.management

data class BorrowerRecord(
    val borrowerName: String,
    val borrowerId: String,
    val dueDate: String
)

data class Book(
    val id: String,
    val title: String,
    val author: String,
    val isbn: String,
    var totalCopies: Int,
    val issuedTo: MutableList<BorrowerRecord> = mutableListOf()
) {
    val availableCopies: Int
        get() = totalCopies - issuedTo.size
}

object LibraryRepository {
    private val catalog = mutableListOf(
        Book("BK-101", "Introduction to Algorithms", "Thomas H. Cormen", "978-0262046305", 5),
        Book("BK-102", "Clean Code", "Robert C. Martin", "978-0132350884", 3)
    )

    fun getAllBooks(): List<Book> = catalog.toList()

    fun addBook(book: Book) {
        val existing = catalog.find { it.isbn == book.isbn }
        if (existing != null) {
            existing.totalCopies += book.totalCopies
        } else {
            catalog.add(0, book)
        }
    }

    fun issueBook(bookId: String, record: BorrowerRecord): Boolean {
        val book = catalog.find { it.id == bookId } ?: return false
        if (book.availableCopies <= 0) return false
        book.issuedTo.add(record)
        return true
    }

    fun returnBook(bookId: String, borrowerId: String): Boolean {
        val book = catalog.find { it.id == bookId } ?: return false
        return book.issuedTo.removeIf { it.borrowerId == borrowerId }
    }
}