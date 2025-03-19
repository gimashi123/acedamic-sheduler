
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
    username: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
})
export function AddDetails() {
    const form = useForm({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = (data: { username: string }) => {
        console.log(data);
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-md w-full max-w-md space-y-6">
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input {...field} className="w-full" />
                                </FormControl>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Input className="w-full" />
                                </FormControl>
                                <FormLabel>Group Name</FormLabel>
                                <FormControl>
                                    <Input className="w-full" />
                                </FormControl>
                                <FormLabel>Is Published</FormLabel>
                                <FormDescription>
                                    This is your public display name.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full">Submit</Button>
                </form>
            </Form>
        </div>
    );
}
