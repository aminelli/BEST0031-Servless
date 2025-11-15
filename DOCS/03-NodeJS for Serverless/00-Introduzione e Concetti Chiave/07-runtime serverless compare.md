# Runtime serverless a confronto

Di seguito viene mostrata una **tabella comparativa** tra i principali **runtime serverless**:

- **Node.js**
- **Python**
- **Go**
- **Java**

con focus su **prestazioni, ecosistema, e casi d’uso ideali**.

---

## ⚙️ Confronto dei runtime serverless

| **Caratteristica**              | **Node.js (JavaScript/TypeScript)**                              | **Python**                                           | **Go**                                            | **Java**                                             |
| ------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------- |
| 🕒 **Cold start**               | 🔹 **Molto rapido** (decine di ms) grazie al runtime leggero V8  | 🔸 Rapido ma leggermente più lento di Node           | 🔹 **Estremamente rapido**, compilato nativamente | 🔻 **Più lento**, JVM deve avviarsi                  |
| ⚡ **Prestazioni runtime**       | Ottime per I/O e API, meno per CPU-bound                         | Buone per script, meno per alta concorrenza          | **Eccellenti**, adatto anche a CPU-intensive      | Buone, ma richiedono più memoria                     |
| 🧵 **Gestione concorrenza**     | Event loop non-bloccante (async/await)                           | Limitata (GIL, threading costoso)                    | **Goroutines** super efficienti                   | Thread nativi (più costosi)                          |
| 📦 **Ecosistema librerie**      | **Enorme** (npm, +2M pacchetti)                                  | Molto ampio (PyPI)                                   | In crescita ma più ristretto                      | Maturo ma più “enterprise”                           |
| 🧠 **Curva di apprendimento**   | Facile (JavaScript universale)                                   | Molto accessibile                                    | Media (Go è minimalista ma diverso)               | Più ripida (verbose, OOP pesante)                    |
| 🧰 **Tooling e build**          | Ottimi tool (esbuild, tsup, Serverless Framework)                | Ottimi per scripting, meno per build complesse       | Build velocissime (binario unico)                 | Build lente (Gradle/Maven)                           |
| 🧱 **Type safety / Robustezza** | Con **TypeScript** → forte tipizzazione e manutenzione scalabile | Tipizzazione dinamica, meno adatta a grandi progetti | Tipizzazione forte ma semplice                    | Tipizzazione rigorosa, adatta a sistemi enterprise   |
| ☁️ **Supporto cloud-native**    | **Top** (AWS, Azure, GCP, Cloudflare, Vercel)                    | **Top** (soprattutto AWS e GCP)                      | Buono, ma meno tool out-of-the-box                | Buono ma con overhead JVM                            |
| 🔄 **Time-to-market**           | **Rapidissimo**, ottimo per MVP e API leggere                    | Molto veloce per prototipi e automazioni             | Rapido per microservizi stabili                   | Lento, ma stabile per progetti a lungo termine       |
| 💾 **Consumo memoria**          | Basso                                                            | Basso                                                | Molto basso                                       | Alto (JVM)                                           |
| 🧩 **Casi d’uso ideali**        | API REST/GraphQL, webhook, integrazioni, ETL leggeri, chatbot    | ETL, ML inferencing, automazioni, scripting          | Microservizi performanti, API low-latency         | Servizi enterprise, processi transazionali complessi |
| 🔍 **Manutenibilità**           | Alta (con TypeScript)                                            | Media (dinamico)                                     | Alta (struttura semplice)                         | Alta ma con più boilerplate                          |

---

## 💡 In sintesi

| **Scenario**                               | **Runtime consigliato**     | **Motivazione**                                            |
| ------------------------------------------ | --------------------------- | ---------------------------------------------------------- |
| API e backend leggeri                      | 🟢 **Node.js (TypeScript)** | Avvio rapido, ecosistema enorme, tipizzazione opzionale    |
| Workflow di automazione e ML light         | 🟢 **Python**               | Ecosistema data/AI e script veloci                         |
| Microservizi performanti e scalabili       | 🟢 **Go**                   | Basso overhead, compilazione nativa                        |
| Sistemi enterprise, integrazioni complesse | 🟢 **Java**                 | Robustezza, ecosistema enterprise, integrazione con Spring |

---

## **Tempi medi di cold start e invocazione** (ms) in **AWS Lambda**, basata su test reali (Node.js vs Python vs Go vs Java)

Di seguito una tabella con **stime indicative** di tempi medi di cold start e warm start per funzioni AWS Lambda, suddivise per runtime. Le cifre possono variare molto in base a memoria, package size, VPC, versione runtime, ecc., ma danno un buon ordine di grandezza.

| Runtime | Cold-start medio stimato                                                                                    | Warm-start medio stimato                                                                           |
| ------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Node.js | ~ **140 ms** (es. 512 MB) ([UCL Discovery][1])                                                              | pochi decine di ms (es. ~5-10ms) ([bytegoblin.io][2])                                              |
| Python  | ~ **228 ms** (es. 512 MB) ([chenzhenpeng18.github.io][3])                                                   | simile a Node o leggermente più veloce in alcuni test ([SciTePress][4])                            |
| Go      | può scendere sotto i ~ 50-100 ms nei test favorevoli ([scanner.dev][5])                                     | molto basso (alcuni test indicano <20ms) ([SciTePress][4])                                         |
| Java    | può essere ~ **300-400ms** o anche oltre 1 s in certe condizioni, senza ottimizzazioni ([UCL Discovery][1]) | dopo “warm” la differenza si riduce molto, tempi simili agli altri in molti casi ([UW Faculty][6]) |

### 🔍 Qualche precisazione importante

* Queste cifre **non sono garanzia**, ma solo stime basate su benchmark e studi.
* Molti fattori influenzano i tempi: memoria assegnata, dimensione del pacchetto, se la funzione è in VPC, runtime specifico, uso di immagini container, ecc. ([MoldStud][7])
* Per Java, molte delle migliorie recenti (es. AWS Lambda SnapStart) riducono i tempi di cold start in modo significativo. ([scanner.dev][5])
* Warm-start significa che l’ambiente è già “vivo” (la funzione è stata invocata di recente e non è stato necessario un nuovo provisioning completo).
