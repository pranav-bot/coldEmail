import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { WorkflowClient } from "./workflow-client";


export default async function WorkflowsPage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    return (
        <div>
            <WorkflowClient />
        </div>
    );
}