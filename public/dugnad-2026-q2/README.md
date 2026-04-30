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
   - D1: `status`
   - E1: `notat`
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
   - Hvem har tilgang: **Alle**
6. Klikk **Distribuer**, autoriser tilgang
7. Kopier **Web-app URL**-en (slutter med `/exec`)

### 3. Koble HTML til backend

Åpne `index.html`, finn linjen:

```js
const APPS_SCRIPT_URL = 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';
```

Bytt ut med URL-en fra steg 2.7.

### 4. Publiser siden

- **Cloudflare**: prosjektet er allerede konfigurert via `wrangler.toml` i parent-mappen
- **Lokal test**: `python3 -m http.server 8000` i mappen, åpne `http://localhost:8000`

## Modell · kostnadsbesparelse

Vedlikeholdsarbeidet dekkes via felleskostnadene som vanlig (eierbrøk, [eierseksjonsloven §29](https://lovdata.no/nav/lov/2017-06-16-65/kapV/%C2%A729)). Dugnaden er frivillig og **kollektiv** — hver utført time sparer sameiet 650 kr i ekstern arbeidskraft, og besparelsen brukes til å forklare neste felleskostnads-justering.

## Styret-workflow etter dugnaden

Sheet-et er den autoritative kilden. Etter dugnaden åpner styret Google Sheet-et og redigerer direkte:

| Kolonne | Ved påmelding | Etter dugnad (styret oppdaterer) |
|---|---|---|
| **D · status** | `påmeldt` | `fullført` eller `ikke møtt` |
| **B · seksjon** | seksjon som meldte seg på | endre hvis annen seksjon faktisk utførte arbeidet |
| **E · notat** | tom | fri tekst (f.eks. faktiske timer, kvalitet, kommentar) |

Siden viser status fortløpende:
- `fullført` → grønn merket task med ✓-symbol
- `påmeldt` → standard tellermerke
- `ikke møtt` → vises med rød overstrek

Re-påmeldinger fra en seksjon overstyrer kun rader med status `påmeldt` — styre-bekreftet arbeid bevares.

## Endre oppgaver eller budsjett

Alt ligger i `index.html` — søk etter `const TASKS` for oppgavelisten, og `TOTAL_HOUR_BUDGET` / `HOURLY_RATE` for økonomien.
