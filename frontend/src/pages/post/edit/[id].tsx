import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../../../components/InputField';
import { Layout } from '../../../components/Layout';
import { usePostQuery, useUpdatePostMutation } from '../../../generated/graphql';
import { createUrqlClient } from '../../../utils/createUrqlClient';
import { useGetIntId } from '../../../utils/useGetIntId';

const EditPost = ({}) => {
    const router = useRouter();
    const intId = useGetIntId();
    const [{data, fetching}] = usePostQuery({
        pause: intId === -1,
        variables: {
            id:  intId
        }
    });
    const [, updatePost] = useUpdatePostMutation();
    
    if(fetching) {
        return (
            <Layout>
                <div>Loading Post...</div>
            </Layout>
        );
    }

    if(!data?.post) {
        return (
            <Layout>
                <Box>could not find post</Box>
            </Layout>
        )
    }

    return (
        <Layout>
            <Formik 
                initialValues={{title: data.post.title, text: data.post.text}}
                onSubmit={async (values) => {
                    await updatePost({id: intId, ...values})
                    router.back();
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
                        update post
                    </Button>
                </Form>   
                )}
            </Formik>
        </Layout>
    );
}

export default withUrqlClient(createUrqlClient)(EditPost);