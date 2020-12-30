import { Box, Flex, Heading, Link, Text } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { Layout } from '../../components/Layout';
import { usePostQuery } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';


export const Post = ({}) => {
    const router = useRouter();
    //console.log(router)
    //router is an object that contains information about the url
    const intId = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;
    const [{data, fetching}] = usePostQuery({
        pause: intId === -1,
        variables: {
            id:  intId
        }
    });

    if(fetching) {
        return (
            <Layout>
                <div>loading</div>
            </Layout>
        );
    }

    if(!data?.post) {
        return (
            <Layout>
                <Box>could not find post</Box>
            </Layout>
        )
    }
    
    return (
        <Layout>
            <Flex px={5} py={2} shadow="md" borderWidth="1px">
                {/* <UpdootSection post={p}/> */}
                <Box>
                    <Text>Post by {data.post.creator.username}</Text>
                    <NextLink href="/post/[id]" as={`/post/${data.post.id}`}>
                        <Link>
                            <Heading fontSize='xl'>{data.post.title}</Heading>
                        </Link> 
                    </NextLink>                       
                    <Text mt={2}>{data.post.text}</Text>
                </Box>
            </Flex>
        </Layout>
    );
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Post);