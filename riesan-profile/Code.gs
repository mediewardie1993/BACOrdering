function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Riesan Hermosa')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
