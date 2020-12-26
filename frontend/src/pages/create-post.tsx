import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import React from 'react';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';

const CreatePost: React.FC<{}> = ({}) => {
    return (
        <Wrapper variant="small">
            <Formik 
                initialValues={{title: "", text: ""}}
                onSubmit={async (values) => {
                    console.log(values);
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

export default CreatePost;