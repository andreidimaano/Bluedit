import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Flex, IconButton, Link } from '@chakra-ui/react';
import React from 'react'
import NextLink from 'next/link'
import { useDeletePostMutation, useMeQuery } from '../generated/graphql';

interface EditPostDeleteButtonsProps {
    id: number
    creatorId: number
}

export const EditPostDeleteButtons: React.FC<EditPostDeleteButtonsProps> = ({
    id,
    creatorId
}) => {
    const [, deletePost] = useDeletePostMutation();
    const [{ data: meData }] = useMeQuery();
    return meData?.me?.id !== creatorId ? null : (
        <Flex px={2} py={2} direction="column">
            <IconButton
                size="sm" 
                aria-label="Delete Post"
                icon={<DeleteIcon/>}
                colorScheme="gray"
                onClick={() => {
                    deletePost({id})
                }}
            />
            <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
                <IconButton
                    as={Link} 
                    mt={2}
                    size="sm"
                    aria-label="Edit Post"
                    icon={<EditIcon/>}
                    colorScheme="gray"
                />
            </NextLink>
       </Flex>
    );
}