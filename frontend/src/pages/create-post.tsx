import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import React from 'react';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useCreatePostMutation } from '../generated/graphql';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { Layout } from '../components/Layout';

const CreatePost: React.FC<{}> = ({}) => {
    const router = useRouter();
    const [,createPost] = useCreatePostMutation();
    return (
        <Layout variant="small">
            <Formik 
                initialValues={{title: "", text: ""}}
                onSubmit={async (values) => {
                    const {error} = await createPost({ input: values });
                    if (error?.message.includes('not authenticated')) {
                        router.push('/login');
                    } else {
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
                            textarea
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
        </Layout>
    );
}

export default withUrqlClient(createUrqlClient)(CreatePost);