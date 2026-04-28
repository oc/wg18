# Dugnad Q2 2026 — påmeldingsside

Statisk HTML-side med Google Sheets som "database" via Apps Script.

## Filer

- `index.html` — selve siden
- `apps-script.gs` — backend som lagrer påmeldinger til et Google Sheet
- `README.md` — denne filen

## Oppsett (engangsjobb, ~10 min)

### 1. Lag Google Sheet

1. Gå til [sheets.google.com](https://sheets.google.com), opprett nytt dokument
2. Navn det "Dugnad 2026 Q2 påmeldinger"
3. Døp arket nederst til `signups`
4. Sett rad 1 som overskrifter:
   - A1: `timestamp`
   - B1: `seksjon`
   - C1: `oppgave_id`
5. Kopier Sheet-ID fra URL-en — det er strengen mellom `/d/` og `/edit`:
   `docs.google.com/spreadsheets/d/`**`DENNE_DELEN`**`/edit`

### 2. Sett opp Apps Script

1. I Sheet-et: **Verktøy → Apps Script**
2. Slett standardkoden, lim inn innholdet fra `apps-script.gs`
3. Bytt ut `SHEET_ID` med ID-en fra steg 1
4. Lagre (disketten / Cmd+S)
5. **Distribuer → Ny distribusjon**
   - Type: **Web-app**
   - Beskrivelse: `Dugnad 2026 Q2 backend`
   - Utfør som: **Meg**
   - Hvem har tilgang: **Alle** (eller "Alle med Google-konto" hvis du vil binde til innlogging)
6. Klikk **Distribuer**, autoriser tilgang
7. Kopier **Web-app URL**-en (slutter med `/exec`)

### 3. Koble HTML til backend

Åpne `index.html`, finn linjen:

```js
const APPS_SCRIPT_URL = 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';
```

Bytt ut med URL-en fra steg 2.7.

### 4. Publiser siden

Tre alternativer, sortert etter enkelhet:

- **GitHub Pages**: push filene til et repo, slå på Pages i innstillinger
- **Netlify Drop**: dra mappen til [app.netlify.com/drop](https://app.netlify.com/drop)
- **Lokal test**: `python3 -m http.server 8000` i mappen, åpne `http://localhost:8000`

## Endre oppgaver eller budsjett

Alt ligger i `index.html` — søk etter `const TASKS` for oppgavelisten, og `FIXED_COSTS` / `TOTAL_HOUR_BUDGET` / `HOURLY_RATE` for økonomien.

## Juridisk grunnlag for fakturering

Modellen baserer seg på **eierseksjonsloven §29** om felleskostnader og krever vedtak på årsmøte:

> Sameiet vedtar en dugnadsavgift som dekker materialer + estimert kostnad
> ved ekstern arbeidskraft for vedlikeholdsoppgaver. Avgiften fordeles likt
> per seksjon. Seksjoner som dokumenterer arbeidstimer på dugnad refunderes
> med 650 kr per time.

Modellen er nøytral (ikke straff) og rettferdig (gulrot), og er etablert praksis i mange norske sameier.

**Anbefalt:** ta inn formuleringen i vedtektene under "Felleskostnader og dugnad" på neste årsmøte for varig hjemmel.
