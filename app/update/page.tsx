'use client';

import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { toast, Toaster } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import z from "zod/v3";
import { Input } from "@/components/ui/input";
import formSchema from "@/lib/zod-schemas/form-schema";
import { createOrUpdateUser, getNumberOfPushups } from "./action";
import { useRouter } from 'next/navigation';

export default function page() {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
      pushups: 0,
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    createOrUpdateUser(data)
      .then(({ success, message }) => {
        if (success) {
          toast.success('Success', { description: message });
          setTimeout(() => router.push('/'), 2000);
          return;
        }

        toast.error('Something went wrong...', { description: message });
      })
      .catch(() => {
        toast.error('Something went wrong...', { description: 'An unkown exception occured when making the request.' });
      })
  }

  let getPushupsTimeout: NodeJS.Timeout | null = null;

  function getPushups() {
    if (getPushupsTimeout !== null) {
      clearTimeout(getPushupsTimeout);
    }

    getPushupsTimeout = setTimeout(() => {
      getNumberOfPushups(form.getValues()).then((user) => {
        if (user === null) {
          return;
        }

        form.setValue('pushups', user.numberOfPushups);
      });
    }, 300)
  }

  return (
    <div className="mx-auto">
      <h1 className="text-3xl font-bold mb-4">Update Score</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">Username*</FormLabel>
                <FormControl className="">
                  <Input placeholder="Enter a name..." {...field} className="border-zinc-400"
                    onKeyDown={() => getPushups()} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">Password (optional)</FormLabel>
                <FormControl className="">
                  <Input placeholder="" type="password" {...field} className="border-zinc-400"
                    onKeyDown={() => getPushups()} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pushups"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">Number of Pushups*</FormLabel>
                <FormControl className="">
                  <Input placeholder="" type="number" {...field} className="border-zinc-400" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="font-bold cursor-pointer">Submit</Button>
        </form>
      </Form>
      <Toaster />
    </div>
  )
}
