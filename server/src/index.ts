import { MikroORM } from '@mikro-orm/core';
import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import redis from 'redis';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { COOKIE_NAME, ___prod__ } from './constants';
import mikroOrmConfig from './mikro-orm.config';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import { sendEmail } from './utils/sendEmail';

const main = async () => {
    sendEmail('bob@bob.com', 'hello there');
    const orm = await MikroORM.init(mikroOrmConfig);
    await orm.getMigrator().up();

    const app = express();

    const RedisStore = connectRedis(session)
    let redisClient = redis.createClient()

    app.use(
        cors({
            origin: 'http://localhost:3000',
            credentials: true,
        })
    );

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({ 
                client: redisClient,
                disableTouch: true, 
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 364 * 10, //10 years
                httpOnly: true, //cannot access cookie in front end javascript
                sameSite: 'lax', //csrf
                secure: ___prod__, //cookie only works in https
            },
            secret: 'pooopywoopy',
            resave: false,
        })
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({req, res}) => ({ em: orm.em, req, res })
    });

    apolloServer.applyMiddleware({
        app,
        cors: false, 
    });

    app.listen(4000, () => {
        console.log('server started on localhost:4000');
    })
}

main().catch(err => {
    console.log(err);
});