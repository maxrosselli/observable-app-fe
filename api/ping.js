const { app } = require('@azure/functions');

app.http('ping', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        return { 
            body: JSON.stringify({
                message: "Pong! Function is working",
                timestamp: new Date().toISOString()
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
});