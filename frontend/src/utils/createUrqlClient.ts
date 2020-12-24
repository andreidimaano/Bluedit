import { dedupExchange, fetchExchange, ssrExchange } from "urql";
import { LogoutMutation, MeQuery, MeDocument, LoginMutation, RegisterMutation } from "../generated/graphql";
import { updateQueryWrapper } from "./updateQueryWrapper";
import { cacheExchange } from '@urql/exchange-graphcache'

export const createUrqlClient = (ssrExchange: any) => ({ 
    url: 'http://localhost:4000/graphql',
    fetchOptions: {
      credentials: 'include' as const,
    }, 
    exchanges: [
        dedupExchange, 
        cacheExchange({
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
        ssrExchange, 
        fetchExchange
    ],
});