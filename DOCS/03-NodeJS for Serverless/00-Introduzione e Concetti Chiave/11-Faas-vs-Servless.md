# **FaaS** vs **Serverless**

La distinzione tra **FaaS** (Function-as-a-Service) e **Serverless** è fondamentale per comprendere appieno le architetture cloud moderne. Non sono termini interscambiabili: **FaaS è un sottoinsieme** della categoria più ampia e onnicomprensiva di **Serverless**.

In sintesi: **Serverless è l'obiettivo** (non gestire server), mentre **FaaS è una delle tecnologie principali** utilizzate per raggiungere quell'obiettivo.

---

## 💡 Serverless: Il Concetto e l'Obiettivo

**Serverless** descrive un modello di cloud computing in cui il provider gestisce completamente l'infrastruttura sottostante, permettendo agli sviluppatori di concentrarsi solo sul codice applicativo.

Il termine non significa che "non ci sono server," ma piuttosto che **gli sviluppatori non devono MAI vederli, gestirli, scalarli o effettuarne il provisioning**.

### Caratteristiche Chiave del Modello Serverless:

* **Nessuna Gestione dell'Infrastruttura:** Il provider gestisce sistemi operativi, macchine virtuali, scaling e patching.
* **Scalabilità Automatica:** Le risorse vengono scalate istantaneamente in risposta alla domanda (anche fino a zero).
* **Modello di Fatturazione:** Pagamento basato sul **consumo effettivo** (Pay-per-Use, spesso misurato in GB-secondi o richieste).
* **Natura Event-Driven:** I componenti sono attivati da eventi (richieste HTTP, modifiche a database, caricamenti di file, ecc.).

---

## 💻 FaaS (Function-as-a-Service): La Tecnologia

**FaaS** è una categoria specifica di servizi che consente di eseguire **singole funzioni** o porzioni di codice come risposta a un evento, senza doversi preoccupare dell'ambiente in cui il codice viene eseguito.

È la **forma più pura** di Serverless e il pioniere di questo modello.

### Caratteristiche Chiave del Modello FaaS:

* **Unità di Deployment:** Il codice viene distribuito in **funzioni isolate** (microservizi estremamente granulari).
* **Vita Breve e Stateless:** Le funzioni sono progettate per essere eseguite rapidamente e non mantengono lo stato tra le diverse invocazioni (sono *stateless*).
* **Tempo di Esecuzione Limitato:** I provider impongono limiti di tempo (timeout) per le funzioni (tipicamente 1-15 minuti, a seconda del provider).
* **Trigger:** Vengono attivate da un'ampia varietà di eventi (API Gateway, code di messaggi, modifiche a database, timer).

### Esempi di Servizi FaaS:

* **AWS Lambda**
* **Google Cloud Functions (GCF)**
* **Azure Functions**

---

## 🤝 Altri Componenti Serverless (Oltre FaaS)

Il Serverless non è solo FaaS. Un'architettura Serverless completa integra molti altri servizi che eliminano la gestione del server, ricadendo tutti nella categoria "Serverless":

| Categoria | Descrizione | Esempi Principali |
| :--- | :--- | :--- |
| **BaaS (Backend-as-a-Service)** | Servizi esterni per lo sviluppo (autenticazione, database real-time, hosting). | **AWS Cognito, Google Firebase, Auth0** |
| **Database Serverless** | Database che scalano automaticamente e vengono fatturati per il consumo. | **Amazon DynamoDB, Aurora Serverless, Google Firestore, Azure Cosmos DB** |
| **Container Serverless** | Esecuzione di container Docker senza gestione dell'infrastruttura EC2/VM. | **Google Cloud Run, AWS Fargate, Azure Container Apps** |
| **API Gateway Serverless** | Gestione delle API, routing, autenticazione, limitazione della velocità. | **Amazon API Gateway, Azure API Management, Google Cloud API Gateway** |
| **Orchestratori Serverless** | Gestione di flussi di lavoro complessi e step-by-step. | **AWS Step Functions, Google Cloud Workflows** |

---

## 📝 Tabella Comparativa di Dettaglio

| Differenza | Serverless | FaaS (Function-as-a-Service) |
| :--- | :--- | :--- |
| **Natura** | Un **modello operativo** e un'**architettura** di calcolo cloud. | Una **tecnologia** specifica all'interno del modello Serverless. |
| **Ambito** | Include FaaS, BaaS, Database Serverless, Container Serverless, ecc. | Riguarda solo l'esecuzione di **singole funzioni** di codice. |
| **Unità di Deployment** | Applicazioni complete e servizi backend. | Piccole, singole funzioni o *handler* di codice. |
| **Gestione dello Stato** | Può essere **stateful** (es. Database Serverless) o **stateless** (API Gateway). | Deve essere **stateless** (lo stato è gestito esternamente). |
| **Scopo Finale** | Eliminare il *server management* dall'intero stack applicativo. | Eseguire il codice in modo efficiente e basato sugli eventi. |

**In sintesi:** **FaaS è l'attivatore** del modello Serverless; è la sua implementazione più comune. Quando si parla di *Serverless*, si fa riferimento all'intera architettura che include FaaS e tutti gli altri servizi cloud senza gestione dell'infrastruttura.