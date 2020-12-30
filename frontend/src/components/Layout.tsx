import { Box } from '@chakra-ui/react';
import React from 'react'
import { NavBar } from './NavBar';
import { Wrapper, WrapperVariant } from './Wrapper';

interface LayoutProps {
    variant?: WrapperVariant
}

export const Layout: React.FC<LayoutProps> = ({children, variant}) => {
    return (
    <>
        <NavBar/>
        <Box backgroundColor="#DAE0E6">
            <Wrapper variant={variant}>
                {children}
            </Wrapper>
        </Box>
    </>
    );
}