'use client';

import { Button } from "@/components/ui/button";
import { Table, TableCaption, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { getTableData } from "./action";

export default function Home() {
  const [users, setUsers] = useState<{ username: string, numberOfPushups: number }[]>([]);

  useEffect(() => {
    getTableData().then((data) => setUsers(data))

    setInterval(() => {
      getTableData().then((data) => setUsers(data));
      console.log('hit');
    }, 3000);
  }, [])

  return (
    <div className="w-full">
      <div className="flex flex-col justify-between w-full mb-4 space-y-2 md:flex-row">
        <h1 className="text-3xl font-bold">Score Board</h1>
        <a href="update"><Button className="font-bold cursor-pointer">Update My Score</Button></a>
      </div>
      <Table className="bg-zinc-300 rounded-2xl">
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">User</TableHead>
            <TableHead className="w-[200px] font-bold">Pushup Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, key) => (
            <TableRow key={key}>
              <TableCell>{user.username}</TableCell>
              <TableCell className="">{user.numberOfPushups}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableCaption className="font-bold">
          Don't forget to only count pushups you did <em>outside</em> of class.<br />Let's see how TUF you can be!
        </TableCaption>
      </Table>
    </div>
  );
}
