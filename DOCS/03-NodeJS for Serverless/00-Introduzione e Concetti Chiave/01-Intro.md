
# Introduzione a Node Js per Serverless

**Node.js per Serverless** si riferisce alla pratica di utilizzare l'ambiente di runtime JavaScript **Node.js** per lo sviluppo e l'esecuzione di **funzioni serverless** sulle piattaforme dei cloud provider (come AWS Lambda, Google Cloud Functions, Azure Functions).

Questo approccio permette agli sviluppatori di scrivere il codice delle funzioni e concentrarsi sulla logica di business, **senza doversi preoccupare della gestione dell'infrastruttura** server sottostante, che viene completamente astratta e gestita dal provider cloud.

Node.js è una **scelta eccellente per l’architettura serverless**, grazie a:

- leggerezza
- rapidità di avvio
- ecosistema NPM che offre un’enorme quantità di librerie.

---

## 🧩 Cos’è il Serverless

**Serverless** significa che non gestisci direttamente server o istanze virtuali.

Il cloud provider (AWS, Azure, Google Cloud, ecc.) esegue il codice **on-demand**, solo quando serve, e, inoltre,  scala automaticamente.

I servizi più noti:

* **AWS Lambda**
* **Azure Functions**
* **Google Cloud Functions**

---

## 💻 Serverless Node.js

Serverless Node.js, noto anche come Function-as-a-Service (FaaS) con Node.js, si basa sull'esecuzione di **piccole funzioni indipendenti** (spesso chiamate *microservizi* serverless) che sono **attivate da eventi** (come richieste HTTP, modifiche a database, caricamenti di file, messaggi in coda, ecc.).

In pratica, uno sviluppatore scrive il codice della funzione in Node.js, lo carica sulla piattaforma cloud, e il provider gestisce automaticamente:

* **Provisioning** e **gestione** dei server.
* **Scalabilità automatica** (scalare in su o in giù in base alla domanda, fino a zero).
* **Bilanciamento del carico**.
* **Patch** e **aggiornamenti** di sicurezza del sistema operativo.

### Come Funziona

1.  Lo sviluppatore scrive una **funzione Node.js** per gestire un evento specifico.
2.  La funzione viene caricata su una piattaforma serverless (es. AWS Lambda).
3.  Quando si verifica l'**evento di trigger** (es. una richiesta web), la piattaforma cloud esegue la funzione.
4.  L'esecuzione è **misurata e fatturata in base al consumo effettivo** (tempo di esecuzione e memoria utilizzata).

---

## ⚙️ Perché Node.js è ideale per Serverless

Node.js è particolarmente adatto per le architetture serverless grazie ad alcune sue caratteristiche chiave:

* **Architettura Non-Blocking/Event-Driven:** Il modello I/O non bloccante di Node.js gli permette di gestire un gran numero di richieste concorrenti in modo efficiente, utilizzando meno risorse. Questa caratteristica si sposa perfettamente con l'architettura basata su eventi del FaaS.
* **Velocità e Efficienza:** Basato sul motore JavaScript V8 di Google, Node.js compila il codice in codice macchina, garantendo un'esecuzione rapida e **riducendo la latenza**, un fattore cruciale nelle funzioni serverless che devono rispondere velocemente.
* **Ecosistema NPM Vasto:** L'enorme ecosistema di pacchetti npm (Node Package Manager) consente agli sviluppatori di integrare rapidamente funzionalità pronte all'uso, accelerando lo sviluppo di applicazioni serverless complesse.
* **Single Language, Full Stack:** L'utilizzo di JavaScript sia per il frontend che per il backend (tramite Node.js) semplifica lo stack tecnologico, riducendo la curva di apprendimento e facilitando la condivisione del codice e delle competenze all'interno del team.



| Vantaggio                           | Descrizione                                                                              |
| ----------------------------------- | ---------------------------------------------------------------------------------------- |
| **Avvio rapido (cold start basso)** | Node.js ha un tempo di avvio ridotto, quindi le funzioni si attivano velocemente.        |
| **Event loop non bloccante**        | Perfetto per funzioni asincrone (API, webhook, elaborazioni I/O).                        |
| **Ampio ecosistema**                | NPM offre SDK e pacchetti per qualsiasi API o database.                                  |
| **Facile da testare in locale**     | Puoi usare `serverless-offline` o emulatori (Azure Functions Core Tools, SAM CLI, ecc.). |
| **Compatibilità cross-cloud**       | Lo stesso codice Node.js può girare su AWS, Azure o GCP con minime modifiche.            |

più in genrale, i vantaggi dell'architettura serverless includono:

