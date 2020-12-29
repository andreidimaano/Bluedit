import { ArrowUpIcon, ArrowDownIcon, TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons"
import { Box, Button, Flex, Heading, Icon, IconButton, Link, Stack, Text } from "@chakra-ui/react"
import { withUrqlClient } from "next-urql"
import NextLink from 'next/link'
import React, { useState } from "react"
import { Layout } from "../components/Layout"
import { UpdootSection } from "../components/UpdootSection"
import { usePostsQuery } from "../generated/graphql"
import { createUrqlClient } from "../utils/createUrqlClient"

const Index = () => {
    const [variables, setVariables] = useState({limit: 15, cursor: null as null | string});
    const [{ data, fetching }] = usePostsQuery({
        variables,
    });

    if(!fetching && !data) {
        return <div>failed to get data</div>;
    }

    return (
        <Layout>
            <Flex justify="center" align="center">
                <Box bg="#D7DFE2" p={5} maxW="xl" w="100%" shadow="md" borderWidth="1px">
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
                <Flex justify="center">
                    <Stack justify="center" spacing={4}>
                    {data!.posts.posts.map((p) => (
                        <Flex maxW="xl" key={p.id} px={5} py={2} shadow="md" borderWidth="1px">
                            <UpdootSection post={p}/>
                            <Box>
                                <Text>Post by {p.creator.username}</Text>
                                <Heading fontSize='xl'>{p.title}</Heading>
                                <Text mt={2}>{p.textSnippet}</Text>
                            </Box>
                        </Flex>
                    ))}
                    </Stack>
                </Flex>
            )}
            {data && data.posts.hasMore ? (
            <Flex>
                <Button 
                    onClick={() => {
                        setVariables({
                            limit: variables.limit,
                            cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
                        })
                    }} 
                    isLoading={fetching} 
                    m="auto" 
                    my={8}
                >
                    load more
                </Button>
            </Flex>
            ) : null}
        </Layout>
    )
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Index);
