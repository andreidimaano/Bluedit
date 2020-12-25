import { Box, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { NextPage } from 'next';
import router from 'next/dist/next-server/lib/router/router';
import { useRouter } from 'next/router';
import React from 'react';
import { useState } from 'react';
import { InputField } from '../../components/InputField';
import { Wrapper } from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import { toErrorMap } from '../../utils/toErrorMap';
import login from '../login';

const ChangePassword: NextPage<{token: string}> = ({token}) => {
    const router = useRouter();
    const [, changePassword] = useChangePasswordMutation();
    const [tokenError, setTokenError] = useState('');

    return (
    <Wrapper variant='small'>
        <Formik 
                initialValues={{ newPassword: '' }}
                onSubmit={async (values, { setErrors }) => {
                const response = await changePassword({
                    newPassword: values.newPassword, 
                    token,
                });
                if (response.data?.changePassword.errors) {
                    //error with token
                    const errorMap = toErrorMap(response.data.changePassword.errors);
                    if('token' in errorMap) {
                        setTokenError(errorMap.token);
                    }
                    setErrors(errorMap);
                } else if (response.data?.changePassword.user) {
                    //register user successful
                    router.push('/');                        
                }
            }}
        >
            {(props) => (
            <Form>
                <InputField
                    name="newPassword"
                    placeholder="new password"
                    label="New Password"
                    type="password"
                />
                <Button 
                    mt={4} 
                    type='submit' 
                    isLoading={props.isSubmitting} 
                    colorScheme='teal'
                >
                    change password
                </Button>
            </Form>   
            )}
        </Formik>            
    </Wrapper>
    );
}

ChangePassword.getInitialProps =({query}) => {
    return {
        token: query.token as string
    }
}

export default ChangePassword