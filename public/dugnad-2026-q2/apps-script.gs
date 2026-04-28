// Google Apps Script for Dugnad Q2 2026 påmeldinger
// ====================================================
// Oppsett:
// 1. Opprett et Google Sheet, navn det "Dugnad 2026 Q2 påmeldinger"
// 2. Opprett ett ark med navn "signups" og kolonneoverskrifter:
//      A: timestamp   B: seksjon   C: oppgave_id
// 3. Verktøy → Apps Script (eller script.google.com → Nytt prosjekt)
// 4. Lim inn dette skriptet, lagre
// 5. Oppdater SHEET_ID under (finnes i URL-en til Sheet-et)
// 6. Distribuer → Ny distribusjon → Type: Web-app
//      Utfør som: Meg
//      Hvem har tilgang: Alle (eller "Alle med Google-konto" for mer kontroll)
// 7. Kopier Web-app URL og lim inn i index.html (variabel APPS_SCRIPT_URL)

const SHEET_ID = 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE';
const SHEET_NAME = 'signups';

function _sheet() {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
}

// GET: returner alle påmeldinger gruppert per oppgave
function doGet(e) {
  const sheet = _sheet();
  const data = sheet.getDataRange().getValues();
  const signups = {}; // { oppgave_id: [seksjon, ...] }

  // Hopp over header-raden
  for (let i = 1; i < data.length; i++) {
    const [timestamp, seksjon, oppgaveId] = data[i];
    if (!oppgaveId) continue;
    if (!signups[oppgaveId]) signups[oppgaveId] = [];
    if (!signups[oppgaveId].includes(seksjon)) {
      signups[oppgaveId].push(seksjon);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({ signups }))
    .setMimeType(ContentService.MimeType.JSON);
}

// POST: erstatt påmeldinger for én seksjon
// Body: { "seksjon": 1, "oppgaver": ["d1-rive-plen", ...] }
function doPost(e) {
  const sheet = _sheet();
  const body = JSON.parse(e.postData.contents);
  const seksjon = parseInt(body.seksjon, 10);
  const oppgaver = body.oppgaver || [];

  if (!seksjon || seksjon < 1 || seksjon > 12) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Ugyldig seksjon' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Slett eksisterende rader for denne seksjonen
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (parseInt(data[i][1], 10) === seksjon) {
      sheet.deleteRow(i + 1);
    }
  }

  // Legg til nye rader
  const now = new Date();
  for (const oppgave of oppgaver) {
    sheet.appendRow([now, seksjon, oppgave]);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, count: oppgaver.length }))
    .setMimeType(ContentService.MimeType.JSON);
}
