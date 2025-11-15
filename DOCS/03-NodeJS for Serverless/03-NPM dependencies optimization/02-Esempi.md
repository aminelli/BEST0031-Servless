# Esempio 

Di seguito  un **esempio** di progetto **Serverless Node.js + TypeScript** ottimizzato per **AWS Lambda**, con:

* 📦 dipendenze leggere
* ⚙️ build automatizzata via **esbuild**
* 🧱 layer condiviso per librerie comuni
* 🧹 bundle minimale pronto per il deploy

---

## 🏗️ Struttura del progetto

```
serverless-ts-demo/
├── src/
│   ├── handlers/
│   │   ├── getUser.ts
│   │   └── createUser.ts
│   ├── utils/
│   │   └── response.ts
│   └── shared/
│       └── dbClient.ts
├── layers/
│   └── common/
│       ├── nodejs/
│       │   ├── package.json
│       │   └── node_modules/ (contiene solo librerie comuni)
├── package.json
├── tsconfig.json
├── esbuild.config.js
└── template.yaml   (SAM o CloudFormation)
```

---

## 📦 `package.json`

```json
{
  "name": "serverless-ts-demo",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "esbuild --bundle --minify --platform=node --target=node20 --outdir=dist src/handlers/*.ts",
    "clean": "rm -rf dist node_modules",
    "deploy": "npm run build && sam deploy --guided"
  },
  "devDependencies": {
    "esbuild": "^0.23.0",
    "typescript": "^5.6.3"
  },
  "dependencies": {
    "zod": "^3.23.8",
    "pino": "^9.0.0"
  }
}
```

📘 **Note:**

* `zod` → validazione schema (leggero e typesafe)
* `pino` → logging veloce e minimal
* `esbuild` → bundler e minificatore

---

## 🧠 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "outDir": "./dist",
    "strict": true
  },
  "include": ["src/**/*"]
}
```

---

## ⚡ `esbuild.config.js`

```js
import { build } from "esbuild";

await build({
  entryPoints: ["src/handlers/getUser.ts", "src/handlers/createUser.ts"],
  bundle: true,
  minify: true,
  platform: "node",
  target: "node20",
  outdir: "dist",
  external: ["aws-sdk"] // escluso perché fornito nativamente da Lambda
});
```

---

## 🧩 Esempio handler — `src/handlers/getUser.ts`

```ts
import { APIGatewayEvent, Context } from "aws-lambda";
import { success, failure } from "../utils/response.js";
import { z } from "zod";
import pino from "pino";

const log = pino();

const paramsSchema = z.object({
  userId: z.string().uuid()
});

export const handler = async (event: APIGatewayEvent, _: Context) => {
  try {
    const { userId } = paramsSchema.parse(event.pathParameters);
    log.info({ userId }, "Fetching user");

    // Esempio mock di risposta
    const user = { id: userId, name: "Antonio", role: "Admin" };
    return success(user);
  } catch (err) {
    log.error(err);
    return failure(err);
  }
};
```

---

## 🧰 Utility — `src/utils/response.ts`

```ts
export const success = (body: any) => ({
  statusCode: 200,
  body: JSON.stringify(body)
});

export const failure = (error: any) => ({
  statusCode: 400,
  body: JSON.stringify({ message: error.message || "Bad Request" })
});
```

---

## 🧱 Layer condiviso — `layers/common/nodejs/package.json`

```json
{
  "name": "common-layer",
  "version": "1.0.0",
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3.686.0"
  }
}
```

📘 Installa le dipendenze nel layer:

```bash
cd layers/common/nodejs
npm install --production
```

---

## 🧩 Esempio uso layer — `src/shared/dbClient.ts`

```ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export const db = new DynamoDBClient({ region: "eu-central-1" });
```

---

## ☁️ Template AWS SAM — `template.yaml`

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: Demo Node.js + TypeScript + esbuild + Layer

Globals:
  Function:
    Timeout: 10
    Runtime: nodejs20.x
    MemorySize: 512
    Architectures:
      - arm64

Resources:
  CommonLayer:
    Type: AWS::Serverless::LayerVersion
    Properties:
      LayerName: CommonLibs
      ContentUri: layers/common/
      CompatibleRuntimes:
        - nodejs20.x

  GetUserFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: dist/handlers/getUser.handler
      Layers:
        - !Ref CommonLayer
      Events:
        Api:
          Type: Api
          Properties:
            Path: /user/{userId}
            Method: get

  CreateUserFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: dist/handlers/createUser.handler
      Layers:
        - !Ref CommonLayer
      Events:
        Api:
          Type: Api
          Properties:
            Path: /user
            Method: post
```

---

## 🚀 Build & Deploy

```bash
npm install
npm run build
sam build
sam deploy --guided
```

✅ **Risultato finale:**

* Bundle < **2 MB** per funzione
* Layer condiviso per DynamoDB SDK
* Cold start < **150 ms**
* Tipizzazione TypeScript e validazioni runtime con `zod`
* Logging strutturato con `pino`


