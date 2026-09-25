// ====== SETTINGS ======
var ADMIN_EMAIL = 'musicmedward@gmail.com';           // only this Google account can open the admin page
var SHEET_ID    = '1pqExON858uEvvfpLqHUaxPet0tRMlQMd3bGzkCvVrlY'; // "Business Cards Database" sheet
var SHEET_NAME  = 'Cards';

var COLUMNS = ['id','active','name','roles','phone','viber','telegram','facebook','instagram',
  'profileUrl','coverUrl','showPhone','showViber','showTelegram','showFacebook','showInstagram'];

// ====== ROUTING ======
// Public card:  .../exec?id=riesan
// Admin panel:  .../exec?page=admin
function doGet(e) {
  var page = (e.parameter.page || '').toLowerCase();
  if (page === 'admin') {
    return renderAdmin_();
  }
  var id = e.parameter.id;
  if (!id) {
    return HtmlService.createHtmlOutput(
      '<p style="font-family:sans-serif;padding:40px;text-align:center;color:#999">No card selected.</p>');
  }
  return renderCard_(id);
}

function renderCard_(id) {
  var card = getCardById_(id);
  var t = HtmlService.createTemplateFromFile('Card');
  t.card = card;
  return t.evaluate()
    .setTitle(card ? card.name : 'Not found')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function renderAdmin_() {
  var email = Session.getActiveUser().getEmail();
  var t = HtmlService.createTemplateFromFile('Admin');
  t.authorized = (email === ADMIN_EMAIL);
  t.email = email;
  return t.evaluate()
    .setTitle('Card Admin')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ====== SHEET HELPERS ======
function getSheet_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Sheet tab "' + SHEET_NAME + '" not found.');
  return sheet;
}

function rowToObject_(row) {
  var obj = {};
  COLUMNS.forEach(function (col, i) { obj[col] = row[i]; });
  return obj;
}

function getCardById_(id) {
  var data = getSheet_().getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(id).trim()) return rowToObject_(data[i]);
  }
  return null;
}

function requireAdmin_() {
  var email = Session.getActiveUser().getEmail();
  if (email !== ADMIN_EMAIL) throw new Error('Not authorized.');
}

// ====== CALLED FROM Admin.html (google.script.run) ======
function adminListCards() {
  requireAdmin_();
  var data = getSheet_().getDataRange().getValues();
  var out = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) out.push(rowToObject_(data[i]));
  }
  return out;
}

function adminSaveCard(card) {
  requireAdmin_();
  if (!card.id) throw new Error('Card needs an id.');
  var sheet = getSheet_();
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(card.id).trim()) { rowIndex = i + 1; break; }
  }
  var rowValues = COLUMNS.map(function (col) {
    return card[col] !== undefined && card[col] !== null ? card[col] : '';
  });
  if (rowIndex === -1) {
    sheet.appendRow(rowValues);
  } else {
    sheet.getRange(rowIndex, 1, 1, COLUMNS.length).setValues([rowValues]);
  }
  return true;
}

function adminDeleteCard(id) {
  requireAdmin_();
  var sheet = getSheet_();
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(id).trim()) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}
