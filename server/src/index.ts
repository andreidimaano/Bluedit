import { MikroORM } from '@mikro-orm/core'
import { ___prod__ } from './constants';
import { Post } from './entities/Post';
import mikroOrmConfig from './mikro-orm.config';
import microConfig from "./mikro-orm.config";
import express from 'express'

const main = async () => {
    const orm = await MikroORM.init(mikroOrmConfig);
    await orm.getMigrator().up();

    const app = express();
    app.get('/', (_, res) => {
        res.send("hello");
    })

    app.listen(4000, () => {
        console.log('server started on localhost:4000');
    })
}

main().catch(err => {
    console.log(err);
});