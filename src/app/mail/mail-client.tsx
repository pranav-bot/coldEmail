'use client';

import dynamic from "next/dynamic";

const Mail = dynamic(() => import('./mail'), { ssr: false });

export const MailClient = () => {
    return (
        <Mail defaultLayout={[20, 32, 48]} defaultCollapsed={false} navCollaspedSize={4} />
    );
}; 