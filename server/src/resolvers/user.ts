import { User } from '../entities/User';
import { MyContext } from 'src/types';
import { Resolver, Mutation, Arg, InputType, Field, Ctx, ObjectType, Query } from 'type-graphql';
import argon2 from 'argon2'
import {EntityManager} from '@mikro-orm/postgresql'
import { COOKIE_NAME } from '../constants';

declare module "express-session" {
    interface Session {
      userId: number;
    }
}

@InputType()
class UsernamePasswordInput {
    @Field()
    username: string
    @Field()
    email: string
    @Field()
    password: string
}

@ObjectType()
class FieldError {
    @Field()
    field: string;
    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[];

    @Field(() => User, {nullable: true})
    user?: User;
}

//create a user
@Resolver()
export class UserResolver {
    @Mutation(() => Boolean)
    async forgotPassword(@Arg('email') email: string, @Ctx() {em}: MyContext) {
        //const user = await em.findOne(User, { email });
        return true;
    }

    @Query(() => [User])
    users(@Ctx() { em }: MyContext) {
        return em.find(User, {})
    }
    

    @Query(() => User, {nullable: true})
    async me (
        @Ctx() { req, em }: MyContext
    ) {
        if(!req.session.userId){
            return null;
        }

        return await em.findOne(User, {id: req.session.userId})
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() {em, req} : MyContext
    ): Promise<UserResponse> {
        if(options.username.length <= 2) {
            return {
                errors: [{
                    field: 'username',
                    message: 'invalid username',
                }],
            };
        }

        if(options.password.length <= 2) {
            return {
                errors: [{
                    field: 'password',
                    message: 'invalid password',
                }],
            };
        }

        const hashedPassword = await argon2.hash(options.password);
        let user;
        try {
            const result = await (em as EntityManager)
                .createQueryBuilder(User)
                .getKnexQuery()
                .insert({
                    username: options.username,
                    email: options.email,
                    password: hashedPassword,
                    created_at: new Date(),
                    updated_at: new Date(),
                })
                .returning('*');
                user = result[0];
        } catch (err) {
            if(err.detail.includes('already exists')) {
                return {
                    errors: [
                        {
                            field: 'username',
                            message: 'username already exists',
                        },
                    ],
                };
            }
        }

        //store user id session
        //set a cookie on the user
        //keeps them logged in
        req.session.userId = user.id;

        return { user }
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() {em, req } : MyContext
    ) : Promise<UserResponse> {
        const user = await em.findOne(User, {username: options.username});
        if(!user) {
            return {
                errors: [
                    {
                        field: "username",
                        message: "username does not exist",
                    }
                ],
            };
        }
        const valid = await argon2.verify(user.password, options.password);
        if(!valid){
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'password incorrect',
                    },
                ],
            };
        }

        req.session!.userId = user.id;

        return { user,};
    }

    @Mutation (() => Boolean)
    logout(@Ctx() {req, res}: MyContext) {

        return new Promise(resolve => req.session.destroy(err => {
            res.clearCookie(COOKIE_NAME);
            if (err) {
                console.log(err);
                resolve(false);
                return;
            }

            resolve(true);
        }))
    }
}