const fs = require('fs');

exports.handler = async (event, context) => {

    context.callbackWaitsForEmptyEventLoop = true;

    console.log("1. Avvio Sincrono");

    setTimeout(() => {
        console.log("A. setTimeout (Fase Timer) - Asincrono");
    }, 5000);

    Promise.resolve().then(() => {
        console.log("B. Microtask (Fase Promise) - Asincrono");
    });

    fs.readFileSync(__filename, () => {
        console.log("C. Microtask (Fase I/O) - Asincrono");
    });

    console.log("2. End Sincrono");

    return "OK";

}