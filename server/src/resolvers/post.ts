import { Resolver, Query, Ctx, Arg, Int, Mutation } from 'type-graphql';
import { Post } from '../entities/Post';
import { MyContext } from '../types'

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    async posts( @Ctx() {em}: MyContext): Promise<Post[]>  {
        // await sleep(3000)
        return em.find(Post, {});
    }

    //single post
    @Query(() => Post, {nullable: true})
    post(
        @Arg('id', () => Int) id: number,
        @Ctx() {em}: MyContext
    ): Promise<Post | null>  {
        return em.findOne(Post, {id});
    }

    //create post
    @Mutation(() => Post)
    async createPost(
        @Arg('title') title: string, //type inferred
        @Ctx() {em}: MyContext
    ): Promise<Post>  {
        const post = em.create(Post, {title});
        await em.persistAndFlush(post);
        return post;
    }

    //Update post
    @Mutation(() => Post, {nullable: true})
    async updatePost(
        @Arg('id', () => Int) id: number,
        @Arg('title', () => String, {nullable: true}) title: string, //type inferred
        @Ctx() {em}: MyContext
    ): Promise<Post | null>  {
        const post = await em.findOne(Post, {id});
        if(!post) {
            return null;
        }
        if (typeof title !== 'undefined') {
            post.title = title;
            await em.persistAndFlush(post);
        }
        return post;
    }

    //Delete post
    @Mutation(() => Boolean)
    async deletePost(
        @Arg('id', () => Int) id: number,
        @Ctx() {em}: MyContext
    ): Promise<Boolean>  {
        await em.nativeDelete(Post, {id});
        return true;
    }

    @Mutation(() => Boolean)
    async deletePosts(
        @Ctx() {em}: MyContext
    ): Promise<Boolean>  {
        await em.nativeDelete(Post, {});
        return true;
    }
}