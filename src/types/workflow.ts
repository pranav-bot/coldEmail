import type { Lead } from "@/mail-agent/leadAnalysis";
import type { JobProfile, FreelanceProfile } from "@/mail-agent/buildProfile";

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

export type WorkflowStep = {
    name: string;
    content: string;
    status: 'pending' | 'editing' | 'complete';
}

export type WorkflowState = {
    userInput: string;
    enhancedIntent: string;
    profile: any;
    leads: any[];
    status: 'idle' | 'processing' | 'complete' | 'error';
    error?: string;
};

export type WorkflowHistory = {
    id: string;
    title: string;
    createdAt: Date;
    enhancedIntent: string;
    status: WorkflowState['status'];
}