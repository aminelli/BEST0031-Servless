exports.handler = (event) => {
    const name = event.queryStringParameters.name || 'World';
    return {
        statusCode: 200,
        Headers: {
            'Content-Type': 'application/json',
        },
        body: `Hello ${name}!`,
    } 

};