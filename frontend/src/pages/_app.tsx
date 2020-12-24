import { ChakraProvider, ColorModeProvider } from '@chakra-ui/react'
import {Provider, createClient, dedupExchange, fetchExchange} from 'urql'
import { cacheExchange, Cache, QueryInput } from '@urql/exchange-graphcache'
import theme from '../theme'
import { LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation } from '../generated/graphql';

function updateQueryWrapper<Result, Query>(
  cache: Cache, 
  qi: QueryInput, 
  result: any, 
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(qi, data => fn(result, data as any) as any);
}

const client = createClient({ 
  url: 'http://localhost:4000/graphql',
  fetchOptions: {
    credentials: 'include',
  }, 
  exchanges: [dedupExchange, cacheExchange({
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
  }), fetchExchange],
});


function MyApp({ Component, pageProps }: any) {
  return (
    <Provider value={client}>
      <ChakraProvider resetCSS theme={theme}>
          <Component {...pageProps} />
      </ChakraProvider>
    </Provider>

  )
}

export default MyApp
