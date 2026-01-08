'use server';

import { prisma } from "@/lib/prisma";

export async function getTableData() {
  return await prisma.user.findMany({ select: { username: true, numberOfPushups: true }, orderBy: { numberOfPushups: 'desc' } });
}
