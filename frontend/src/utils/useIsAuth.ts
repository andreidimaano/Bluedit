import { useRouter } from "next/router";
import { useEffect } from "react";
import { useMeQuery } from "../generated/graphql";

export const useIsAuth = () => {
    const [{data, fetching}] = useMeQuery();
    const router = useRouter();
    useEffect(() => {
        //user experience so that users don't write a bunch of text 
        //and then get redirected
        if (!fetching && !data?.me) {
            router.replace('/login?next=' + router.pathname);
        }
    }, [fetching, data, router])
}