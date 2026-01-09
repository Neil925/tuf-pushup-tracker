'use client';

import { Button } from "@/components/ui/button";
import { Form, FormDescription, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { toast, Toaster } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import z from "zod/v3";
import { Input } from "@/components/ui/input";
import formSchema from "@/lib/zod-schemas/form-schema";
import { createOrUpdateUser, deleteUser, getNumberOfPushups } from "./action";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

  let [action, setAction] = useState('none');
  const [userFound, setUserFound] = useState(false);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);

  function submit(newAction: string) {
    return () => {
      if (newAction === 'confirm') {
        setAction(current => `${newAction}-` + current);
      }
      else {
        setAction(newAction);
      }
    }
  }

  useEffect(() => { if (action !== 'none') form.handleSubmit(onSubmit)() }, [action]);

  function onSubmit(data: z.infer<typeof formSchema>) {
    switch (action) {
      case 'create':
        setModalMessage('An existing user was not found so this will create a new one. Is that what you want to do?');
        setTimeout(() => setOpenModal(true), 100);
        break;
      case 'cancelled':
        setOpenModal(false);
        break;
      case 'update':
      case 'confirm-create':
        createOrUpdateUser(data)
          .then(({ success, message }) => {
            if (success) {
              toast.success('Success', { description: message });
              setModalMessage(null);
              setOpenModal(false);
              setTimeout(() => router.push('/'), 2000);
              return;
            }

            toast.error('Something went wrong...', { description: message });
          })
          .catch(() => {
            toast.error('Something went wrong...', { description: 'An unkown exception occured when making the request.' });
          });
        break;
      case 'delete':
        setModalMessage('Are you sure you want to delete this account?');
        setTimeout(() => setOpenModal(true), 100);
        break;
      case 'confirm-delete':
        deleteUser(data)
          .then(({ success, message }) => {
            if (success) {
              toast.success('Success', { description: message });
              setModalMessage(null);
              setOpenModal(false);
              setTimeout(() => router.push('/'), 2000);
              return;
            }

            toast.error('Something went wrong...', { description: message });
          })
          .catch(() => {
            toast.error('Something went wrong...', { description: 'An unkown exception occured when making the request.' });
          });
        break;
      case 'none':
        return;
      default:
        toast.error(`Recieved unkown action: ${action}`);
        break;
    }

    setAction('none');
  }

  let getPushupsTimeout: NodeJS.Timeout | null = null;

  function getPushups() {
    if (getPushupsTimeout !== null) {
      clearTimeout(getPushupsTimeout);
    }

    getPushupsTimeout = setTimeout(() => {
      getNumberOfPushups(form.getValues()).then((user) => {
        if (user === null) {
          setUserFound(false);
          return;
        }

        form.setValue('pushups', user.numberOfPushups);
        setUserFound(true);
      });
    }, 300)
  }

  return (
    <div className="mx-auto w-full">
      <h1 className="text-3xl font-bold mb-2">Update Score</h1>
      <ul className="text-md mb-3">
        <li>- If your username and password are found, this will update your record. </li>
        <li>- Otherwise, it will create your user and then set your pushup record.</li>
        <li>- You can always come back and set a password later. To rename, just delete and create again.</li>
      </ul>
      <Form {...form}>
        <form className="space-y-8">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">Username*</FormLabel>
                <FormControl className="">
                  <Input placeholder="Enter a name..." {...field} className="border-zinc-400"
                    onKeyDown={getPushups} />
                </FormControl>
                <FormMessage />
                {userFound &&
                  <FormDescription className='text-green-700 font-bold'>
                    Your user was found successfully!
                  </FormDescription>
                }

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
                    onKeyDown={getPushups} />
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
                {userFound &&
                  <FormDescription className="text-black">
                    The last number you set was retrieved. You can set a new one.
                  </FormDescription>
                }
              </FormItem>
            )}
          />
          <div className="space-x-3">
            {
              userFound ?
                <Button type="button" onClick={submit('update')} disabled={!form.formState.isValid}
                  className='font-bold cursor-pointer bg-blue-500'>Update</Button> :
                <Button type="button" onClick={submit('create')} disabled={!form.formState.isValid}
                  className='font-bold cursor-pointer bg-green-500'>Create</Button>
            }
            {userFound &&
              <Button type="button" onClick={submit('delete')} disabled={!form.formState.isValid}
                className="font-bold cursor-pointer bg-red-500">Delete</Button>
            }
          </div>
        </form>
      </Form>
      <Toaster />
      <Dialog open={openModal} onOpenChange={(ev) => !ev && submit('cancelled')()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              {modalMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="cursor-pointer" onClick={submit('cancelled')}>Cancel</Button>
            </DialogClose>
            <Button type="button" name="confirm" className="cursor-pointer" onClick={submit('confirm')}>Yes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  )
}
