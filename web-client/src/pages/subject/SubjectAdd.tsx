import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { addSubject } from '@/services/subject.service.ts';
import * as React from 'react';

// Define the schema with validations
const formSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: 'Subject name is required and must have at least 2 characters.',
    })
    .regex(/^[A-Za-z\s]*$/, {
      message: 'Subject name can only contain English letters and spaces.',
    }),

  code: z
    .string()
    .length(6, { message: 'Subject code must be exactly 6 characters.' })
    .regex(/^[A-Z]{2}\d{4}$/, {
      message:
        'Subject code must be two uppercase letters followed by four numbers.',
    }),

  credits: z
    .number()
    .min(1, { message: 'Credits must be a valid number greater than 0.' })
    .refine((val) => !isNaN(val), {
      message: 'Credits must be a valid number.',
    }),
});

export function SubjectAdd() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      code: '',
      credits: 1, // default value for credits
    },
    mode: 'onChange', // Trigger validation on field change
  });

  const { errors } = form.formState; // Get errors from form state
  const [loading, setLoading] = useState(false); // State to manage the loading message

  const onSubmit = (data: any) => {
    setLoading(true); // Set loading to true when form is submitted

    addSubject(data)
      .then(
        () => {
          // Reset form after successful submission
          form.reset();
          setLoading(false); // Set loading to false after successful submission
        },
        (error) => {
          console.error('Error adding subject:', error);
          setLoading(false); // Set loading to false after error
        
        },
      )
      .finally(() => setLoading(false));
  };

  const handleCreditsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Convert the selected value to a number and set it in the form
    const value = parseInt(e.target.value, 10);
    form.setValue('credits', value); // Update credits field with the correct number
  };

  // Handle the input change for subjectName and prevent invalid characters immediately
  const handleSubjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow English letters and spaces
    if (/^[A-Za-z\s]*$/.test(value)) {
      form.setValue('name', value); // Update form value
    }
  };

  // Handle the input change for subjectCode and enforce the rules for capital letters and numbers
  const handleSubjectCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Enforce only two uppercase letters followed by four digits
    if (/^[A-Z]{0,2}\d{0,4}$/.test(value)) {
      // Ensure the first two characters are uppercase letters and the next four are numbers
      value = value.toUpperCase(); // Ensure uppercase for first two characters
      form.setValue('code', value); // Update form value
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 shadow-lg rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-4">Add Subject</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter subject name"
                      {...field}
                      onChange={handleSubjectNameChange} // Add custom change handler here
                    />
                  </FormControl>
                  {errors.name && (
                    <FormMessage>{errors.name.message}</FormMessage>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter subject code (e.g., IT2030)"
                      {...field}
                      onChange={handleSubjectCodeChange} // Custom validation for subject code
                    />
                  </FormControl>
                  {errors.code && (
                    <FormMessage>{errors.code.message}</FormMessage>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Credits</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full p-2 border rounded"
                      value={field.value} // Ensure the select value is correctly controlled
                      onChange={handleCreditsChange} // Update form value on change
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </FormControl>
                  {errors.credits && (
                    <FormMessage>{errors.credits.message}</FormMessage>
                  )}
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Adding Subject...' : 'Add Subject'}{' '}
              {/* Show loading message when submitting */}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
