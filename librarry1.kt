package com.library.management.service

import com.library.management.Book
import com.library.management.LibraryRepository

class LibrarySearchService {

    fun search(query: String): List<Book> {
        if (query.isBlank()) return LibraryRepository.getAllBooks()
        val q = query.lowercase()
        return LibraryRepository.getAllBooks().filter { book ->
            book.title.lowercase().contains(q) ||
            book.author.lowercase().contains(q) ||
            book.isbn.lowercase().contains(q) ||
            book.issuedTo.any { it.borrowerName.lowercase().contains(q) || it.borrowerId.lowercase().contains(q) }
        }
    }

    fun getInventorySummary(): Triple<Int, Int, Int> {
        val books = LibraryRepository.getAllBooks()
        val total = books.sumOf { it.totalCopies }
        val issued = books.sumOf { it.issuedTo.size }
        val available = total - issued
        return Triple(total, available, issued)
    }
}