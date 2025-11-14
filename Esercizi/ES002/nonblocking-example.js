const axios = require('axios');

async function fetchData() {
    const response = await axios.get('https://jsonplaceholder.typicode.com/todos/1');
    return response.data;
}


async function handler(event, context) {
    const task1 = await fetchData();
    const task2 = await fetchData();
    const results = await(task1, task2);
    return { results: results};
}

module.exports = { handler };