// Google Apps Script for Dugnad Q2 2026 påmeldinger
// ====================================================
// Oppsett:
// 1. Opprett et Google Sheet, navn det "Dugnad 2026 Q2 påmeldinger"
// 2. Opprett ett ark med navn "signups" og kolonneoverskrifter:
//      A: timestamp   B: seksjon   C: oppgave_id   D: status   E: notat
// 3. Verktøy → Apps Script (eller script.google.com → Nytt prosjekt)
// 4. Lim inn dette skriptet, lagre
// 5. Oppdater SHEET_ID under (finnes i URL-en til Sheet-et)
// 6. Distribuer → Ny distribusjon → Type: Web-app
//      Utfør som: Meg
//      Hvem har tilgang: Alle (eller "Alle med Google-konto")
// 7. Kopier Web-app URL og lim inn i index.html (variabel APPS_SCRIPT_URL)
//
// STATUS-VERDIER for kolonne D:
//   "påmeldt"  — standard etter signup
//   "fullført" — styret bekrefter utført arbeid
//   "ikke møtt" — styret markerer manglende oppmøte
//
// STYRE-WORKFLOW (etter dugnaden):
//   Åpne Sheet-et direkte og rediger:
//   - Endre status fra "påmeldt" til "fullført" der jobben er gjort
//   - Endre seksjon-kolonnen hvis en annen seksjon faktisk gjorde jobben
//   - Sett "ikke møtt" hvis ingen utførte oppgaven
//   - Skriv eventuelle notater i kolonne E
//
//   Sheet-et er den autoritative kilden — siden henter status derfra.

const SHEET_ID = 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE';
const SHEET_NAME = 'signups';

function _sheet() {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
}

// GET: returner alle påmeldinger gruppert per oppgave, med status
// Format: { signups: { oppgave_id: [{seksjon, status}, ...] } }
function doGet(e) {
  const sheet = _sheet();
  const data = sheet.getDataRange().getValues();
  const signups = {};

  for (let i = 1; i < data.length; i++) {
    const [, seksjon, oppgaveId, status] = data[i];
    if (!oppgaveId) continue;
    if (!signups[oppgaveId]) signups[oppgaveId] = [];
    signups[oppgaveId].push({
      seksjon: parseInt(seksjon, 10),
      status: status || 'påmeldt',
    });
  }

  return _json({ signups });
}

// POST: erstatt påmeldinger for én seksjon
// Beholder rader som er markert "fullført" eller "ikke møtt" av styret.
// Body: { "seksjon": 1, "oppgaver": ["d1-rive-plen", ...] }
function doPost(e) {
  const sheet = _sheet();
  const body = JSON.parse(e.postData.contents);
  const seksjon = parseInt(body.seksjon, 10);
  const oppgaver = body.oppgaver || [];

  if (!seksjon || seksjon < 1 || seksjon > 12) {
    return _json({ error: 'Ugyldig seksjon' });
  }

  // Slett kun rader med status "påmeldt" — ikke rør styre-bekreftet arbeid
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    const status = data[i][3] || 'påmeldt';
    if (parseInt(data[i][1], 10) === seksjon && status === 'påmeldt') {
      sheet.deleteRow(i + 1);
    }
  }

  // Legg til nye rader med default-status "påmeldt"
  const now = new Date();
  for (const oppgave of oppgaver) {
    sheet.appendRow([now, seksjon, oppgave, 'påmeldt', '']);
  }

  return _json({ ok: true, count: oppgaver.length });
}

function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
