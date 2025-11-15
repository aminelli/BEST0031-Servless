# FaaS, Microservizi e Serverless: Differenze e Confronto

## Definizioni Chiare

### 1. Microservizi (Microservices Architecture)
**Architettura** di sviluppo software dove un'applicazione è composta da servizi piccoli, autonomi e indipendenti.

```javascript
// Esempio: E-commerce con microservizi
Servizio Utenti      → Gestione autenticazione, profili
Servizio Ordini      → Processing ordini, pagamenti
Servizio Catalogo    → Gestione prodotti, inventory
Servizio Shipping    → Logistica, tracciamento
```

### 2. FaaS (Function as a Service)
**Modello di esecuzione** dove il codice viene eseguito in risposta a eventi, senza gestire l'infrastruttura.

```javascript
// Esempio: Funzione AWS Lambda
exports.handler = async (event) => {
    // Elabora il file uploadato su S3
    const { bucket, key } = event.Records[0].s3;
    return await processImage(bucket, key);
};
```

### 3. Serverless
**Modello di cloud computing** che include FaaS + altri servizi gestiti, dove non si amministra l'infrastruttura.

```javascript
// Architettura Serverless completa
API Gateway → Lambda → DynamoDB → S3 → CloudFront
```

## Tabella Riepilogativa Comparativa

| Caratteristica | Microservizi | FaaS | Serverless |
|----------------|--------------|------|------------|
| **Scope** | Architettura applicativa | Modello di esecuzione | Modello cloud computing |
| **Unità di Deployment** | Servizi/Container | Funzioni singole | Funzioni + Servizi gestiti |
| **Runtime** | Sempre in esecuzione | Esecuzione on-demand | Esecuzione on-demand |
| **Scaling** | Manuale/Auto-scaling | Automatico e immediato | Automatico e immediato |
| **Costo** | Costante (risorse allocate) | Pay-per-use (esecuzione) | Pay-per-use |
| **Stato (State)** | Stateless o Stateful | Solo Stateless | Principalmente Stateless |
| **Cold Start** | No (sempre running) | Sì (avvio su evento) | Sì (avvio su evento) |
| **Tempo di Esecuzione** | Minuti/ore | Secondi/minuti (limiti) | Secondi/minuti (limiti) |
| **Complessità** | Alta (orchestrazione) | Media (logica business) | Bassa (astrazione) |
| **Controllo** | Alto (infrastruttura) | Basso (solo codice) | Molto Basso |
| **Use Case Ideali** | Applicazioni complesse | Event processing, API | Applicazioni event-driven |

## Dettaglio dei Modelli

### Microservizi - Caratteristiche Tecniche

```yaml
# docker-compose.yml esempio microservizi
version: '3'
services:
  user-service:
    build: ./users
    ports: ["3001:3000"]
    environment:
      - DB_URL=postgres://users-db
      
  order-service:  
    build: ./orders
    ports: ["3002:3000"]
    environment:
      - DB_URL=postgres://orders-db
      
  api-gateway:
    build: ./gateway
    ports: ["80:3000"]
```

**Vantaggi:**
- Team autonomi e specializzati
- Deployment indipendente
- Tecnologie eterogenee
- Fault isolation

**Svantaggi:**
- Complessità distribuita
- Network latency
- Testing complicato
- Monitoring complesso

### FaaS - Caratteristiche Tecniche

```javascript
// AWS Lambda - Processing immagini
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.resizeImage = async (event) => {
    const { bucket, key } = event.detail.object;
    
    // Scarica immagine
    const image = await s3.getObject({ Bucket: bucket, Key: key }).promise();
    
    // Resize
    const resized = await sharp(image.Body)
        .resize(800, 600)
        .toBuffer();
    
    // Salva risultato
    await s3.putObject({
        Bucket: bucket,
        Key: `resized/${key}`,
        Body: resized
    }).promise();
    
    return { status: 'success' };
};
```

**Vantaggi:**
- Nessun server management
- Scaling automatico
- Costo pay-per-execution
- High availability

**Svantaggi:**
- Cold start latency
- Limitazioni di runtime
- Debugging complesso
- Vendor lock-in

### Serverless - Architettura Completa

```yaml
# serverless.yml esempio completo
service: ecommerce-api

provider:
  name: aws
  runtime: nodejs18.x

functions:
  createOrder:
    handler: orders.create
    events:
      - http:
          path: /orders
          method: post
          
  processPayment:
    handler: payments.process
    events:
      - sqs: payment-queue
          
  notifyUser:
    handler: notifications.send
    events:
      - stream:
          type: dynamodb
          arn: !GetAtt OrdersTable.StreamArn

resources:
  Resources:
    OrdersTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: orders
        BillingMode: PAY_PER_REQUEST
```

## Casi d'Uso Specifici

