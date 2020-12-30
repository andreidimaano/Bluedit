import { Updoot } from '../entities/Updoot';
import { MyContext } from 'src/types';
import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from 'type-graphql';
import { getConnection } from 'typeorm';
import { Post } from '../entities/Post';
import { isAuth } from '../middleware/isAuth';
import { User } from '../entities/User';

@InputType()
class PostInput {
    @Field()
    title: string
    @Field()
    text: string
}

@ObjectType()
class PaginatedPosts {
    @Field(() => [Post])
    posts: Post[]
    @Field()
    hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
    @FieldResolver(() => String)
    textSnippet(@Root() root: Post) {
        return root.text.slice(0, 700);
    }

    @FieldResolver(() => User)
    creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
        return userLoader.load(post.creatorId);
    }

    @FieldResolver(() => Int, {nullable: true})
    async voteStatus(@Root() post: Post, @Ctx() { updootLoader, req }: MyContext) {
        if(!req.session.userId) {
            return null;
        }
        
        const updoot = await updootLoader.load({
            postId: post.id, 
            userId: req.session.userId
        });

        return updoot ? updoot.value : null;
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg('postId', () => Int) postId: number,
        @Arg('value', () => Int) value: number,
        @Ctx() {req}: MyContext
    ) {
        const isUpdoot = value !== -1;
        const realValue = isUpdoot ? 1 : -1;
        const { userId } = req.session;
       
        const updoot = await Updoot.findOne({where: {postId, userId}})
        if(updoot && updoot.value !== realValue){
            //user has previously voted before
            await getConnection().transaction(async tm => {
                await tm.query(`        
                    update updoot
                    set value = $3
                    where "postId" = $2 and "userId" = $1
                `, [userId, postId, realValue]);

                await tm.query(`        
                    update post
                    set points = points + $2
                    where id = $1
                `, [postId, 2 * realValue]);
            })
        } else if(!updoot) {
            //has never voted
            await getConnection().transaction(async tm => {
                await tm.query(`        
                    insert into updoot("userId", "postId", value)
                    values ($1, $2, $3)
                `, [userId, postId, realValue]);

                await tm.query(`
                    update post
                    set points = points + $1
                    where id = $2
                `, [realValue, postId])
            })
        }

        return true;
    }

    @Query(() => PaginatedPosts)
    async posts(
        @Arg('limit', () => Int) limit: number,
        @Arg('cursor', () => String, { nullable: true}) cursor: string | null,
    ): Promise<PaginatedPosts>  {
        const realLimit = Math.min(50, limit); //will always cap at 50
        const morePostsLimit = realLimit + 1

        const replacements: any[] = [morePostsLimit];

        if(cursor) {
            replacements.push(new Date(parseInt(cursor)));
        }

        const posts = await getConnection().query(
            `
          select p.*
          from post p
          ${cursor ? `where p."createdAt" < $2` : ""}
          order by p."createdAt" DESC
          limit $1
          `,
            replacements
          );

        //console.log('posts: ', posts)

        return { 
            posts: posts.slice(0, realLimit), 
            hasMore: posts.length === morePostsLimit 
        };
    }

    //single post
    @Query(() => Post, {nullable: true})
    post(@Arg('id', () => Int) id: number): Promise<Post | undefined>  {
        return Post.findOne(id);
    }

    //create post
    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(@Arg('input') input: PostInput, @Ctx() {req}: MyContext): Promise<Post>  {
        return Post.create({
            ...input,
            creatorId: req.session.userId,
        }).save();
    }

    //Update post
    @Mutation(() => Post, {nullable: true})
    @UseMiddleware(isAuth)
    async updatePost(
        @Arg('id', () => Int) id: number,
        @Arg('title') title: string, //type inferred
        @Arg('text') text: string,
        @Ctx() {req}: MyContext
    ): Promise<Post | null>  {
        const result = await getConnection()
            .createQueryBuilder()
            .update(Post)
            .set({ title, text})
            .where('id = :id and "creatorId" = :creatorId', {
                id, 
                creatorId: req.session.userId
            })
            .returning('*')
            .execute();

        return result.raw[0];
    }

    //Delete post
    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deletePost(
        @Arg('id', () => Int) id: number, 
        @Ctx() {req}: MyContext
    ): Promise<Boolean>  {
        await Post.delete({id, creatorId: req.session.userId});
        return true;
    }

    @Mutation(() => Boolean)
    async deletePosts(): Promise<Boolean>  {
        await Post.delete({});
        return true;
    }
}