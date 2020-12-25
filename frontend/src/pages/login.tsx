import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useLoginMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { toErrorMap } from '../utils/toErrorMap';

const Login: React.FC<{}> = ({}) => {
    const router = useRouter();
    const [, login] = useLoginMutation();
    return (
        <Wrapper variant='small'>
            <Formik 
                initialValues={{username: "", email: "", password: ""}}
                onSubmit={async (values, { setErrors }) => {
                    const response = await login({ options: values });
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
                        name="username"
                        placeholder="username"
                        label="Username"
                    />
                    <Box mt={4}>
                        <InputField
                            name="email"
                            placeholder="email"
                            label="email"
                        />
                    </Box>
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
    )
}

export default withUrqlClient(createUrqlClient)(Login);