import type { Lead } from "@/mail-agent/leadAnalysis";
import type { JobProfile, SalesProfile } from "@/mail-agent/buildProfile";

export type WorkflowResult = {
    lead: Lead;
    emailContent: {
        subject: string;
        body: string;
        to: string;
    };
    linkedInContent: {
        intro: string;
        message: string;
        to: string;
    };
};

export type WorkflowState = {
    userInput: string;
    enhancedIntent: string;
    profile: JobProfile | SalesProfile | null;
    leads: WorkflowResult[];
    status: 'idle' | 'processing' | 'complete' | 'error';
    error?: string;
};