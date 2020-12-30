import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Box, Flex, IconButton, Link } from '@chakra-ui/react';
import React from 'react'
import { useDeletePostMutation, useMeQuery } from '../generated/graphql';
import NextLink from "next/link";

interface EditPostDeleteHorizontalButtonsProps {
    id: number
    creatorId: number
}

export const EditPostDeleteHorizontalButtons: React.FC<EditPostDeleteHorizontalButtonsProps> = ({
    id,
    creatorId
}) => {
    const [, deletePost] = useDeletePostMutation();
    const [{ data: meData }] = useMeQuery();
  
    if (meData?.me?.id !== creatorId) {
      return null;
    }
  
    return (
        <Flex align="center">
            <Box>
                <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
                        <IconButton
                            as={Link} 
                            size="md"
                            aria-label="Edit Post"
                            icon={<EditIcon/>}
                            colorScheme="gray"
                        />
                </NextLink>
                <IconButton
                    size="md" 
                    ml={2}
                    aria-label="Delete Post"
                    icon={<DeleteIcon/>}
                    colorScheme="gray"
                    onClick={() => {
                        deletePost({id})
                    }}
                />
            </Box>
        </Flex>
    );
}