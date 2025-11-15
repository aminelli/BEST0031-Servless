# **lifecycle di una Function Serverless in Node.js**


Le funzioni serverless non vivono in un server dedicato: vengono eseguite dentro ambienti runtime temporanei e isolati, creati e distrutti on-demand. 

Capire questo ciclo di vita è fondamentale per ottimizzare performance, costi, gestione della memoria, connessioni ai DB, logging e mantenere un comportamento coerente.


Di seguito alcune considerazioni sul **lifecycle di una Function Serverless in Node.js** e del suo **execution environment**, valida per i principali provider (AWS Lambda, Azure Functions, Google Cloud Functions), con note sulle differenze.

---


## ✅ Il ciclo di vita di una funzione serverless in Node.js**

Una funzione serverless attraversa tre stati principali:

### **1. Initialization phase (INIT) — Fase di inizializzazione**

Accade quando il provider crea un nuovo *execution environment* per la tua funzione.

Include:

* **load del modulo Node.js** (es. `require`, import)
* esecuzione di **codice dichiarato a livello globale**
* inizializzazione di:

  * connessioni DB (se create fuori dal handler)
  * client HTTP, SDK
  * configurazione, variabili, oggetti singletons
  * setup di librerie pesanti

👉 **Eseguito una sola volta per ogni ambiente creato**
(fino a quando quell’ambiente rimane attivo)

Esempio:

```js
// Eseguito UNA sola volta per environment
const db = createDbConnection(); 
console.log("Init: connessione creata");

exports.handler = async (event) => {
  return "ok";
}
```



### **2. Invocation phase (INVOKE) — Esecuzione dell’handler**

Qui viene chiamata realmente la tua funzione.

Accade per **ogni invocazione** mentre l'ambiente è attivo.

Include:

* gestione dell’input (`event`, `context`)
* logica applicativa
* utilizzo di risorse già inizializzate nella fase INIT
* risposta all’utente o ritorno del valore

👉 L'esecuzione deve essere **stateless**.
La funzione *non deve dipendere* dall’ordine delle invocazioni.


### **3. Freeze / Idle phase (FREEZE) — Congelamento**

Dopo l’invocazione, se l’ambiente non è più usato immediatamente:

* lo stato della memoria **viene congelato**
* **CPU sospesa**
* nessun codice può essere eseguito
* il runtime può rimanere congelato da pochi secondi a diversi minuti

Questo permette riutilizzi futuri senza costi di re-init.


### **4. Thawing / Reuse phase (WARM START) — Riattivazione**

Se arriva una nuova invocazione mentre l’ambiente esiste ancora:

* il runtime viene "risvegliato"
* la memoria è ancora lì (cache, oggetti, connessioni)
* la fase INIT **non viene rieseguita**
* la funzione parte direttamente dal tuo handler

✨ Effetto pratico: risposta più veloce e meno costi.


### **5. Shutdown (COLD START TERMINATION) — Distruzione dell’ambiente**

Il provider può eliminare l’ambiente in qualsiasi momento:

* se l’ambiente rimane frozen troppo a lungo
* dopo deploy di nuova versione
* per operazioni di manutenzione
* per scaling a zero

👉 TUTTO lo stato in RAM va perso.
👉 Le connessioni aperte vengono terminate.


---

## 🟩 **Cold Start vs Warm Start**

### ❄️ **Cold Start**

Quando viene creato un nuovo ambiente:

* importazione dei moduli Node.js
* esecuzione del codice globale
* eventuali connessioni DB
* creazione dell’esecutore

Tempo:

* AWS Lambda: 100–800 ms (può essere più alto con VPC)
* Azure Functions: 200–1200 ms
* GCP: 100–600 ms

### 🔥 **Warm Start**

Non si ripete nulla della fase INIT.
Solo il tuo handler viene eseguito.

Tempo: < 5–20 ms

---

## 🟦 **Execution environment (runtime Node.js isolato)**

Ogni funzione viene eseguita in un runtime isolato:

