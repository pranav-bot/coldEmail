'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"  
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useThreads from "@/hooks/use-threads";
import { Archive, ArchiveX, Trash2, Clock, MoreVertical    } from "lucide-react";

const ThreadDisplay = () => {
    const {threadId, threads} = useThreads();
    const thread = threads?.find((t) => t.id === threadId);
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">  <Button variant={'ghost'} size={'icon'} disabled={!thread}>
                        <Archive className="size-4"></Archive>
                    </Button>
                <Button variant={'ghost'} size={'icon'} disabled={!thread}>
                    <ArchiveX className="size-4"></ArchiveX>
                </Button>
                <Button variant={'ghost'} size={'icon'} disabled={!thread}>
                    <Trash2 className="size-4"></Trash2>
                </Button>
                </div>
                <Separator orientation="vertical" className="ml-2"></Separator>
                <Button variant={'ghost'} size={'icon'} disabled={!thread}>
                    <Clock className="size-4"></Clock>
                </Button>
            </div>
            <div className="flex items-center ml-auto">
            <DropdownMenu>
  <DropdownMenuTrigger>                <Button variant={'ghost'} size={'icon'} disabled={!thread}>
                    <MoreVertical className="size-4"></MoreVertical>
                </Button></DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem>Mark as unread</DropdownMenuItem>
    <DropdownMenuItem>Billing</DropdownMenuItem>
    <DropdownMenuItem>Team</DropdownMenuItem>
    <DropdownMenuItem>Subscription</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

            </div>
        </div>
    )
}

export default ThreadDisplay;