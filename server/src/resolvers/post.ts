import { isAuth } from '../middleware/isAuth';
import { MyContext } from 'src/types';
import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from 'type-graphql';
import { Post } from '../entities/Post';
import { getConnection } from 'typeorm';

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
        return root.text.slice(0, 300);
    }

    @Query(() => PaginatedPosts)
    async posts(
        @Arg('limit', () => Int) limit: number,
        @Arg('cursor', () => String, { nullable: true}) cursor: string | null
    ): Promise<PaginatedPosts>  {
        const realLimit = Math.min(50, limit); //will always cap at 50
        const morePostsLimit = realLimit + 1
        const qb =  getConnection()
            .getRepository(Post)
            .createQueryBuilder('p')
            .orderBy('"createdAt"', 'DESC') //most recent at the top
            .take(morePostsLimit);
        
        if(cursor) {
            qb.where('"createdAt" < :cursor' , { 
                cursor: new Date(parseInt(cursor)) 
            });
        }

        const posts = await qb.getMany();

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
    async updatePost(
        @Arg('id', () => Int) id: number,
        @Arg('title', () => String, {nullable: true}) title: string, //type inferred
    ): Promise<Post | null>  {
        //1 sql query to fetch
        const post = await Post.findOne(id);
        if(!post) {
            return null;
        }
        //1 sql to update
        if (typeof title !== 'undefined') {
            await Post.update({id}, {title});
        }
        return post;
    }

    //Delete post
    @Mutation(() => Boolean)
    async deletePost(@Arg('id', () => Int) id: number): Promise<Boolean>  {
        await Post.delete(id);
        return true;
    }

    @Mutation(() => Boolean)
    async deletePosts(): Promise<Boolean>  {
        await Post.delete({});
        return true;
    }
}