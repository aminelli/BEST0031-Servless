# Ottimizzazione delle dipendenze npm


L’**ottimizzazione delle dipendenze npm** è un tema cruciale nello sviluppo **serverless con Node.js**, perché ogni millisecondo e ogni MB contano: meno codice → cold start più rapido → costi inferiori.

Ecco una panoramica completa delle **strategie e best practice** per ottimizzare le dipendenze Node.js/TypeScript in ambienti serverless (AWS Lambda, Azure Functions, GCP Functions, Vercel, ecc.).

---

## ⚙️ 1. **Minimizzare le dipendenze**

* Evita di installare pacchetti monolitici se usi solo una piccola parte della libreria.
  **Esempio:**
  ❌ `lodash` → ✅ `lodash-es` o ancora meglio funzioni native (`Array.map`, `Object.entries`, ecc.)
  ❌ `moment` → ✅ `dayjs` o `date-fns` (più leggeri e modulari)
* Usa solo ciò che serve per quella singola funzione — ogni Lambda/Function può avere un suo package.json più leggero.

👉 **Strumenti utili:**

* `depcheck` → individua pacchetti non usati
* `npm prune --production` → rimuove devDependencies dal pacchetto di deploy

---

## 📦 2. **Tree-shaking e bundling**

Riduci il numero di file caricati al runtime impacchettando tutto in **un solo file ottimizzato**.

### Opzioni consigliate:

* **esbuild** → velocissimo, tree-shaking nativo e compatibile con TypeScript
* **webpack** (con `mode=production`) → rimuove codice inutilizzato
* **tsup** → alternativa moderna e minimale per funzioni Lambda TypeScript

📘 Esempio con `esbuild`:

```bash
esbuild src/handler.ts --bundle --platform=node --target=node20 --minify --outfile=dist/handler.js
```

Risultato:
✅ Un solo file `.js` minificato
✅ Import dinamici rimossi
✅ Miglior cold start (meno file → meno I/O)

---

## 🪶 3. **Evitare pacchetti pesanti per operazioni semplici**

Spesso l’uso di librerie esterne aggiunge megabyte inutili al bundle.
Esempi pratici:

| Operazione         | Evita               | Alternativa leggera                            |
| ------------------ | ------------------- | ---------------------------------------------- |
| HTTP call          | `axios` (~300 KB)   | `node-fetch` / `undici` (built-in in Node 18+) |
| Validazione schema | `joi` (~800 KB)     | `zod` o `superstruct`                          |
| Manipolazione date | `moment` (~1 MB)    | `dayjs` / `date-fns`                           |
| Logging            | `winston`, `bunyan` | `pino` (molto più veloce e leggero)            |

---

## 🧱 4. **Condividere dipendenze comuni (Lambda Layers)**

Quando più funzioni serverless usano le stesse librerie, spostale in un **Lambda Layer**:

* Riduce il peso del singolo pacchetto
* Migliora la cache e il cold start
* Evita ridondanze tra funzioni

📘 Esempio AWS SAM:

```yaml
Layers:
  CommonLibs:
    ContentUri: ./layers/common
    CompatibleRuntimes:
      - nodejs20.x
```

👉 Layer tipici: SDK AWS, logger, validatori, librerie condivise tra funzioni.

---

## ⚡ 5. **Usare moduli nativi e SDK modulari**

* Con Node 18+ puoi usare moduli **fetch**, **crypto**, **URL**, **stream**, **file system** già integrati, evitando pacchetti esterni.
* Gli SDK moderni sono modulari:

  ```bash
  npm install @aws-sdk/client-s3
  ```

  invece di:

  ```bash
  npm install aws-sdk
  ```

  ➜ Riduzione di decine di MB!

---

## 🧩 6. **Ottimizzare l’installazione npm**

* Usa **`npm ci`** invece di `npm install` nelle build CI/CD → installazione deterministica e più veloce.
* Evita `node_modules` enormi nel pacchetto: deploya solo i file necessari.
* Se usi `esbuild` o `webpack`, puoi escludere moduli nativi (`--external:aws-sdk` per Lambda).

---

## 🧰 7. **Monitorare il peso del bundle**

Integra strumenti di analisi per capire dove “pesa” di più la tua funzione:

* `webpack-bundle-analyzer`
* `esbuild --metafile=meta.json` + `esbuild-analyze`
* `size-limit` o `cost-of-modules`

👉 Obiettivo ideale:

* < **5 MB**: cold start rapidissimo
* < **10 MB**: accettabile per funzioni API
* > **50 MB**: rischio di timeout cold start e lentezza nel deploy

---

## 🔒 8. **Pulizia finale e deployment**

Prima del deploy:

```bash
npm prune --production
rm -rf node_modules
esbuild src/handler.ts --bundle --minify --platform=node --outfile=dist/handler.js
zip -r function.zip dist/
```

**IMPORTANTE**: Uploadare solo ciò che serve, senza `test`, `.map`, `docs`, o `devDependencies`.

---

### ✅ In sintesi

| Obiettivo                    | Tecnica consigliata                                |
| ---------------------------- | -------------------------------------------------- |
| Ridurre dimensione pacchetto | Tree-shaking (esbuild, tsup), prune devDeps        |
| Minimizzare cold start       | Bundle singolo + Layer comuni                      |
| Migliorare performance       | Usare SDK modulari e pacchetti leggeri             |
| Scalabilità e manutenibilità | Separare dipendenze per funzione o Layer condiviso |
| Build veloce                 | npm ci + esbuild                                   |


