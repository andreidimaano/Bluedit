import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import React, { useState } from 'react';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useForgotPasswordMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const ForgotPassword: React.FC<{}> = ({}) => {
    const [complete, setComplete] = useState(false);
    const [, forgotPassword] = useForgotPasswordMutation();
    return (
    <Wrapper variant='small'>
        <Formik 
            initialValues={{email: ''}}
            onSubmit={async (values) => {
                await forgotPassword(values);
                setComplete(true);
            }}
        >
            {(props) => 
            complete ? (
            <Box>We Sent an Email!</Box> 
            ) : (
            <Form>
                <Box mt={4}>
                    <InputField
                        name="email"
                        placeholder="email"
                        label="Email"
                        type="email"
                    />
                </Box>
                <Button 
                    mt={4} 
                    type='submit' 
                    isLoading={props.isSubmitting} 
                    colorScheme='teal'
                >
                    forgot password
                </Button>
            </Form>   
            )}
        </Formik>            
    </Wrapper>
    );
}

export default withUrqlClient(createUrqlClient)(ForgotPassword);