# Concetto di Non-Blocking Architecture in Node.js (e Serverless)


In Node.js, e quindi anche negli ambienti **serverless** (AWS Lambda, Azure Functions, Google Cloud Functions, ecc.), il concetto di **Non-Blocking Architecture** è fondamentale perché determina **come** l’applicazione gestisce:

-  la concorrenza, 
-  il carico 
-  l’utilizzo delle risorse.


---


## ✅ **Cos’è una Non-Blocking Architecture**

Una *non-blocking architecture* è un modello in cui le operazioni potenzialmente lente come:

- I/O su file, 
- query su database, 
- chiamate HTTP, 
- attese su code, 
- ecc. 

**non blocchino il thread principale**.

In node:
- esiste **un solo thread principale** (event loop).
- Se un’operazione richiede tempo, Node la delega al sistema (libuv) e **continua a processare altre richieste**.

### Esempio:

```js
const fs = require("fs");

console.log("1");
fs.readFile("file.txt", () => console.log("file caricato"));
console.log("2");
```

Output:

```
1
2
file caricato
```

Il thread non attende la lettura del file ma prosegue.

---

# 🌀 L’Event Loop**

La non-blocking architecture si basa sull’**Event Loop**, un ciclo che gestisce:

* callback
* Promises
* eventi di I/O
* timers
* microtask

Node è ottimizzato per eseguire molteplici task I/O concorrenti sullo stesso thread.

---

# ⚡ Perché node è ideale nel mondo Serverless

Nel modello serverless, ogni “invocazione” deve essere:

* veloce
* efficiente
* con minimo consumo risorse (si paga a millisecondi)

La non-blocking architecture permette a una singola function di:

* gestire molte operazioni I/O
* con costi ridotti
* con maggiore throughput
* senza necessità di scalare con tanti thread

### Esempio tipico:

```js
exports.handler = async (event) => {
  const utente = getUserFromDB(event.id);     // async
  const orders = getOrders(event.id);         // async

  // vengono mandate in parallelo
  const [u, o] = await Promise.all([utente, orders]);
  return { user: u, orders: o };
};
```

Si ottiene, quindi, potenza “multi-thread” senza i costi del multi-thread.

---

# 🧱 Considerazioni

**"Non-Blocking"** non significa:

❌ fare tutto in parallelo
❌ usare più CPU core
❌ evitare completamente code o colli di bottiglia

Significa semplicemente che attività **computazioneali pesanti** non devono bloccare il thread principale.

Gli scenari che possono causare un blocco del thread principale (compute ad alto carico) sono ad esempio:

* encryption “manuale”
* compressione
* parsing JSON enormi
* AI local inference
* for loops molto grandi

In un ambiente serverless questo è pericoloso, perché:

* rallenta la Function
* aumenta i costi
* può generare timeout

Node offre metodi asincroni per molte operazioni comuni (es. `fs.readFile` vs `fs.readFileSync`) per evitare questi problemi e gestire al meglio gli scenari di compute ad alto carico.

---

# 🧩 Quando NON usare operazioni blocking nel serverless

Evitare:

* `crypto.pbkdf2Sync`
* `fs.readFileSync`
* operazioni CPU-intensive
* grandi transform stream senza backpressure

Queste operazioni **bloccano il thread** e quindi l’intera invocazione.

---

# 🟢 Quando la Non-Blocking Architecture funziona al meglio

Perfetta per:

* API REST
* Funzioni che fanno integrazioni
* Query database
* Chiamate a microservizi
* Interazione con S3, Blob Storage, ecc.
* Event processing

Il serverless è costruito proprio pensando a funzioni **I/O-bound**.

---

# 💡 Conclusioni

* Node.js è **single-thread** ma non-blocking grazie all’Event Loop.
* Le operazioni I/O non fermano l’esecuzione → ideale per serverless.
* Nel serverless evita operazioni CPU-bound o “sync”.


