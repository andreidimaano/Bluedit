import { dedupExchange, Exchange, fetchExchange, ssrExchange, stringifyVariables } from "urql";
import { LogoutMutation, MeQuery, MeDocument, LoginMutation, RegisterMutation } from "../generated/graphql";
import { updateQueryWrapper } from "./updateQueryWrapper";
import { cacheExchange, Resolver } from '@urql/exchange-graphcache'
import { filter, pipe, tap } from 'wonka';
import Router from 'next/router'

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
    

    // const visited = new Set();
    // let result: NullArray<string> = [];
    // let prevOffset: number | null = null;

    // for (let i = 0; i < size; i++) {
    //   const { fieldKey, arguments: args } = fieldInfos[i];
    //   if (args === null || !compareArgs(fieldArgs, args)) {
    //     continue;
    //   }

    //   const links = cache.resolve(entityKey, fieldKey) as string[];
    //   const currentOffset = args[cursorArgument];

    //   if (
    //     links === null ||
    //     links.length === 0 ||
    //     typeof currentOffset !== 'number'
    //   ) {
    //     continue;
    //   }

    //   const tempResult: NullArray<string> = [];

    //   for (let j = 0; j < links.length; j++) {
    //     const link = links[j];
    //     if (visited.has(link)) continue;
    //     tempResult.push(link);
    //     visited.add(link);
    //   }

    //   if (
    //     (!prevOffset || currentOffset > prevOffset) ===
    //     (mergeMode === 'after')
    //   ) {
    //     result = [...result, ...tempResult];
    //   } else {
    //     result = [...tempResult, ...result];
    //   }

    //   prevOffset = currentOffset;
    // }

    // const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
    // if (hasCurrentPage) {
    //   return result;
    // } else if (!(info as any).store.schema) {
    //   return undefined;
    // } else {
    //   info.partial = true;
    //   return result;
    // }
  };
};

export const createUrqlClient = (ssrExchange: any) => ({ 
    url: 'http://localhost:4000/graphql',
    fetchOptions: {
      credentials: 'include' as const,
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
});