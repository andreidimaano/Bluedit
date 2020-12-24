import React from 'react'
import { Formik } from 'formik'
import { Form } from 'formik';
import { Box, Button, FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/react';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';

interface registerProps {

}

const Register: React.FC<registerProps> = ({}) => {
    return (
        <Wrapper variant='small'>
            <Formik 
                initialValues={{username: "", password: ""}}
                onSubmit={(values) => {
                    console.log(values);
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