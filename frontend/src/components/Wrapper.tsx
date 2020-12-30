import { Box } from '@chakra-ui/react';
import React from 'react'

export type WrapperVariant = 'small' | 'regular';

interface WrapperProps {
    variant?: WrapperVariant
}

export const Wrapper: React.FC<WrapperProps> = ({
    children, //children of the wrapper
    variant='regular'
}) => {
    return (
        <Box 
            mt={0} 
            mx='auto' 
            maxW={variant === 'regular' ? '800px' : '400px'}
            w='100%'
            py={8}
        >
            {children}
        </Box>
    );
}