package com.buildex.service;

import com.buildex.entity.Payment;
import com.buildex.entity.Property;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;

@Service
public class PdfService {

    // Brand Colors
    private static final java.awt.Color BRAND_GOLD = new java.awt.Color(200, 162, 74); // #C8A24A
    private static final java.awt.Color BRAND_DARK = new java.awt.Color(15, 23, 42); // #0F172A
    private static final java.awt.Color GRAY_LIGHT = new java.awt.Color(241, 245, 249); // #F1F5F9

    public byte[] generatePaymentReceipt(Payment payment) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // --- Header Section ---
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[] { 1, 1 });

            // Logo/Brand Name (Left)
            PdfPCell brandCell = new PdfPCell();
            brandCell.setBorder(Rectangle.NO_BORDER);
            brandCell.setBackgroundColor(BRAND_DARK);
            brandCell.setPadding(20);

            Font brandFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, java.awt.Color.WHITE);
            Paragraph brandName = new Paragraph("BUILDEX", brandFont);
            brandCell.addElement(brandName);

            Font brandSubFont = FontFactory.getFont(FontFactory.HELVETICA, 10, new java.awt.Color(200, 200, 200));
            brandCell.addElement(new Paragraph("Premium Real Estate", brandSubFont));

            headerTable.addCell(brandCell);

            // Receipt Title (Right)
            PdfPCell titleCell = new PdfPCell();
            titleCell.setBorder(Rectangle.NO_BORDER);
            titleCell.setBackgroundColor(BRAND_DARK);
            titleCell.setPadding(20);
            titleCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            titleCell.setVerticalAlignment(Element.ALIGN_MIDDLE);

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, BRAND_GOLD);
            Paragraph title = new Paragraph("PAYMENT RECEIPT", titleFont);
            title.setAlignment(Element.ALIGN_RIGHT);
            titleCell.addElement(title);

            headerTable.addCell(titleCell);
            document.add(headerTable);

            document.add(Chunk.NEWLINE);

            // --- Customer Greeting ---
            Font greetingFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
            document.add(new Paragraph("Dear " + payment.getUser().getFullName() + ",", greetingFont));
            document.add(new Paragraph("Thank you for your payment. Here are the transaction details.", greetingFont));
            document.add(Chunk.NEWLINE);

            // --- Payment Details Section ---
            addSectionHeader(document, "Transaction Details");

            PdfPTable paymentTable = new PdfPTable(2);
            paymentTable.setWidthPercentage(100);
            paymentTable.setSpacingBefore(5f);
            paymentTable.setSpacingAfter(15f);
            paymentTable.setWidths(new float[] { 1, 2 });

            addStyledTableRow(paymentTable, "Receipt No", "REC-" + payment.getId());
            addStyledTableRow(paymentTable, "Date",
                    payment.getPaymentDate() != null
                            ? payment.getPaymentDate().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm"))
                            : "N/A");
            addStyledTableRow(paymentTable, "Transaction ID", payment.getRazorpayPaymentId());
            addStyledTableRow(paymentTable, "Payment Mode", "Online (Razorpay)");
            addStyledTableRow(paymentTable, "Payment Type", payment.getPaymentType().toString());
            if (payment.getRentMonth() != null) {
                addStyledTableRow(paymentTable, "Billing Period", payment.getRentMonth());
            }

            document.add(paymentTable);

            // --- Property Details Section ---
            Property property = payment.getProperty();
            if (property != null) {
                addSectionHeader(document, "Property Details");

                PdfPTable propertyTable = new PdfPTable(2);
                propertyTable.setWidthPercentage(100);
                propertyTable.setSpacingBefore(5f);
                propertyTable.setSpacingAfter(15f);
                propertyTable.setWidths(new float[] { 1, 2 });

                addStyledTableRow(propertyTable, "Property", property.getTitle());
                addStyledTableRow(propertyTable, "Location", property.getArea() + ", " + property.getCity());
                addStyledTableRow(propertyTable, "Builder", property.getBuilderName());
                addStyledTableRow(propertyTable, "Type", property.getPropertyType().toString());

                document.add(propertyTable);
            }

            // --- Amount Section ---
            PdfPTable amountTable = new PdfPTable(2);
            amountTable.setWidthPercentage(100);
            amountTable.setWidths(new float[] { 3, 1 });
            amountTable.setSpacingBefore(20f);

            PdfPCell labelCell = new PdfPCell(
                    new Phrase("Total Amount Paid", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14)));
            labelCell.setBorder(Rectangle.TOP);
            labelCell.setPadding(10);
            labelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            amountTable.addCell(labelCell);

            PdfPCell amountCell = new PdfPCell(new Phrase("INR " + payment.getAmount(),
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, BRAND_DARK)));
            amountCell.setBorder(Rectangle.TOP);
            amountCell.setPadding(10);
            amountCell.setBackgroundColor(GRAY_LIGHT);
            amountCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            amountTable.addCell(amountCell);

            document.add(amountTable);

            document.add(Chunk.NEWLINE);
            document.add(Chunk.NEWLINE);

            // --- Footer ---
            PdfPTable footerTable = new PdfPTable(1);
            footerTable.setWidthPercentage(100);

            PdfPCell footerCell = new PdfPCell();
            footerCell.setBorder(Rectangle.TOP);
            footerCell.setPadding(20);
            footerCell.setHorizontalAlignment(Element.ALIGN_CENTER);

            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA, 9, java.awt.Color.GRAY);
            footerCell.addElement(new Paragraph("Buildex Realty | support@buildex.com | buildexx.app", footerFont));
            footerCell.addElement(new Paragraph(
                    "This is a computer-generated receipt and does not require a signature.", footerFont));

            // Align paragraphs in cell
            for (Object o : footerCell.getCompositeElements()) {
                if (o instanceof Paragraph) {
                    ((Paragraph) o).setAlignment(Element.ALIGN_CENTER);
                }
            }

            footerTable.addCell(footerCell);
            document.add(footerTable);

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Error generating PDF", e);
        }

        return out.toByteArray();
    }

    private void addSectionHeader(Document document, String title) throws DocumentException {
        Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, BRAND_DARK);
        Paragraph p = new Paragraph(title, sectionFont);
        p.setSpacingBefore(10);
        p.setSpacingAfter(5);
        document.add(p);

        // Underline effect
        // LineSeparator line = new LineSeparator(1, 100, BRAND_GOLD,
        // Element.ALIGN_LEFT, -2);
        // document.add(line);
    }

    private void addStyledTableRow(PdfPTable table, String header, String value) {
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA, 10, java.awt.Color.GRAY);
        Font valueFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BRAND_DARK);

        PdfPCell headerCell = new PdfPCell(new Phrase(header, headerFont));
        headerCell.setBorder(Rectangle.BOTTOM);
        headerCell.setBorderColor(new java.awt.Color(230, 230, 230));
        headerCell.setPadding(8);
        headerCell.setPaddingLeft(0);
        table.addCell(headerCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setBorder(Rectangle.BOTTOM);
        valueCell.setBorderColor(new java.awt.Color(230, 230, 230));
        valueCell.setPadding(8);
        table.addCell(valueCell);
    }
}
