import { dedupExchange, Exchange, fetchExchange, gql, ssrExchange, stringifyVariables } from "urql";
import { LogoutMutation, MeQuery, MeDocument, LoginMutation, RegisterMutation, VoteMutation, VoteMutationVariables, DeletePostMutation, DeletePostMutationVariables } from "../generated/graphql";
import { updateQueryWrapper } from "./updateQueryWrapper";
import { cacheExchange, Resolver, Cache } from '@urql/exchange-graphcache'
import { filter, pipe, tap } from 'wonka';
import Router from 'next/router'
import { isServer } from "./isServer";

const errorExchange: Exchange = ({ forward }) => ops$ => {
    return pipe(
        forward(ops$),
        tap(({ error }) => {
            if (error?.message.includes('not authenticated')) {
                Router.replace('/login');
            }
        })
    );
};

const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    //console.log(`entityKey: ${entityKey} fieldName: ${fieldName}`);
    //entityKey = Query fieldName = posts
    const allFields = cache.inspectFields(entityKey);
    //console.log('allFields: ', allFields);
    //cache contains queries

    const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
    //filters out unnecessary queries

    const size = fieldInfos.length;

    if (size === 0) {
      return undefined;
    }
    
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    //console.log('field key we created: ', fieldKey);
    const isInCache = cache.resolve(
        cache.resolve(entityKey, fieldKey) as string,
        "posts"
    );
    //console.log('isInCache', isInCache)
    info.partial = !isInCache; //if info partial is true, then we will fetch more data
    let hasMore = true;
    const results: string[] = [];
    fieldInfos.forEach(fi => {
        const key = cache.resolve(entityKey, fi.fieldKey) as string;
        const data = cache.resolve(key, "posts") as string[];
        const hasMoreData = cache.resolve(key, "hasMore");
        if(!hasMoreData){
            hasMore = hasMoreData as boolean;
        }
        results.push(...data);
        //pushes the previos data and the current data
    })

    return {
        __typename: 'PaginatedPosts',
        hasMore,
        posts: results
    }
  };
};

const invalidatePosts = (cache: Cache) => {
    const allFields = cache.inspectFields('Query');
    //cache contains queries
    const fieldInfos = allFields.filter(info => info.fieldName === 'posts');
    //need to invalidate cache in order to 
    //get the most recent post to show up
    fieldInfos.forEach((fi) => {
        cache.invalidate('Query', 'posts', fi.arguments || {});
    })
}

export const createUrqlClient = (ssrExchange: any, ctx: any) => { 
    let cookie = ''
    if (isServer()) {
        cookie = ctx?.req?.headers?.cookie;
    }

    return ({ 
        url: 'http://localhost:4000/graphql',
        fetchOptions: {
            credentials: 'include' as const,
            headers: cookie
            ? {cookie} 
            : undefined
        }, 
        exchanges: [
            dedupExchange, 
            cacheExchange({
                keys: {
                    PaginatedPosts: () => null
                },
                resolvers: {
                    Query: {
                        posts: cursorPagination(),
                    }
                },
                updates: {
                    Mutation: {
                        deletePost: (_result, args, cache, info) => {
                            cache.invalidate({ 
                                __typename: 'Post', 
                                id: (args as DeletePostMutationVariables).id
                            })
                        },
                        vote: (_result, args, cache, info) => {
                            const {postId, value} = args as VoteMutationVariables;
                            const data = cache.readFragment(
                                gql`
                                    fragment _ on Post {
                                    id
                                    points
                                    voteStatus
                                    }
                                `,
                                { id: postId }
                            );
                            if(data) {
                                if(data.voteStatus === value) {
                                    return;
                                }

                                const newPoints = data.points + ((!data.voteStatus? 1 : 2) * value);
                                cache.writeFragment(
                                    gql`
                                    fragment __ on Post {
                                        points
                                        voteStatus
                                    }
                                    `,
                                    { id: postId, points: newPoints, voteStatus: value }
                                );
                            }
                        },
                        createPost: (_result, args, cache, info) => {
                            invalidatePosts(cache);
                        },
                        updatePost: (_result, args, cache, info) => {
                            const allFields = cache.inspectFields('Query');
                            //cache contains queries
                            const fieldInfos = allFields.filter(info => info.fieldName === 'posts');
                            //need to invalidate cache in order to 
                            //get the most recent post to show up
                            fieldInfos.forEach((fi) => {
                                cache.invalidate('Query', 'posts', fi.arguments || {});
                            })
                        },
                        logout: (_result, args, cache, info) => {
                            updateQueryWrapper<LogoutMutation, MeQuery>(
                            cache,
                            { query: MeDocument },
                            _result,
                            () => ({ me: null })
                            );
                        },
                        login: (_result, args, cache, info) => {
                            updateQueryWrapper<LoginMutation, MeQuery>(
                                cache, 
                                {query: MeDocument},
                                _result,
                                (result, query) => {
                                    if(result.login.errors) {
                                        return query;
                                    } else {
                                        return {
                                            me: result.login.user,
                                        };
                                    }
                                }
                            );
                            invalidatePosts(cache);
                        },
                        register: (_result, args, cache, info) => {
                            updateQueryWrapper<RegisterMutation, MeQuery>(
                            cache, 
                            {query: MeDocument},
                            _result,
                            (result, query) => {
                                if(result.register.errors) {
                                return query;
                                } else {
                                return {
                                    me: result.register.user,
                                };
                                }
                            }
                            );
                        },
                    },
                },
            }),
            errorExchange,
            ssrExchange, 
            fetchExchange
        ],  
    })
};