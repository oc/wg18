// Google Apps Script for Dugnad Q2 2026
// ====================================================
// Sheet-oppsett:
//   Tab "signups":     A timestamp · B seksjon · C oppgave_id · D status · E notat
//   Tab "suggestions": A timestamp · B seksjon · C beskrivelse · D timer · E budsjett
//
// STATUS-VERDIER for signups kolonne D:
//   "påmeldt"  — standard etter signup
//   "fullført" — styret bekrefter utført arbeid
//   "ikke møtt" — styret markerer manglende oppmøte

const SHEET_ID = 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE';
const SHEET_SIGNUPS = 'signups';
const SHEET_SUGGESTIONS = 'suggestions';

function _sheet(name) {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(name);
}

// GET: returner alle påmeldinger og forslag
function doGet(e) {
  const signupSheet = _sheet(SHEET_SIGNUPS);
  const sugSheet = _sheet(SHEET_SUGGESTIONS);

  // Signups: { oppgave_id: [{seksjon, status}, ...] }
  const signups = {};
  const sData = signupSheet.getDataRange().getValues();
  for (let i = 1; i < sData.length; i++) {
    const [, seksjon, oppgaveId, status] = sData[i];
    if (!oppgaveId) continue;
    if (!signups[oppgaveId]) signups[oppgaveId] = [];
    signups[oppgaveId].push({
      seksjon: parseInt(seksjon, 10),
      status: status || 'påmeldt',
    });
  }

  // Suggestions: [{seksjon, beskrivelse, timer, budsjett, timestamp}, ...]
  const suggestions = [];
  if (sugSheet) {
    const gData = sugSheet.getDataRange().getValues();
    for (let i = 1; i < gData.length; i++) {
      const [timestamp, seksjon, beskrivelse, timer, budsjett] = gData[i];
      if (!beskrivelse) continue;
      suggestions.push({
        timestamp: timestamp,
        seksjon: parseInt(seksjon, 10),
        beskrivelse: String(beskrivelse),
        timer: timer,
        budsjett: budsjett,
      });
    }
  }

  return _json({ signups, suggestions });
}

// POST: signup eller suggestion
//   Signup body:     { seksjon: 1, oppgaver: ["d1-rive-plen", ...] }
//   Suggestion body: { type: "suggestion", seksjon: 1, beskrivelse: "...",
//                      timer: "4", budsjett: "500" }
function doPost(e) {
  const body = JSON.parse(e.postData.contents);

  if (body.type === 'suggestion') {
    return _handleSuggestion(body);
  }

  return _handleSignup(body);
}

function _handleSignup(body) {
  const sheet = _sheet(SHEET_SIGNUPS);
  const seksjon = parseInt(body.seksjon, 10);
  const oppgaver = body.oppgaver || [];

  if (!seksjon || seksjon < 1 || seksjon > 12) {
    return _json({ error: 'Ugyldig seksjon' });
  }

  // Slett kun rader med status "påmeldt" — bevar styre-bekreftet arbeid
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

function _handleSuggestion(body) {
  const sheet = _sheet(SHEET_SUGGESTIONS);
  if (!sheet) {
    return _json({ error: 'suggestions-arket finnes ikke' });
  }
  const seksjon = parseInt(body.seksjon, 10);
  const beskrivelse = String(body.beskrivelse || '').trim();

  if (!beskrivelse) {
    return _json({ error: 'Mangler beskrivelse' });
  }

  sheet.appendRow([
    new Date(),
    seksjon || '',
    beskrivelse,
    body.timer || '',
    body.budsjett || '',
  ]);

  return _json({ ok: true });
}

function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
