"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useThreads from "@/hooks/use-threads";
import { Archive, ArchiveX, Trash2, Clock, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import EmailDisplay from "./email-display";
const ThreadDisplay = () => {
  const { threadId, threads } = useThreads();
  const thread = threads?.find((t) => t.id === threadId);
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          {" "}
          <Button variant={"ghost"} size={"icon"} disabled={!thread}>
            <Archive className="size-4"></Archive>
          </Button>
          <Button variant={"ghost"} size={"icon"} disabled={!thread}>
            <ArchiveX className="size-4"></ArchiveX>
          </Button>
          <Button variant={"ghost"} size={"icon"} disabled={!thread}>
            <Trash2 className="size-4"></Trash2>
          </Button>
        </div>
        <Separator orientation="vertical" className="ml-2"></Separator>
        <Button variant={"ghost"} size={"icon"} disabled={!thread}>
          <Clock className="size-4"></Clock>
        </Button>
        <div className="ml-auto flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger>
              {" "}
              <Button variant={"ghost"} size={"icon"} disabled={!thread}>
                <MoreVertical className="size-4"></MoreVertical>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Mark as unread</DropdownMenuItem>
              <DropdownMenuItem>Star thread</DropdownMenuItem>
              <DropdownMenuItem>Mark as read</DropdownMenuItem>
              <DropdownMenuItem>Add label</DropdownMenuItem>
              <DropdownMenuItem>Move to trash</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Separator orientation="horizontal"></Separator>
      {thread ? (
        <>
          <div className="flex flex-1 flex-col overflow-scroll">
            <div className="flex items-center p-4">
                <div className="flex items-center gap-4 text-sm">
                    <Avatar>
                        <AvatarImage alt='avatar'></AvatarImage>
                        <AvatarFallback>{thread.emails[0]?.from?.name?.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                        <div className="font-semibold">{thread.emails[0]?.from?.name}</div>
                        <div className="text-xs line-clamp-1">{thread.emails[0]?.subject}</div>
                        <div className="text-xs line-clamp-1">
                            <span className="font-medium">Reply-To:</span>
                            {thread.emails[0]?.from?.address}
                        </div>
                    </div>
                </div>
                {thread.emails[0]?.sentAt && (
                    <div className="ml-auto text-xs text-muted-foreground">
                        {format(new Date(thread.emails[0]?.sentAt), 'PPpp')}
                    </div>
                )}
            </div>
            <Separator orientation="horizontal"></Separator>
            <div className="max-h-[calc(100vh-500x)] overflow-scroll flex flex-col">
                <div className="p-6 flex flex-col gap-4">{thread.emails.map(email => {
                    return <EmailDisplay key={email.id} email={email} />
                })}
                </div>
            </div>
            <div className="flex-1"></div>
            <Separator className="mt-auto" orientation="horizontal"></Separator>
            Reply Box
          </div>
        </>
      ) : (
        <>
          <div className="text-muted-foreground p-8 text-center">
            No messages selected
          </div>
        </>
      )}
    </div>
  );
};

export default ThreadDisplay;