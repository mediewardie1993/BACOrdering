var PROFILE_PHOTO_ID = '1pbJ9RW4za-Cu0BKuw_Jw6ZZV8GlLNk8c';
var COVER_PHOTO_ID   = '1xNjUSFC6MHLHzggBOtXoYrmiIMECEHM9';

function doGet() {
  var t = HtmlService.createTemplateFromFile('Index');
  t.profileSrc = imageDataUrl_(PROFILE_PHOTO_ID);
  t.coverSrc   = imageDataUrl_(COVER_PHOTO_ID);
  return t.evaluate()
    .setTitle('Riesan Hermosa')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function imageDataUrl_(id) {
  try {
    var blob = DriveApp.getFileById(id).getBlob();
    return 'data:' + blob.getContentType() + ';base64,' + Utilities.base64Encode(blob.getBytes());
  } catch (e) {
    return '';
  }
}

function testPhotos() {
  Logger.log(DriveApp.getFileById(PROFILE_PHOTO_ID).getName());
  Logger.log(DriveApp.getFileById(COVER_PHOTO_ID).getName());
}
