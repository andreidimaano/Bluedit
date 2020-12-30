import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { Flex, IconButton, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';

interface UpdootSectionProps {
    post: PostSnippetFragment;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({post}) => {
    const [loadingState, setLoadingState] = useState<'updoot-loading' | 'downdoot-loading' | 'not-loading'>('not-loading');
    const [, vote] = useVoteMutation();

    return (
        <Flex direction="column" backgroundColor="#F8F9FA" px={2} py={2} align="center">
            <IconButton
                onClick={async () => {
                    if(post.voteStatus === 1) {
                        return;
                    }
                    setLoadingState('updoot-loading');
                    await vote({value: 1, postId: post.id});
                    setLoadingState('not-loading');
                }}
                colorScheme={post.voteStatus === 1 ? "green" : undefined}
                isLoading={loadingState==='updoot-loading'}
                zIndex="0" 
                size="sm"
                icon={<TriangleUpIcon/>}
                aria-label="Upvote Button"
            />
            <Text fontSize="md">{post.points}</Text>
            <IconButton
                onClick={async () => {
                    if(post.voteStatus === -1) {
                        return;
                    }
                    setLoadingState('downdoot-loading');
                    await vote({value: -1, postId: post.id});
                    setLoadingState('not-loading');
                }}
                colorScheme={post.voteStatus === -1 ? "red" : undefined}
                isLoading={loadingState==='downdoot-loading'}
                zIndex="0" 
                size="sm"
                icon={<TriangleDownIcon/>}
                aria-label="Upvote Button"
            />
        </Flex>            
    );
}