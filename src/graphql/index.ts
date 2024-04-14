import { ApolloServer } from '@apollo/server';
import {User} from './user'
import { prismaClient } from '../lib/db';

export default async function createApolloServer(){
    const graphqlServer = new ApolloServer({
        typeDefs: `
            type Query {
                hello:String
            }
            type Mutation {
                ${User.mutations}
            }
        `, //Schema
        resolvers: {
            Query: {
                ...User.resolvers.queries
            },
            Mutation: {
                ...User.resolvers.mutations
            },  
        },
    });

    await graphqlServer.start();

    return graphqlServer;
}