### Quando Scegliere Microservizi

| Scenario | Motivazione | Esempio |
|----------|-------------|---------|
| **Applicazioni Enterprise** | Team multipli, tecnologie diverse | Sistema bancario, e-commerce |
| **Migrazione Monolite** | Decomposizione graduale | Legacy app modernization |
| **Alta Personalizzazione** | Controllo completo infrastruttura | Gaming platforms, real-time systems |
| **Complessità Business** | Domain-driven design | ERP systems, SaaS platforms |

### Quando Scegliere FaaS

| Scenario | Motivazione | Esempio |
|----------|-------------|---------|
| **Event Processing** | Reazione immediata a eventi | Resize immagini, notifiche |
| **API Backend** | Traffico variabile | Mobile apps backend, webhooks |
| **Cron Jobs** | Esecuzione schedulata | Report giornalieri, cleanup |
| **Processing Batch** | Elaborazione parallela | Data transformation, ETL |

### Quando Scegliere Serverless

| Scenario | Motivazione | Esempio |
|----------|-------------|---------|
| **MVP/Rapid Prototyping** | Time-to-market veloce | Startup, proof-of-concept |
| **Applicazioni Sporadiche** | Costo ottimizzato | Booking systems, event apps |
| **Workflow Event-Driven** | Integrazione servizi managed | IoT data processing, chatbots |
| **Frontend Hosting** | JAMstack architecture | SPA with cloud services |

## Confronto Prestazioni e Costi

### Analisi Costi

```javascript
// Scenario: API con 1 milione di request/mese

// Microservizi (ECS/EKS)
Costo = $200 (EC2 instances) + $100 (ELB) + $50 (RDS) = $350/mese

// FaaS (Lambda)
Costo = (1M requests * $0.0000002) + (5M GB-seconds * $0.0000166667) = ~$85/mese

// Serverless (Lambda + API Gateway + DynamoDB)
Costo = $85 (Lambda) + $350 (API Gateway) + $25 (DynamoDB) = $460/mese
```

### Confronto Prestazioni

```javascript
// Tempo di risposta medio
Microservizi: 50-100ms (sempre caldi)
FaaS: 100-300ms (cold start: 500-2000ms)
Serverless: 150-400ms (multiple services)
```

## Pattern di Integrazione

### Microservizi → FaaS

```javascript
// Microservizio che triggera funzione FaaS
class OrderService {
    async createOrder(orderData) {
        const order = await db.orders.create(orderData);
        
        // Trigger async processing via FaaS
        await awsLambda.invoke({
            FunctionName: 'process-payment',
            Payload: JSON.stringify({ orderId: order.id })
        }).promise();
        
        return order;
    }
}
```

### Serverless con Microservizi

```yaml
# Architettura ibrida
Architecture:
  Frontend: S3 + CloudFront (Static)
  API: API Gateway + Lambda (FaaS)
  Background Jobs: SQS + Lambda (FaaS) 
  Data Processing: ECS Fargate (Microservizi)
  Database: Aurora Serverless (Managed)
```

## Best Practices e Considerazioni

### Microservizi
```yaml
# Service Mesh per microservizi
istio:
  traffic-management: ✅
  security: ✅
  observability: ✅
  resilience: ✅
```

### FaaS
```javascript
// Optimizations
const optimizations = {
    keepWarm: 'ping functions periodically',
    bundleSize: 'minimize dependencies',
    connectionPooling: 'use external DB connections',
    asyncProcessing: 'offload heavy work'
};
```

### Serverless
```yaml
Monitoring:
  - AWS X-Ray: distributed tracing
  - CloudWatch: logs and metrics
  - Custom Metrics: business KPIs
  - Alerting: proactive notifications
```

## Tabella Decisionale Finale

| Criterio | Scegli Microservizi | Scegli FaaS | Scegli Serverless |
|----------|-------------------|-------------|-------------------|
| **Team Size** | > 10 developers | 1-5 developers | 1-10 developers |
| **Traffic Pattern** | Stabile/Predicibile | Sporadico/Variable | Imprevedibile |
| **Budget Model** | Capex (investimento) | Opex (operativo) | Opex (operativo) |
| **Time to Market** | 3-6+ mesi | 1-4 settimane | 1-2 settimane |
| **Technical Control** | Massimo | Medio | Minimo |
| **Operational Overhead** | Alto | Basso | Molto Basso |
| **Vendor Lock-in** | Basso | Medio | Alto |

## Conclusioni

- **Microservizi**: Per applicazioni complesse, team grandi, controllo completo
- **FaaS**: Per elaborazione event-driven, costi ottimizzati, rapid development  
- **Serverless**: Per applicazioni complete, massima astrazione, time-to-market critico

**Trend attuale**: Architetture ibride che combinano i vantaggi di tutti e tre gli approcci.