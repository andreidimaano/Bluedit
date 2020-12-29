import { isAuth } from '../middleware/isAuth';
import { MyContext } from 'src/types';
import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from 'type-graphql';
import { Post } from '../entities/Post';
import { getConnection } from 'typeorm';
import { Updoot } from '../entities/Updoot';

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
        
        await getConnection().query(
            `
        START TRANSACTION;

        insert into updoot("userId", "postId", value)
        values (${userId},${postId},${realValue});

        update post
        set points = points + ${realValue}
        where id = ${postId};

        COMMIT;
        `);

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

        const posts = await getConnection().query(`
        select p.*, 
        json_build_object(
            'id', u.id,
            'username', u.username,
            'email', u.email
            ) creator
        from post p
        inner join public.user u on u.id = p."creatorId"
        ${cursor ? `where p."createdAt" < $2` : ''}
        order by p."createdAt" DESC
        limit $1
        `, replacements);

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