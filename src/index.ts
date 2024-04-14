import express from 'express';
import { expressMiddleware } from '@apollo/server/express4';
import createApolloServer from './graphql';

async function startApolloServer() {   
    const PORT = Number(process.env.PORT) || 8000;
    const app = express();

    app.use(express.json());

    //typeDefs are the schema of the GraphQL API
    //resolvers are the functions that are called when a query is made
    

    app.get('/', (req, res) => {
      res.send('Hello from GraphQL Server');
    });

    const gqlServer = await createApolloServer();

    app.use('/graphql', expressMiddleware(gqlServer));

    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
}

startApolloServer();