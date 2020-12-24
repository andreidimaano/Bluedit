import React from 'react'
import { Formik } from 'formik'
import { Form } from 'formik';
import { Box, Button, FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/react';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { useMutation } from 'urql';

interface registerProps {}

const REGISTER_MUT = `
mutation Register($username: String!, $email: String!, $password: String!) {
    register(options: {username: $username, email: $email, password: $password}){
      errors{
        field
        message
      }
      user {
        username
      }
    }
}
`

const Register: React.FC<registerProps> = ({}) => {
    const [, register] = useMutation(REGISTER_MUT)
    return (
        <Wrapper variant='small'>
            <Formik 
                initialValues={{username: "", email: "", password: ""}}
                onSubmit={(values) => {
                    console.log(values);
                    return register(values);
                    // const response = await register(values);
                    // if (response.data?.register.errors) {
                    //     setErrors(toErrorMap(response.data.register.errors));
                    // } else if (response.data?.register.user) {
                    //     //register user successful
                    //     router.push('/');
                    // }
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
                        register
                    </Button>
                </Form>   
                )}
            </Formik>            
        </Wrapper>
    )
}

export default Register