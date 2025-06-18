// Import commands.js using ES2015 syntax:
import './commands'
import 'cypress-file-upload'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests from command log
const app = window.top;
if (app) {
  app.document.addEventListener('DOMContentLoaded', () => {
    const style = app.document.createElement('style');
    style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
    app.document.head.appendChild(style);
  });
}

// Add custom commands for PDF operations
Cypress.Commands.add('uploadPdf', (filePath) => {
  cy.get('input[type="file"]').attachFile(filePath);
});

Cypress.Commands.add('checkApiResponse', (response) => {
  expect(response.status).to.eq(200);
  expect(response.body).to.not.be.null;
});