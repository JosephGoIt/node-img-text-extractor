'use strict';

const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

async function extractInvoiceDetails(imagePath) {
    try {
        const { data: { text } } = await Tesseract.recognize(
            imagePath,
            'eng',
            {
                logger: m => console.log(m) // Log progress
            }
        );

        console.log("Extracted Text:\n", text);
        
        // Extract Invoice Number (improved regex)
        const invoiceRegex = /INVOICE\s*(?:NO[:\s-]*)?(\d{6,}-\d{4})/i;
        const invoiceMatch = text.match(invoiceRegex);
        const invoiceNumber = invoiceMatch ? invoiceMatch[1].trim() : "Not found";
        console.log("Invoice Number:", invoiceNumber);
        
        // Extract Date (more flexible pattern)
        const dateRegex = /(?:DATE|DATE INVOICE NO)[\s:]*([\d]{1,2}[\/\-\s][\d]{1,2}[\/\-\s][\d]{2,4})/i;
        const dateMatch = text.match(dateRegex);
        const invoiceDate = dateMatch ? dateMatch[1].trim() : "Not found";
        console.log("Invoice Date:", invoiceDate);
        
        // Extract Total Amount
        const totalRegex = /TOTAL\s*(\d+[.,]?\d*)/gi;
        let totalAmount = "Not found";
        let match;
        while ((match = totalRegex.exec(text)) !== null) {
            totalAmount = match[1];
        }
        console.log("Total Amount:", totalAmount);

        // Extract Table Data (Details)
        const tableStartRegex = /QUANTITY\s+DESCRIPTION\s+UNIT PRICE\s+LINE TOTAL/gi;
        const tableStartIndex = text.search(tableStartRegex);
        const subtotalIndex = text.search(/Subtotal/i);
        
        let details = [];
        
        if (tableStartIndex !== -1 && subtotalIndex !== -1) {
            const tableContent = text
                .substring(tableStartIndex, subtotalIndex)
                .split('\n')
                .map(row => row.trim())
                .filter(row => row !== "" && !row.startsWith("QUANTITY")); // Remove headers
            
            console.log("Extracted Table Content:", tableContent);

            for (let i = 0; i < tableContent.length; i++) {
                const row = tableContent[i].match(/^(\d+)\s+([\w\s-]+)\s+\$(\d+)\s+\$(\d+)$/);
                if (row) {
                    details.push({
                        quantity: row[1],
                        description: row[2].trim(),
                        unitPrice: `$${row[3]}`,
                        lineTotal: `$${row[4]}`
                    });
                }
            }
        } else {
            console.warn("Warning: Unable to find table data in extracted text.");
        }

        console.log("Details:", details);
        
        return { invoiceNumber, invoiceDate, totalAmount, details };
    } catch (error) {
        console.error("Error processing image:", error);
    }
}

// Example usage
const imagePath = path.join(__dirname, 'sample-inv.png');
extractInvoiceDetails(imagePath);