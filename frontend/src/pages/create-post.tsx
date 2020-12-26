import { Box, Flex, Link, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import router from 'next/dist/next-server/lib/router/router';
import React from 'react'
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { toErrorMap } from '../utils/toErrorMap';
import login from './login';

export const CreatePost: React.FC<{}> = ({}) => {
    return (
        <Wrapper variant="small">
            <Formik 
                initialValues={{title: "", text: ""}}
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
                        name="title"
                        placeholder="Title"
                        label="Title"
                    />
                    <Box mt={4}>
                        <InputField
                            name="text"
                            placeholder="insert here..."
                            label="Body"
                        />
                    </Box>
                    <Button 
                        mt={4} 
                        type='submit' 
                        isLoading={props.isSubmitting} 
                        colorScheme='teal'
                    >
                        create post
                    </Button>
                </Form>   
                )}
            </Formik>
        </Wrapper>
    );
}