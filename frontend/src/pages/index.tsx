import { Box, Button, Flex, Heading, Link, Stack, Text } from "@chakra-ui/react"
import { withUrqlClient } from "next-urql"
import NextLink from 'next/link'
import React from "react"
import { Layout } from "../components/Layout"
import { usePostsQuery } from "../generated/graphql"
import { createUrqlClient } from "../utils/createUrqlClient"

const Index = () => {
    const [{ data, fetching }] = usePostsQuery({
        variables: {
            limit: 10,
        }
    });

    if(!fetching && !data) {
        return <div>failed to get data</div>;
    }

    return (
        <Layout>
            <Flex>
                <Box bg="#D7DFE2" p={5} w="100%" shadow="md" borderWidth="1px">
                    <NextLink href="/create-post">
                        <Link>
                            create post
                        </Link>
                    </NextLink>
                </Box>
            </Flex>
            <br/>
            {!data && fetching ? (
            <div>loading...</div> 
            ) : (
                <Stack spacing={4}>
                    {data!.posts.map((p) => (
                        <Box key={p.id} p={5} shadow="md" borderWidth="1px">
                            <Heading fontSize='xl'>{p.title}</Heading>
                            <Text mt={4}>{p.textSnippet}</Text>
                        </Box>
                    ))}
                </Stack>
            )}
            {data ? (
            <Flex>
                <Button isLoading={fetching} m="auto" my={8}>load more</Button>
            </Flex>
            ) : null}
        </Layout>
    )
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Index);
