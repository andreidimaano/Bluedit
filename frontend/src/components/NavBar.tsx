import { Box, Button, Flex, Heading, Link, Text } from '@chakra-ui/react';
import React from 'react'
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';
import {useRouter} from 'next/router'

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
    const router = useRouter();
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
            <Flex align="center">
                <NextLink href="/create-post">
                    <Button backgroundColor="#EDF2F7" mr={4} as={Link}>
                        create post
                    </Button>
                </NextLink>
                <Box mr={2}>{data.me.username}</Box>
                <Button
                    onClick={async () => {
                        await logout();
                        router.reload();
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
        <Flex zIndex={1} position="sticky" top={0} bg="white" py={4} px={16} align="center">
            <NextLink href='/' >
                <Link style={{textDecoration: "none"}}>
                    <Heading><Text style={{color: '#4361ee'}}>Bluedit</Text></Heading>
                </Link>
            </NextLink>
            <Box ml={'auto'}>{body}</Box>
        </Flex>
    );
}