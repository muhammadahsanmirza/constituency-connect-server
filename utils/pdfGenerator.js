const PDFDocument = require('pdfkit');
const responseHandler = require('./responseHandler');

// Function to generate a PDF for a complaint
exports.generateComplaintPDF = async (complaint, res) => {
  try {
    console.log('PDF Generator: Starting PDF generation');
    
    // Create a new PDF document
    console.log('PDF Generator: Creating PDFDocument instance');
    const doc = new PDFDocument({ margin: 50 });
    
    // Set up error handling for the PDF stream
    doc.on('error', (error) => {
      console.error('PDF Generator: PDF stream error:', error);
      // We need to end the response to prevent hanging
      if (!res.headersSent) {
        console.log('PDF Generator: Sending error response from stream error handler');
        return responseHandler.serverError(res, 'Error generating PDF document');
      }
    });

    // Set response headers for PDF download
    console.log('PDF Generator: Setting response headers');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=complaint-${complaint._id}.pdf`);
    
    // Pipe the PDF document to the response
    console.log('PDF Generator: Piping PDF to response');
    doc.pipe(res);
    
    console.log('PDF Generator: Adding title');
    // Add title
    doc.fontSize(20).text('Complaint Details', { align: 'center' });
    doc.moveDown();
    
    console.log('PDF Generator: Adding complaint information');
    // Add complaint information
    doc.fontSize(14).text('Complaint Information', { underline: true });
    doc.moveDown(0.5);
    
    // Add complaint details
    console.log('PDF Generator: Adding complaint details');
    doc.fontSize(12).text(`Title: ${complaint.title}`);
    doc.moveDown(0.5);
    
    doc.fontSize(12).text(`Category: ${complaint.category}`);
    doc.moveDown(0.5);
    
    doc.fontSize(12).text(`Status: ${complaint.status}`);
    doc.moveDown(0.5);
    
    doc.fontSize(12).text(`Complaint ID: ${complaint._id}`);
    doc.moveDown(0.5);
    
    doc.fontSize(12).text(`Submitted on: ${new Date(complaint.createdAt).toLocaleDateString()}`);
    doc.moveDown(0.5);
    
    if (complaint.updatedAt) {
      doc.fontSize(12).text(`Last Updated: ${new Date(complaint.updatedAt).toLocaleDateString()}`);
      doc.moveDown(0.5);
    }
    
    console.log('PDF Generator: Adding description');
    // Add description
    doc.fontSize(14).text('Description', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(complaint.description || 'No description provided');
    doc.moveDown();
    
    console.log('PDF Generator: Adding response if available');
    // Add response if available
    if (complaint.response) {
      doc.fontSize(14).text('Representative Response', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).text(complaint.response);
      doc.moveDown();
    }
    
    console.log('PDF Generator: Adding constituent information');
    // Add constituent and representative information
    if (complaint.constituent && typeof complaint.constituent === 'object') {
      doc.fontSize(14).text('Constituent Information', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Name: ${complaint.constituent.name || 'N/A'}`);
      doc.fontSize(12).text(`Email: ${complaint.constituent.email || 'N/A'}`);
      doc.moveDown();
    }
    
    console.log('PDF Generator: Adding representative information');
    if (complaint.representative && typeof complaint.representative === 'object') {
      doc.fontSize(14).text('Representative Information', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Name: ${complaint.representative.name || 'N/A'}`);
      doc.fontSize(12).text(`Email: ${complaint.representative.email || 'N/A'}`);
      doc.moveDown();
    }
    
    console.log('PDF Generator: Adding footer');
    // Add footer
    const footerText = 'This is an official document generated from the Constituency Management System.';
    doc.fontSize(10).text(footerText, 50, doc.page.height - 50, { align: 'center' });
    
    console.log('PDF Generator: Finalizing PDF');
    // Finalize the PDF
    doc.end();
    console.log('PDF Generator: PDF generation completed successfully');
    
    return true;
  } catch (error) {
    console.error('PDF Generator: Error generating PDF:', error);
    console.log(`PDF Generator: Error details - ${error.stack}`);
    if (!res.headersSent) {
      console.log('PDF Generator: Sending error response from catch block');
      responseHandler.serverError(res, 'Error generating PDF: ' + error.message);
    } else {
      console.log('PDF Generator: Headers already sent, cannot send error response');
    }
    return false;
  }
};