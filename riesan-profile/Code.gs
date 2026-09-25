// Upload both photos to Google Drive, open each one, copy the ID from the link
// (https://drive.google.com/file/d/THIS_PART_IS_THE_ID/view) and paste below.
var PROFILE_PHOTO_ID = 'PASTE_PROFILE_PHOTO_ID_HERE';
var COVER_PHOTO_ID   = 'PASTE_COVER_PHOTO_ID_HERE';

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
