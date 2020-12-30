import { FormControl, FormErrorMessage, FormLabel, Input, Textarea } from '@chakra-ui/react';
import { useField } from 'formik';
import React, { InputHTMLAttributes } from 'react';

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    name: string;
    textarea?: boolean;
};

export const InputField: React.FC<InputFieldProps> = ({
    label, 
    textarea, 
    size: _, 
    ...props
}) => {
    let InputOrTextarea: any = Input;
    if (textarea) {
        InputOrTextarea = Textarea;
    }
    const [field, {error}] = useField(props);
    return (
        <FormControl isInvalid={!!error}> {/* converts to boolean */}
            <FormLabel htmlFor={field.name}>{label}</FormLabel>
            <InputOrTextarea
                backgroundColor="white" 
                {...field} 
                {...props} 
                id={field.name}
            />
            {error? <FormErrorMessage>{error}</FormErrorMessage> : null}
        </FormControl>
    );
}