package com.library.management.ui

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.library.management.BorrowerRecord
import com.library.management.LibraryRepository
import com.library.management.R
import com.library.management.service.LibrarySearchService

class MainActivity : AppCompatActivity() {

    private val searchService = LibrarySearchService()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val statsTextView = findViewById<TextView>(R.id.statsTextView)
        val bookIdInput = findViewById<EditText>(R.id.bookIdInput)
        val studentNameInput = findViewById<EditText>(R.id.studentNameInput)
        val studentIdInput = findViewById<EditText>(R.id.studentIdInput)
        val issueButton = findViewById<Button>(R.id.issueButton)

        fun refreshStats() {
            val (total, available, issued) = searchService.getInventorySummary()
            statsTextView.text = "Total: $total | Available: $available | Issued: $issued"
        }

        refreshStats()

        issueButton.setOnClickListener {
            val success = LibraryRepository.issueBook(
                bookId = bookIdInput.text.toString().trim(),
                record = BorrowerRecord(
                    borrowerName = studentNameInput.text.toString().trim(),
                    borrowerId = studentIdInput.text.toString().trim(),
                    dueDate = "2026-12-01"
                )
            )
            if (success) {
                Toast.makeText(this, "Book Issued Successfully", Toast.LENGTH_SHORT).show()
                refreshStats()
            } else {
                Toast.makeText(this, "Unavailable or Invalid Book ID", Toast.LENGTH_SHORT).show()
            }
        }
    }
}