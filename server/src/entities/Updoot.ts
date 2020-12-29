import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

//many to many relationship
// user <-> posts
// user -> join table <- posts
// user -> updoor <- posts

@Entity()
export class Updoot extends BaseEntity{
    @Column({ type: 'int'})
    value: number;

    @PrimaryColumn()
    userId: number;

    @ManyToOne(() => User, user => user.updoots)
    user: User;

    @PrimaryColumn()
    postId: number;

    @ManyToOne(() => Post, (post) => post.updoots)
    post: Post;

}