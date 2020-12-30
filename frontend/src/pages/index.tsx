import { DeleteIcon } from "@chakra-ui/icons"
import { Box, Button, Flex, Heading, IconButton, Link, Stack, Text } from "@chakra-ui/react"
import { withUrqlClient } from "next-urql"
import NextLink from 'next/link'
import React, { useState } from "react"
import { Layout } from "../components/Layout"
import { UpdootSection } from "../components/UpdootSection"
import { useDeletePostMutation, usePostsQuery } from "../generated/graphql"
import { createUrqlClient } from "../utils/createUrqlClient"

const Index = () => {
    const [variables, setVariables] = useState({limit: 15, cursor: null as null | string});
    const [, deletePost] = useDeletePostMutation();
    const [{ data, fetching }] = usePostsQuery({
        variables,
    });

    if(!fetching && !data) {
        return <div>failed to get data</div>;
    }

    return (
        <Layout>
            <Flex justify="center" align="center">
                <Flex backgroundColor="white" p={5} maxW="xl" w="100%" shadow="md" borderWidth="1px" >
                    <Box bg="#E2E8F0"  w="100%" p={4} >
                        <NextLink href="/create-post">
                            <Link>
                                create post
                            </Link>
                        </NextLink>
                    </Box>
                </Flex>
            </Flex>
            <br/>
            {!data && fetching ? (
            <div>loading...</div> 
            ) : (
                <Flex justify="center">
                    <Stack justify="center" spacing={4}>
                    {data!.posts.posts.map((p) => 
                    !p ? null : (
                        <Flex key={p.id} backgroundColor="white" shadow="md" maxW="xl" borderWidth="1px">
                            <UpdootSection post={p}/>
                            <Flex width="100%" px={5} py={2}>
                                <Box width="100%">
                                    <Text>Post by {p.creator.username}</Text>
                                    <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                                        <Link>
                                            <Heading fontSize='xl'>{p.title}</Heading>
                                        </Link> 
                                    </NextLink>                       
                                    <Text mt={2}>{p.textSnippet}</Text>
                                </Box>
                                <IconButton 
                                    aria-label="Delete Post"
                                    icon={<DeleteIcon/>}
                                    colorScheme="gray"
                                    onClick={() => {
                                        deletePost({id: p.id})
                                    }}
                                />
                            </Flex>
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
