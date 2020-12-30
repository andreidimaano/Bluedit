import { Box, Flex, Heading, Link, Text } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import React from 'react';
import { Layout } from '../../components/Layout';
import { UpdootSection } from '../../components/UpdootSection';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl';
import { PostSnippetFragment} from '../../generated/graphql';
import { EditPostDeleteHorizontalButtons } from '../../components/EditPostDeleteHorizontalButtons';


export const Post = ({}) => {
    const [{data, fetching}] = useGetPostFromUrl();

    if(fetching) {
        return (
            <Layout>
                <div>Loading Post...</div>
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
            <Flex backgroundColor="white" shadow="md" maxW="100%" borderWidth="1px">
                <Flex width="100%" px={8} pt={2} pb={5}>
                    <Box width="100%">
                        <Text fontSize="xs">Posted by {data.post.creator.username}</Text>
                            <Heading mb={4}>{data.post.title}</Heading>                     
                        <Text mt={4}>{data.post.text}</Text>
                        <Box mt={4}>
                            <EditPostDeleteHorizontalButtons
                                id={data.post.id} 
                                creatorId={data.post.creator.id}
                            />
                        </Box>
                    </Box>
                </Flex>
            </Flex>
        </Layout>
    );
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Post);