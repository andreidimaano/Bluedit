import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { ___prod__ } from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";

export default {
        migrations: {
            path: path.join(__dirname, './migrations'),
            pattern: /^[\w-]+\d+\.[tj]s$/,
        },
        entities: [Post, User],
        dbName: 'redditClone',
        type: 'postgresql',
        user: 'postgres',
        password: 'postgres',
        debug: !___prod__,
} as Parameters<typeof MikroORM.init>[0];


//cast as const in order to change types
// dbName is type 'redditClone;