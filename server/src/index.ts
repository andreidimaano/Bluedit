import { MikroORM } from '@mikro-orm/core'
import { ___prod__ } from './constants';
import { Post } from './entities/Post';

const main = async () => {
    const orm = await MikroORM.init({
        entities: [Post],
        dbName: 'redditClone',
        user: 'postgres',
        password: 'postgres',
        debug: !___prod__,
    })

    const post = orm.em.create(Post, {title: 'my first post'});
    await orm.em.persistAndFlush(post);

}

main().catch(err => {
    console.log(err);
});