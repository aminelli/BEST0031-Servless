# **Serverless** vs **Microservizi**

La relazione tra **Serverless** e **Microservizi** è un punto chiave nella modernizzazione delle architetture software.

In realtà, non sono alternative dirette, ma piuttosto **concetti complementari** che si posizionano su diversi livelli di astrazione:

* **Microservizi** è uno **stile architetturale** (un modo di *progettare* il software).
* **Serverless** è un **modello operativo** (un modo di *eseguire* il software).

È molto comune implementare un'architettura a Microservizi utilizzando tecnologie Serverless.

---

## 1. Architettura a Microservizi

I Microservizi sono uno stile architetturale in cui una singola applicazione complessa viene suddivisa in una **collezione di servizi più piccoli, indipendenti e accoppiati in modo lasco**.

### Caratteristiche Chiave:

* **Indipendenza:** Ogni microservizio è sviluppato, distribuito e scalato in modo indipendente.
* **Comunicazione:** I servizi comunicano tra loro tramite API leggere (solitamente HTTP/REST o messaggistica asincrona).
* **Tecnologia Eterogenea:** I diversi servizi possono essere scritti in linguaggi di programmazione diversi e utilizzare stack tecnologici diversi.
* **Responsabilità:** Ogni servizio si concentra su un'unica capacità di business (es. gestione utenti, ordini, pagamenti).

### Infrastruttura Tipica dei Microservizi:

I Microservizi tradizionali sono spesso eseguiti su:
1.  **Container** (es. Docker) gestiti da un orchestratore (es. Kubernetes/EKS/GKE/AKS).
2.  **Macchine Virtuali** (VM) o server dedicati.

---

## 2. Serverless come Modello Operativo

Come discusso in precedenza, **Serverless** è un modello di cloud computing in cui il provider gestisce l'infrastruttura, consentendo agli sviluppatori di implementare la logica di business senza gestire i server.

### Relazione tra i Due

Il modello Serverless (in particolare FaaS) è un modo **particolarmente efficace e granulare** per **implementare un'architettura a Microservizi**.

Se un microservizio è un piccolo servizio indipendente, una funzione Serverless (FaaS) è un'implementazione estremamente "piccola" e "indipendente" di quel servizio.

* **Microservizio Tradizionale:** Un singolo servizio Docker che gestisce tutti gli endpoint per gli ordini.
* **Microservizio Serverless (FaaS):** Una singola funzione AWS Lambda che gestisce l'endpoint `POST /ordini` e un'altra funzione che gestisce l'endpoint `GET /ordini/{id}`.

---

## 📝 Tabella Comparativa di Dettaglio

| Caratteristica | 🏗️ **Architettura a Microservizi** (Tradizionale su Container) | 🚀 **Architettura Serverless** (Utilizzando FaaS/CaaS) |
| :--- | :--- | :--- |
| **Definizione** | Stile architetturale: suddividi l'applicazione in servizi indipendenti. | Modello operativo: esegui il codice senza gestire l'infrastruttura. |
| **Unità di Deployment** | Container Docker completo (con runtime, dipendenze, server web). | Funzione FaaS (solo codice) o Container Serverless (CaaS). |
| **Gestione Scalabilità** | **Manuale o Automatica** tramite orchestratori (Kubernetes). Richiede configurazione e monitoraggio. | **Completamente Automatica** dal provider cloud (scalabile fino a zero). |
| **Costi Operativi** | **Costo Fisso/Variabile:** Paghi per i cluster (Kubernetes) o le VM, che sono attive H24. | **Costo Variabile/Pay-per-Use:** Paghi solo per l'esecuzione del codice (richieste + durata). |
| **Overhead Operativo** | **Alto:** Gestione di VM, container, networking, cluster, patching del SO. | **Basso:** Quasi zero gestione dell'infrastruttura sottostante. |
| **Cold Start** | **Non è un problema:** I container sono generalmente *sempre caldi* o si avviano rapidamente. | **Problema significativo:** Latenza all'avvio dell'ambiente per la prima invocazione. |
| **Tempo di Esecuzione** | **Illimitato:** Un container può rimanere attivo indefinitamente. | **Limitato:** Timeout imposto dal provider (max 15 minuti su Lambda). |
| **Complessità** | **Iniziale:** Alta complessità di configurazione del cluster e CI/CD. | **Iniziale:** Semplice. **Successiva:** Può diventare complesso nel debugging distribuito. |

### Quando Scegliere Cosa?

| Scelta | Motivazione |
| :--- | :--- |
| **Microservizi su Container (Tradizionali)** | * Hai bisogno di controllo granulare sull'ambiente runtime. * Devi eseguire compiti a **lunga esecuzione** (es. 1 ora) che superano il timeout FaaS. * L'applicazione è sensibile a qualsiasi latenza (il Cold Start è inaccettabile). * Hai bisogno di una portabilità multi-cloud estrema (Kubernetes/Docker è standard ovunque). |
| **Serverless (FaaS o CaaS)** | * Vuoi minimizzare i costi operativi e pagare solo per il consumo. * Vuoi demandare la gestione della scalabilità al cloud provider. * Stai sviluppando un'applicazione **event-driven** con risposte rapide. * I tuoi compiti di elaborazione sono **brevi e non intensivi** (API, webhook, trasformazioni dati). |