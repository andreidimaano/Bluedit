import { Box, Button, Flex, Heading, Link } from '@chakra-ui/react';
import React from 'react'
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
    const [{fetching: logoutFetching}, logout] = useLogoutMutation();
    const [{data, fetching}] = useMeQuery({
        pause: isServer(),
    })
    let body = null;

    // data is loading
    if(fetching) {
        
        // user not logged in
    } else if (!data?.me) {
        body = (
            <>
                <NextLink href="/login">
                    <Link mr={2}>
                        login
                    </Link>
                </NextLink>
                <NextLink href="/register">
                    <Link>
                        register
                    </Link>
                </NextLink>
            </>
        )
        // user is logged in
    } else {
        body = (
            <Flex>
                <Box mr={2}>{data.me.username}</Box>
                <Button 
                    onClick={() => {
                        logout();
                    }} 
                    isLoading={logoutFetching}
                    variant="link"
                >
                    logout
                </Button>
            </Flex>            
        );
    }
    return (
        <Flex zIndex={1} position="sticky" top={0} bg="tomato" py={4} px={16} justify="space-between" align="center">
            <Heading>
                    <NextLink href='/' >
                        <Link style={{textDecoration: "none"}}>
                            reddit
                        </Link>
                    </NextLink>
                </Heading>
            <Box>
                {body}
            </Box>
        </Flex>
        
    );
}