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
            <Heading mb={4}>{data.post.title}</Heading>
            <Box mb={4}>
                {data.post.text}
            </Box>
            <EditPostDeleteHorizontalButtons 
                id={data.post.id} 
                creatorId={data.post.creator.id}
            />
        </Layout>
    );
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Post);