### Caratteristiche:

* Sistema operativo minimal (sandbox)
* Nessun accesso root
* Timeout imposto dal provider
* Filesystem **temporaneo** (in-memory o dir limitata es. `/tmp`)
* Nessun server persistente
* Variabili d’ambiente isolate
* Memoria e CPU allocate dinamicamente

### Filesystem:

* **sola lettura** per il codice della funzione
* **scrittura consentita solo in /tmp** (es. 512 MB–1 GB)
* i file in `/tmp` possono sopravvivere ai warm start (cache utile!)

---

## 🟧 **Come si comporta Node.js nello scenario serverless**

### **Event Loop**

L’event loop funziona normalmente, ma:

* Se ci sono operazioni pendenti (timer, socket aperti, promises senza await), il provider può:

  * aspettare la sua conclusione
  * oppure terminare l’esecuzione (dipende dalle impostazioni)

### **Singletons e caching**

Ottimo practice:

* mantenere connessioni DB aperte a livello globale
* utilizzare `let cachedValue` per caching in RAM
* creare singletons per client di API e librerie

Questi oggetti **sopravvivono ai warm start**.

---

## 🟨 **Best practice per Node.js Serverless**

### 👍 Cose da fare

✔ metti le connessioni DB **fuori dall’handler**
✔ usa `/tmp` come cache temporanea
✔ usa variabili globali come cache in-memory
✔ rendi la funzione stateless
✔ gestisci correttamente async/await
✔ usa librerie leggere
✔ gestisci errori e timeout delle connessioni

### ❌ Cose da evitare

✘ evitare codice costoso dentro l’handler
✘ evitare `warmup timers` per tenere viva la funzione (costosi)
✘ non salvare stato persistente solo in RAM
✘ non fare callback annidate o async non attese
✘ evitare grandi bundle (> 10 MB) che rallentano i cold start

---

## 🟩 **Differenze principali tra provider**

### **AWS Lambda**

* più veloce nei warm start
* runtime molto isolato
* `/tmp` persistente tra invocazioni
* cold start con VPC può essere lento (ma migliorato negli ultimi anni)

### **Azure Functions**

* runtime meno isolato (specialmente nel Consumption plan)
* opens connections automatically kept alive
* ottimo supporto locale con Functions Core Tools

### **Google Cloud Functions (2nd gen)**

* molto veloce nei cold start (basato su Cloud Run)
* runtime più simile a Docker container standalone
* migliore scalabilità orizzontale

---

## 📘 **Esempio : funzione con init, caching e warm start**

```js
// ========================
// FASE DI INIT (cold start)
// ========================
console.log("Init: caricamento moduli...");

const { Client } = require("pg");

let dbClient;
let cachedConfig;

// Connessione aperta una sola volta
async function initDb() {
  if (!dbClient) {
    dbClient = new Client({ connectionString: process.env.DB_URL });
    await dbClient.connect();
    console.log("Connessione DB inizializzata");
  }
  return dbClient;
}

// Config caricata una volta sola
async function loadConfig() {
  if (!cachedConfig) {
    // simulazione fetch remoto
    cachedConfig = { version: 1, message: "Hello Serverless" };
    console.log("Config caricata");
  }
  return cachedConfig;
}

// ========================
// HANDLER INVOCATO SEMPRE
// ========================
exports.handler = async (event) => {
  const db = await initDb();
  const config = await loadConfig();

  return {
    warmed: !!cachedConfig,
    message: config.message,
  };
};
```

Durante i warm start:

* nessuna riconnessione DB
* nessun ricaricamento config
* risposta immediata

---

## 🔚 **Conclusioni**

Le funzioni serverless Node.js vivono in ambienti che nascono e muoiono dinamicamente.
Capire il lifecycle (INIT → INVOKE → FREEZE → REUSE → SHUTDOWN) permette di:

* ridurre i cold start
* gestire correttamente le connessioni
* usare correttamente caching e singleton
* progettare funzioni realmente stateless e performanti