| Vantaggio | Descrizione |
| :--- | :--- |
| **Costi Ottimizzati** | Il modello "Pay-per-Use" (paga solo per il tempo di esecuzione effettivo) elimina i costi fissi per i server inattivi, risultando spesso in un notevole risparmio. |
| **Scalabilità Automatica** | La piattaforma cloud gestisce lo scaling istantaneo in base alla domanda. L'applicazione può passare da zero richieste a picchi elevati senza intervento manuale. |
| **Manutenzione Zero** | Gli sviluppatori non devono gestire l'infrastruttura, il sistema operativo o gli aggiornamenti di runtime, potendosi concentrare esclusivamente sul codice. |
| **Time-to-Market Veloce** | La semplificazione della gestione dell'infrastruttura e l'efficienza di Node.js (grazie anche a npm) consentono una distribuzione e iterazione più rapide. |
| **Alta Disponibilità Integrata** | I provider cloud replicano automaticamente le funzioni su più centri dati, garantendo tolleranza ai guasti e alta disponibilità per impostazione predefinita. |


---

## ⚠️ Sfide del Serverless con Node.js

Nonostante i numerosi vantaggi, l'architettura serverless presenta anche delle sfide, alcune delle quali sono particolarmente rilevanti per Node.js:

* **Cold Start (Avvio a Freddo):** Quando una funzione viene richiamata per la prima volta dopo un periodo di inattività (o se la piattaforma ha bisogno di creare una nuova istanza per scalare), il container deve essere avviato e il runtime (Node.js) deve essere caricato ed inizializzato. Questo può causare una **latenza iniziale** che impatta le performance, specialmente per le funzioni Node.js con molte dipendenze.
* **Vendor Lock-in (Blocco del Fornitore):** L'utilizzo di API e servizi specifici di un provider cloud (es. AWS Lambda, Azure Functions) può rendere complessa la migrazione dell'applicazione verso un altro provider.
* **Limiti di Esecuzione:** I provider serverless impongono limiti di tempo (timeout) e di memoria per l'esecuzione delle funzioni. Questo rende l'approccio non adatto per **operazioni di calcolo intensivo o processi a lunga esecuzione**.
* **Monitoring e Debugging Complessi:** La natura distribuita e la mancanza di controllo sull'ambiente di esecuzione rendono il tracciamento dei log e il debugging più complicati rispetto ai server tradizionali. Sono necessari strumenti e pratiche specifici per le architetture distribuite.
* **Difficoltà con Calcoli Pesanti:** La natura *single-thread* di Node.js, pur essendo eccellente per l'I/O, non lo rende la scelta ideale per operazioni che richiedono un'intensa elaborazione della CPU, che in un ambiente serverless possono bloccare l'unico thread e rallentare la risposta.

---

## 🧱 Struttura tipica di un progetto Serverless Node.js

Di seguito viene riportato un esempio base di funzione serverless in Node.js.


```js
// handler.js
exports.handler = async (event) => {
  const name = event.queryStringParameters?.name || 'World';
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: `Hello, ${name}!` }),
  };
};
```



```yaml
# servless.yml

# Piano dichiarativo di sempio per AWS che utilizza tecnologia servless
# https://www.serverless.com/

service: hello-node-serverless

provider:
  name: aws
  runtime: nodejs20.x
  region: eu-central-1

functions:
  hello:
    handler: handler.handler
    events:
      - http:
          path: hello
          method: get
```


```bash
# start.sh

# Installazione servless e deploy applicativo
# https://www.serverless.com/
npm install -g serverless
serverless deploy
```



## 🔄 Frameworks utili per i deployment

| Framework                                  | Descrizione                                                |
| ------------------------------------------ | ---------------------------------------------------------- |
| **Serverless Framework**                   | Standard de facto per deployment multi-cloud.              |
| **AWS SAM (Serverless Application Model)** | Integrato con AWS CLI e CloudFormation.                    |
| **Architect**                              | Framework minimalista per app Node serverless multi-cloud. |
| **Netlify / Vercel**                       | Deploy immediato per funzioni Node.js lato edge.           |

---

## 🧪 Test locale e CI/CD

Test locale con mock event:

```bash
serverless invoke local -f hello --data '{"queryStringParameters": {"name": "Antonio"}}'
```

Pipeline CI/CD (GitHub Actions):

```yaml
name: Deploy Serverless
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx serverless deploy
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## 📦 Integrazioni comuni

* **Database**: 
  * DynamoDB, 
  * MongoDB Atlas, 
  * PostgreSQL 
* **Autenticazione**: 
  * Amazon Cognito, 
  * Auth0, 
  * Azure AD B2C
* **Storage**: 
  * S3, 
  * Azure Blob, 
  * Google Cloud Storage
* **Eventi / Code**: 
  * SNS, 
  * SQS, 
  * EventBridge, 
  * Pub/Sub, 
  * Kafka
* **API Gateway**: 
  * gestione REST o GraphQL (es. AppSync)


---

## 🌍 Scenari di utilizzo:

* **API REST serverless** con Express o Fastify (tramite `aws-serverless-express`)
* **Webhook handler** per Stripe, Slack, GitHub
* **ETL/event processing** con Kafka o SQS
* **Automazioni programmate** (cron Lambda)
* **Microservizi distribuiti** su AWS Lambda + DynamoDB + API Gateway

---



