# Cold Start in Node.js per Serverless


Ottimizzare le funzioni Node.js per mitigare l'**Avvio a Freddo** (*Cold Start*) è cruciale per le applicazioni serverless sensibili alla latenza.

Il *Cold Start* è il ritardo che si verifica quando una funzione viene invocata e il provider cloud deve inizializzare un nuovo ambiente di esecuzione, che include il download del codice, l'avvio del runtime Node.js e l'esecuzione del codice di inizializzazione.

Ecco le strategie principali, divise per ambito, per ridurre al minimo questa latenza in Node.js:

-----

## Ottimizzazione del Codice e del Deployment

La velocità di inizializzazione è direttamente proporzionale alla quantità di dati da caricare.


### 📦 Minimizzare le Dimensioni del Pacchetto

Il cloud provider impiega tempo per scaricare ed estrarre il pacchetto di deployment (il file `.zip` o il container).

  * **Rimuovere le Dipendenze Non Utilizzate:** Assicurati che il pacchetto contenga solo i moduli necessari. Utilizza strumenti come `npm prune --production` o `depcheck` per pulire le dipendenze di sviluppo.
  * **Utilizzare Bundler:** Strumenti come **Webpack** o **esbuild** possono aggregare tutti i file JavaScript in un unico file ottimizzato e compresso (bundle), riducendo le dimensioni totali e il tempo di caricamento del modulo. **Esbuild** è spesso preferito per la sua velocità.
  * **Scegliere Librerie Leggere:** Dove possibile, usa alternative più snelle per librerie molto grandi (es. usa **`dayjs`** o **`date-fns`** al posto di `moment.js`, o usa importazioni selettive di `lodash`).

### ⚙️ Ottimizzazione del Codice di Inizializzazione (Fuori dall'Handler)

Tutto ciò che si trova al di fuori della funzione principale `handler` (o `exports.handler`) viene eseguito **una sola volta** durante il *Cold Start* e rimane in memoria per le successive *Warm Start* (riutilizzo del container).

  * **Lazy Loading (Caricamento Pigro):** Non caricare tutte le librerie all'avvio. Importare i moduli solo quando sono effettivamente necessari all'interno dell'handler.
  * **Connessioni al Database e Risorse Esterne:** Stabilire connessioni a database (come MongoDB o RDS), client SDK (es. AWS SDK) e pool di connessione **fuori dall'handler** ma all'interno dello scope del file. In questo modo, il container riutilizza la connessione attiva nelle invocazioni successive.

<!-- end list -->

```javascript
// Codice di inizializzazione (eseguito durante il Cold Start e riutilizzato)
const AWS = require('aws-sdk'); // Caricato una volta
let dbConnection = null;

exports.handler = async (event) => {
    // La connessione viene stabilita solo al primo Cold Start
    // Nelle successive invocazioni (Warm Start) viene riutilizzata
    if (!dbConnection) {
        dbConnection = await connectToDatabase();
    }
    
    // Logica di business
    return processEvent(event, dbConnection);
};
```

-----

## Ottimizzazione della Configurazione della Funzione

Alcune impostazioni della funzione influiscono direttamente sui tempi di avvio.

### 🧠 Aumentare la Memoria Allocata

Nella maggior parte dei servizi FaaS (come AWS Lambda), l'aumento della **memoria** allocata alla funzione comporta un **aumento proporzionale della CPU** disponibile.

  * Una maggiore potenza di calcolo (CPU) riduce il tempo necessario per decomprimere il codice, caricare il runtime Node.js e completare la fase di inizializzazione, mitigando significativamente la durata del *Cold Start*.
  * Trova un equilibrio tra costo e performance (la CPU aggiuntiva comporta costi maggiori).

### ⏳ Scegliere il Runtime Node.js più Recente

I provider cloud aggiornano costantemente i runtime. Le versioni più recenti di Node.js (basate su versioni più performanti del motore V8) spesso offrono **tempi di avvio più rapidi** e migliori prestazioni generali.

### 🌐 Utilizzare la *Provisioned Concurrency*

Questo è il metodo più diretto per **eliminare completamente** il *Cold Start* per le funzioni critiche (a pagamento).

  * Consiste nel pre-allocare un numero specificato di istanze della funzione che rimangono **sempre calde** e pronte a rispondere immediatamente.
  * È l'ideale per API con requisiti di bassa latenza costanti, ma ha un costo di esercizio anche quando le istanze sono inattive.

-----

## *Warming*

Per le funzioni meno critiche che non giustificano la Concorrenza Fornita, è possibile mantenere attive le istanze esistenti.

### ⏰ Warming Programmato (Ping)

  * Configura un evento schedulato (es. un **Cron Job** o un evento CloudWatch/EventBridge) per **invocare la funzione ogni 5-15 minuti**.
  * Questo garantisce che almeno un container rimanga attivo (*Warm*), riducendo la probabilità di un *Cold Start* quando arriva una richiesta utente reale.

-----

## Nuove Tecnologie Cloud (AWS SnapStart)

Servizi come **AWS Lambda** hanno introdotto funzionalità avanzate per risolvere il *Cold Start* per i runtime che lo supportano (attualmente Java e in futuro anche altri come Node.js).

  * **Lambda SnapStart:** Questa funzione inizializza la funzione in fase di deploy e ne salva uno **snapshot crittografato** (della memoria e dello stato del disco). Quando la funzione viene invocata, l'ambiente di esecuzione viene ripristinato dallo snapshot **invece di inizializzare tutto da zero**, garantendo prestazioni di avvio in genere inferiori al secondo senza modifiche al codice.

Sfruttando queste tecniche, si può massimizzare l'efficienza di Node.js nel contesto serverless, garantendo tempi di risposta rapidi che soddisfino le esigenze delle moderne applicazioni web.
