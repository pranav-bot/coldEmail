"use client";
import useThreads from "@/hooks/use-threads";
import { cn } from "@/lib/utils";
import type { RouterOutputs } from "@/trpc/react";
import Avatar from "react-avatar";
import {Letter} from 'react-letter';
import React from "react";
import { formatDistanceToNow } from "date-fns";

type Props = {
  email: RouterOutputs["account"]["getThreads"][0]["emails"][0];
};

const EmailDisplay = ({ email }: Props) => {
  const { account } = useThreads();
  const isMe = account?.emailAddress === email.from.address;
  return (
    <div
      className={cn(
        "rounded-md border p-4 transition-all hover:translate-x-2",
        {
          "border-1-gray-900 border-1-4": isMe,
        },
      )}
    >
      <div className={cn("flex items-center justify-between gap-2")}>
        <div className={cn("flex items-center justify-between gap-2")}>
          {!isMe && (
            <Avatar
              name={email.from.name ?? email.from.address}
              email={email.from.address}
              size="35"
              textSizeRatio={2}
              round={true}
            />
          )}
           <span className="font-medium">
            {isMe ? "Me" : email.from.address}
           </span>
        </div>
        <p className="text-xm text-muted-foreground">
            {formatDistanceToNow(email.sentAt ?? new Date(), {
              addSuffix: true,
            })}
        </p>
      </div>
      <div className="h-4">
        <Letter html={email?.bodySnippet ?? ''} className="bg-white rounded-md text-black"/>
      </div>
    </div>
  );
};
export default EmailDisplay;
