'use client';

import dynamic from "next/dynamic";
import { ThemeToggle } from "@/components/theme-toggle";
const Mail = dynamic(() => import('./mail'), { ssr: false });

export const MailClient = () => {
    return (
        <>
        <div className="absolute bottom-4 left-4">
            <ThemeToggle />
        </div>
        <Mail defaultLayout={[20, 32, 48]} defaultCollapsed={false} navCollapsedSize={4} /></>
        
    );
}; 