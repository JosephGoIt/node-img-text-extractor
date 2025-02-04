'use strict';

const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

// Function to extract text from an image
async function extractInvoiceDetails(imagePath) {
    try {
        const { data: { text } } = await Tesseract.recognize(
            imagePath, // Image path
            'eng',     // Language
            {
                logger: m => console.log(m) // Log progress
            }
        );
        
        console.log("Extracted Text:\n", text);
        
        // Extract Invoice Number
        const invoiceRegex = /INVOICE[:#\s]+(\d+)/i;
        const invoiceMatch = text.match(invoiceRegex);
        const invoiceNumber = invoiceMatch ? invoiceMatch[1] : "Not found";
        console.log("Invoice Number:", invoiceNumber);
        
        // Extract Date - Improved to handle OCR errors
        const dateRegex = /(DATE[:\s]*|DATETI)\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i;
        const dateMatch = text.match(dateRegex);
        const invoiceDate = dateMatch ? dateMatch[2] : "Not found";
        console.log("Invoice Date:", invoiceDate);
        
        // Extract Description
        const descriptionRegex = /DESCRIPTION[\s\S]*?(\bConsultation services\b)/i;
        const descriptionMatch = text.match(descriptionRegex);
        const description = descriptionMatch ? descriptionMatch[1] : "Not found";
        console.log("Description:", description);
        
        // Extract Total Amount
        const totalRegex = /TOTAL[:\s]+(\d+[.,]?\d*)/i;
        const totalMatch = text.match(totalRegex);
        const totalAmount = totalMatch ? totalMatch[1] : "Not found";
        console.log("Total Amount:", totalAmount);
        
        return { invoiceNumber, invoiceDate, description, totalAmount };
    } catch (error) {
        console.error("Error processing image:", error);
    }
}

// Example usage
const imagePath = path.join(__dirname, 'sample-inv.jpg');
extractInvoiceDetails(imagePath);