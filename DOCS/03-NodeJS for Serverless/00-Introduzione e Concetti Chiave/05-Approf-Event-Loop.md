# Event Loop di Node.js: Architettura Dettagliata

L'**Event Loop** è il cuore di Node.js che gli permette di eseguire operazioni non-blocking I/O nonostante sia single-threaded. È un ciclo infinito che controlla costantemente diversi stack e code per eseguire operazioni.

---


## Componenti Principali

### 1. Call Stack

Il **Call Stack** è una struttura dati LIFO (Last-In, First-Out) che traccia le funzioni in esecuzione.

```javascript
function prima() {
    console.log('Prima funzione');
    seconda();
}

function seconda() {
    console.log('Seconda funzione');
    terza();
}

function terza() {
    console.log('Terza funzione');
}

prima();
```

**Comportamento del Call Stack:**
```
Call Stack:
1. terza()
2. seconda() 
3. prima()
4. (main)
```

### 2. Node APIs (Libuv)

Le **Node APIs** sono APIs fornite dal modulo **libuv** che gestiscono operazioni asincrone fuori dal thread principale.

**Operazioni gestite:**

- `setTimeout/setInterval`
- `fs.readFile` (file system)
- `http.request` (network)
- `crypto` (operazioni crittografiche)

### 3. Callback Queue (Task Queue)

La **Callback Queue** è una coda FIFO (First-In, First-Out) che contiene i callback pronti per essere eseguiti.

### 4. Event Loop

L'**Event Loop** è il regista che coordina tutto il processo.

## Flusso Dettagliato dell'Event Loop

### Fasi dell'Event Loop

L'Event Loop lavora in **6 fasi distinte**:

```javascript
const phases = [
    'timers',
    'pending callbacks', 
    'idle, prepare',
    'poll',
    'check',
    'close callbacks'
];
```

### 1. Fase Timers

Esegue i callback di `setTimeout()` e `setInterval()`

### 2. Fase Pending Callbacks

Esegue callbacks di operazioni di sistema deferite

### 3. Fase Idle, Prepare

Usage interno di Node.js

### 4. Fase Poll

- Recupera nuovi eventi I/O
- Esegue callbacks I/O correlati
- Blocca qui se la coda è vuota

### 5. Fase Check

Esegue callbacks di `setImmediate()`

### 6. Fase Close Callbacks

Esegue callbacks di chiusura (`socket.on('close')`)

## Esempio Pratico Completo

```javascript
console.log('1. Script iniziato');

// Operazione sincrona - va direttamente nel call stack
function operazioneSincrona() {
    console.log('2. Operazione sincrona completata');
}

// setTimeout - va nelle Node APIs
setTimeout(() => {
    console.log('6. Timeout completato');
}, 0);

// setImmediate - va nella fase check
setImmediate(() => {
    console.log('7. Immediate completato');
});

// Promise - microtask, priorità alta
Promise.resolve().then(() => {
    console.log('4. Promise risolta');
});

// Operazione I/O asincrona
const fs = require('fs');
fs.readFile(__filename, () => {
    console.log('5. File lettura completata');
    
    setTimeout(() => {
        console.log('8. Timeout dentro readFile');
    }, 0);
    
    setImmediate(() => {
        console.log('9. Immediate dentro readFile');
    });
});

operazioneSincrona();
console.log('3. Script finito');
```

**Output atteso:**
```
1. Script iniziato
2. Operazione sincrona completata  
3. Script finito
4. Promise risolta
6. Timeout completato
7. Immediate completato
5. File lettura completata
9. Immediate dentro readFile
8. Timeout dentro readFile
```

## Visualizzazione del Processo

```
INIZIO
  │
  ▼
Call Stack: [main]
  │
  ▼ Esegue console.log sincrone
Call Stack: [main]
  │
  ▼ Incontra setTimeout
Call Stack: [main]
  │
  ▼
Node APIs: [timer registrato]
  │
  ▼ Incontra Promise
Call Stack: [main] → Microtask Queue: [promise callback]
  │
  ▼ Incontra fs.readFile  
Call Stack: [main] → Node APIs: [timer, file operation]
  │
  ▼ Script finisce
Call Stack: [] → Microtask Queue: [promise callback]
  │
  ▼ Event Loop inizia
  │
  ▼ Fase 1: Esegue microtasks
Microtask Queue: [] → Call Stack: [promise callback]
  │
  ▼ Fase 2: Timers phase  
Node APIs: [timer completed] → Callback Queue: [timer callback]
Callback Queue: [] → Call Stack: [timer callback]
  │
  ▼ Fase 3: Poll phase - file ready
Node APIs: [file completed] → Callback Queue: [file callback]  
Callback Queue: [] → Call Stack: [file callback]
  │
  ▼ Dentro file callback, incontra setImmediate
Node APIs: [immediate registered]
  │
  ▼ Fase 4: Check phase - esegue immediate
Node APIs: [immediate completed] → Callback Queue: [immediate callback]
Callback Queue: [] → Call Stack: [immediate callback]
  │
  ▼ Continua...
```

