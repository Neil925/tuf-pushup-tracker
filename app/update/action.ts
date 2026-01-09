'use server'

import { prisma } from "@/lib/prisma";
import formSchema from "@/lib/zod-schemas/form-schema";
import z from "zod/v3";
import bcrypt from "bcryptjs";

export async function createOrUpdateUser(user: z.infer<typeof formSchema>) {
  user = userCleanup(user);

  const existingUser = await prisma.user.findFirst({
    where: {
      username: user.username,
    }
  })

  if (existingUser?.password && existingUser.password !== user.password) {
    return { success: false, message: 'User already exists! Was your password correct?' };
  }

  let updateOrCreateUser = null;

  if (existingUser) {
    updateOrCreateUser = await prisma.user.update({
      data: {
        numberOfPushups: user.pushups,
        password: user.password,
      },
      where: {
        username: user.username,
      }
    });
  } else {
    updateOrCreateUser = await prisma.user.create({
      data: {
        username: user.username,
        password: user.password,
        numberOfPushups: user.pushups,
      }
    });
  }

  if (updateOrCreateUser === null) {
    return { success: false, message: 'Unkown error creating user.' };
  }


  return { success: true, message: `User ${existingUser === null ? 'created' : 'updated'} successfully!` };
}

export async function getNumberOfPushups(user: z.infer<typeof formSchema>) {
  user = userCleanup(user);

  return await prisma.user.findFirst({
    where: {
      username: user.username,
      password: user.password,
    },
    select: { numberOfPushups: true },
  });
}

export async function deleteUser(user: z.infer<typeof formSchema>) {
  user = userCleanup(user);

  const deletedUser = await prisma.user.delete({
    where: {
      username: user.username,
      password: user.password
    }
  });

  return { success: true, message: 'User deleted successfully!' };
}

function processPassword(password: string): string {
  const salt = process.env.SALT?.replaceAll(' ', '$');
  const hash = bcrypt.hashSync(password, salt);

  return hash;
}

function userCleanup(user: z.infer<typeof formSchema>) {
  user.password = user.password ? processPassword(user.password) : undefined;
  user.username = user.username.trim();

  return user;
}
