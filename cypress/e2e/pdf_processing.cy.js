describe('PDF Processing API', () => {
  beforeEach(() => {
    cy.visit('/static/index.html');
  });

  it('should upload and process a PDF file', () => {
    cy.intercept('POST', '/api/pdf/upload').as('uploadRequest');

    cy.get('#uploadFile').attachFile('sample.pdf');
    cy.get('#uploadForm').submit();

    cy.wait('@uploadRequest').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body).to.be.an('array');
      expect(interception.response.body[0]).to.have.property('content');
      expect(interception.response.body[0]).to.have.property('metadata');
    });
  });

  it('should extract text from a PDF file', () => {
    cy.intercept('POST', '/api/pdf/extract-text').as('extractRequest');

    cy.get('#extractFile').attachFile('sample.pdf');
    cy.get('#extractForm').submit();

    cy.wait('@extractRequest').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body).to.have.property('text');
      expect(interception.response.body.text).to.be.a('string');
    });
  });

  it('should handle invalid file types', () => {
    cy.intercept('POST', '/api/pdf/upload').as('uploadRequest');

    cy.get('#uploadFile').attachFile({
      fileContent: 'invalid content',
      fileName: 'test.txt',
      mimeType: 'text/plain'
    });
    cy.get('#uploadForm').submit();

    cy.wait('@uploadRequest').then((interception) => {
      expect(interception.response.statusCode).to.eq(400);
      expect(interception.response.body).to.have.property('detail');
    });
  });

  it('should handle large files', () => {
    cy.intercept('POST', '/api/pdf/upload').as('uploadRequest');

    const largeContent = 'x'.repeat(11 * 1024 * 1024); // 11MB
    cy.get('#uploadFile').attachFile({
      fileContent: largeContent,
      fileName: 'large.pdf',
      mimeType: 'application/pdf'
    });
    cy.get('#uploadForm').submit();

    cy.wait('@uploadRequest').then((interception) => {
      expect(interception.response.statusCode).to.eq(400);
      expect(interception.response.body).to.have.property('detail');
    });
  });
});