---

## Microtasks vs Macrotasks

### Microtasks (alta priorità)

- `Promise.then/catch/finally`
- `process.nextTick`
- `queueMicrotask`

### Macrotasks (bassa priorità)

- `setTimeout/setInterval`
- `setImmediate`
- `I/O operations`

```javascript
console.log('script start');

setTimeout(() => {
    console.log('setTimeout');
}, 0);

Promise.resolve().then(() => {
    console.log('promise 1');
}).then(() => {
    console.log('promise 2');
});

console.log('script end');

// Output:
// script start
// script end  
// promise 1
// promise 2
// setTimeout
```

---

## Gestione delle Operazioni I/O Intensive

```javascript
const crypto = require('crypto');

// Operazione CPU-intensive - BLOCCHENTE
function hashSync(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

// Operazione non-blocking
function hashAsync(data, callback) {
    // Usiamo thread pool di libuv
    crypto.pbkdf2(data, 'salt', 100000, 64, 'sha512', (err, derivedKey) => {
        callback(derivedKey.toString('hex'));
    });
}

console.log('Inizio operazioni');

// Sync - blocca l'event loop
console.log('Hash sync:', hashSync('dati'));

// Async - non blocca
hashAsync('dati', (hash) => {
    console.log('Hash async:', hash);
});

console.log('Fine script - event loop libero');
```

---

## Errori Comuni e Best Practices

### 1. Non bloccare l'Event Loop

```javascript
// ❌ SBAGLIATO - blocca l'event loop
function operazionePesante() {
    let risultato = 0;
    for (let i = 0; i < 10000000000; i++) {
        risultato += Math.sqrt(i);
    }
    return risultato;
}

// ✅ CORRETTO - usa worker threads o splitting
function operazioneNonBloccante() {
    return new Promise((resolve) => {
        setImmediate(() => {
            let risultato = 0;
            for (let i = 0; i < 1000000; i++) {
                risultato += Math.sqrt(i);
            }
            resolve(risultato);
        });
    });
}
```

### 2. Gestione corretta dei callback

```javascript
// ❌ SBAGLIATO - callback hell
fs.readFile('file1.txt', (err, data1) => {
    if (err) throw err;
    fs.readFile('file2.txt', (err, data2) => {
        if (err) throw err;
        // ... più nesting
    });
});

// ✅ CORRETTO - async/await o promises
async function leggiFiles() {
    try {
        const [data1, data2] = await Promise.all([
            fs.promises.readFile('file1.txt'),
            fs.promises.readFile('file2.txt')
        ]);
        return { data1, data2 };
    } catch (error) {
        console.error('Errore:', error);
    }
}
```

---

## Monitoraggio dell'Event Loop

```javascript
const monitor = require('event-loop-lag');

const lag = monitor(1000); // controlla ogni secondo

setInterval(() => {
    console.log('Event loop lag:', lag() + 'ms');
}, 1000);

// Controllo manuale della salute
let lastTime = Date.now();
setInterval(() => {
    const currentTime = Date.now();
    const delta = currentTime - lastTime;
    
    if (delta > 1000) {
        console.warn(`Event loop bloccato per ${delta}ms`);
    }
    
    lastTime = currentTime;
}, 100);
```

---

## Riassunto delle Priorità

1. **Process.nextTick** (massima priorità)
2. **Promises** (microtasks)
3. **Timers** (setTimeout/setInterval)
4. **I/O Callbacks** 
5. **setImmediate**
6. **Close Callbacks**

L'Event Loop è ciò che rende Node.js così efficiente per I/O-intensive applications, permettendo di gestire migliaia di connessioni concorrenti con un singolo thread attraverso l'uso intelligente di operazioni asincrone e non-blocking.