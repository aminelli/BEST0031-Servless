// BEST PRACTICES

// ==============================
// COLD START (INIT PHASE)
// ==============================

console.log("INIT");

let cacheDbConnection = null;

async function connectDb() {
    if (!cacheDbConnection) {
        console.log("Creazione nuova connessione DB");
        cacheDbConnection = {
            connected: true,
            connectedAt: new Date().toISOString()
        };
    }
    return cacheDbConnection;
}

// ==============================
// HANDLER
// ==============================
exports.warmExample = async(event, context) => {
    console.log("Fase Warm", db);

    const db = await connectDb();
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Hello, world!"
        })
    }
}
