# Esempi sui diversi Cloud

Di seguito **tre esempi (didattici) completi e paralleli** dello stesso scenario per:

* **AWS Lambda**
* **Azure Functions**
* **Google Cloud Functions (2nd gen)**

Lo scenario è identico per tutte le piattaforme:

👉 Una funzione Node.js che:

* mostra **cold/warm start**
* inizializza una connessione DB solo una volta (fase INIT)
* risponde con un oggetto JSON contenente:

  * timestamp
  * info sul warm start
  * messaggio

---

## **1. AWS Lambda**

### 📁 **Struttura progetto**

```
aws-lambda/
 ├── index.js
 ├── package.json
```

### 📄 **index.js**

```js
// =======================
// COLD START (INIT PHASE)
// =======================
console.log("AWS Lambda INIT: caricamento moduli...");

let cachedDbConnection = null;

// Simula una connessione al DB
async function connectDb() {
  if (!cachedDbConnection) {
    console.log("AWS Lambda: Creazione nuova connessione DB...");
    cachedDbConnection = { connectedAt: new Date().toISOString() };
  }
  return cachedDbConnection;
}

// =======================
//    HANDLER (INVOKE)
// =======================
exports.handler = async (event, context) => {
  const db = await connectDb();

  return {
    platform: "AWS Lambda",
    timestamp: new Date().toISOString(),
    dbConnectionTime: db.connectedAt,
    warmStart: cachedDbConnection !== null,
    message: "Hello from AWS Lambda!"
  };
};
```

### 📦 **package.json**

```json
{
  "name": "aws-lambda-example",
  "version": "1.0.0",
  "main": "index.js"
}
```

### 🚀 **Deploy (con AWS CLI)**

```bash
zip function.zip index.js package.json
aws lambda create-function \
  --function-name exampleLambda \
  --runtime nodejs20.x \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --role arn:aws:iam::<ACCOUNT_ID>:role/<ROLE_NAME>
```

---

## **2. Azure Function**

### 📁 **Struttura progetto**

```
azure-function/
 ├── index.js
 ├── function.json
 ├── package.json
```

### 📄 **index.js**

```js
// =========================
// COLD START (INIT PHASE)
// =========================
console.log("Azure Functions INIT: caricamento moduli...");

let cachedDbConnection = null;

async function connectDb() {
  if (!cachedDbConnection) {
    console.log("Azure Functions: Creazione nuova connessione DB...");
    cachedDbConnection = { connectedAt: new Date().toISOString() };
  }
  return cachedDbConnection;
}

// =========================
//        HANDLER
// =========================
module.exports = async function (context, req) {
  const db = await connectDb();

  context.res = {
    status: 200,
    body: {
      platform: "Azure Functions",
      timestamp: new Date().toISOString(),
      dbConnectionTime: db.connectedAt,
      warmStart: cachedDbConnection !== null,
      message: "Hello from Azure!"
    }
  };
};
```

### 📄 **function.json**

```json
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["get"]
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

### 📦 **package.json**

```json
{
  "name": "azure-function-example",
  "version": "1.0.0",
  "main": "index.js"
}
```

### 🚀 **Deploy (Azure CLI)**

```
func init . --javascript
func new --name warmExample --template "HTTP trigger"
func azure functionapp publish <NOME_FUNCTION_APP>
```

---

## **3. Google Cloud Functions (2nd gen)**

> Nota: La 2nd gen gira su Cloud Run → runtime simile a container → warm start molto efficace.

### 📁 **Struttura progetto**

```
gcp-function/
 ├── index.js
 ├── package.json
```

### 📄 **index.js**

```js
// =========================
//  COLD START (INIT PHASE)
// =========================
console.log("GCP Functions INIT: caricamento moduli...");

let cachedDbConnection = null;

async function connectDb() {
  if (!cachedDbConnection) {
    console.log("GCP Functions: Creazione nuova connessione DB...");
    cachedDbConnection = { connectedAt: new Date().toISOString() };
  }
  return cachedDbConnection;
}

// =========================
//        HANDLER
// =========================
exports.warmExample = async (req, res) => {
  const db = await connectDb();

  res.status(200).json({
    platform: "Google Cloud Functions (2nd gen)",
    timestamp: new Date().toISOString(),
    dbConnectionTime: db.connectedAt,
    warmStart: cachedDbConnection !== null,
    message: "Hello from GCP!"
  });
};
```

### 📦 **package.json**

```json
{
  "name": "gcp-function-example",
  "version": "1.0.0",
  "main": "index.js"
}
```

### 🚀 **Deploy (gcloud CLI)**

```bash
gcloud functions deploy warmExample \
  --gen2 \
  --runtime=nodejs20 \
  --region=europe-west1 \
  --trigger-http \
  --allow-unauthenticated
```

---

## RIASSUNTO delle differenze principali

| Caratteristica | AWS Lambda        | Azure Functions        | GCP Functions 2nd Gen |
| -------------- | ----------------- | ---------------------- | --------------------- |
| Runtime        | Sandbox isolata   | Worker condiviso       | Container Cloud Run   |
| Warm start     | Ottimo            | Molto buono            | Eccellente            |
| Timeout FS     | `/tmp` persiste   | locale variabile       | pieno FS container    |
| Config handler | `exports.handler` | `module.exports = ...` | `exports.name = ...`  |

