import { Box, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { NextPage } from 'next';
import router from 'next/dist/next-server/lib/router/router';
import React from 'react';
import { InputField } from '../../components/InputField';
import { Wrapper } from '../../components/Wrapper';
import { toErrorMap } from '../../utils/toErrorMap';
import login from '../login';

const ChangePassword: NextPage<{token: string}> = ({token}) => {
    return (
    <Wrapper variant='small'>
        <Formik 
            initialValues={{usernameOrEmail: "", password: ""}}
            onSubmit={async (values, { setErrors }) => {
                const response = await login(values);
                if (response.data?.login.errors) {
                    setErrors(toErrorMap(response.data.login.errors));
                } else if (response.data?.login.user) {
                    //register user successful
                    router.push('/');                        
                }
            }}
        >
            {(props) => (
            <Form>
                <InputField
                    name="usernameOrEmail"
                    placeholder="username or email"
                    label="UsernameOrEmail"
                />
                <Box mt={4}>
                    <InputField
                        name="password"
                        placeholder="password"
                        label="Password"
                        type="password"
                    />
                </Box>
                <Button 
                    mt={4} 
                    type='submit' 
                    isLoading={props.isSubmitting} 
                    colorScheme='teal'
                >
                    login
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