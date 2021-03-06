import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import { COOKIE_NAME, ___prod__ } from './constants';
import { Post } from './entities/Post';
import { User } from './entities/User';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import path from 'path'
import { Updoot } from './entities/Updoot';
import { createUserLoader } from './utils/createUserLoader';
import { createUpdootLoader } from './utils/createUpdootLoader';

//rerun
const main = async () => {
    const conn = await createConnection({
        type: 'postgres',
        database: 'lireddit2',
        username: 'postgres',
        password: 'postgres',
        logging: true,
        synchronize: true,
        migrations: [path.join(__dirname, './migrations/*')],
        entities: [Post, User, Updoot],
    })
    await conn.runMigrations();

    //await Post.delete({});

    const app = express();

    const RedisStore = connectRedis(session)
    const redis = new Redis();

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
                client: redis,
                disableTouch: true, 
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 364 * 10, //10 years
                httpOnly: true, //cannot access cookie in front end javascript
                sameSite: 'lax', //csrf
                secure: ___prod__, //cookie only works in https
            },
            secret:,
            resave: false,
        })
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({req, res}) => ({
            req,
            res, 
            redis, 
            userLoader: createUserLoader(), 
            updootLoader: createUpdootLoader(),
        })
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