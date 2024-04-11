import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { prismaClient } from './lib/db';

async function startApolloServer() {   
    const PORT = Number(process.env.PORT) || 8000;
    const app = express();

    app.use(express.json());

    //typeDefs are the schema of the GraphQL API
    //resolvers are the functions that are called when a query is made
    const graphqlServer = new ApolloServer({
        typeDefs: `
            type Query {
                hello: String
            }
            type Mutation {
                createUser(firstName: String!, lastName: String!, email:String!, password:String!): Boolean
            }
        `,
        resolvers: {
            Query: {
                hello: () => 'Hello , I am a GraphQL Server!'
            },
            Mutation: {
                createUser: 
                    async (_, 
                        { 
                            firstName, 
                            lastName, 
                            email, 
                            password 
                        }:{ 
                            firstName: string; 
                            lastName: string; 
                            email:string; 
                            password:string
                        }) => {
                    console.log(firstName, lastName, email, password);
                    await prismaClient.user.create({
                        data:{
                            firstName,
                            lastName,
                            email,
                            password,
                            salt: process.env.RANDOM_SALT!,
                        }
                    })
                    return true;
                }
            },  
        },
    });

    await graphqlServer.start();

    app.get('/', (req, res) => {
      res.send('Hello from GraphQL Server');
    });

    app.use('/graphql', expressMiddleware(graphqlServer));

    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
}

startApolloServer();