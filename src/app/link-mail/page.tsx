import LinkAccountButton from "@/components/ui/link-account-button"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { api } from "@/trpc/server"

export default async function LinkMail() {
    // Check if user has any linked accounts
    const accounts = await api.account.getAccounts()
    const hasLinkedAccount = accounts && accounts.length > 0

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <div className="w-full max-w-md space-y-8 text-center">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Link Your Email Account</h1>
                    <p className="text-muted-foreground">
                        Connect your email account to start automating your cold emails
                    </p>
                </div>

                <div className="space-y-4">
                    <LinkAccountButton />

                    {hasLinkedAccount ? (
                        <div className="pt-4">
                            <Link href="/workflows">
                                <Button className="w-full">
                                    Go to Workflows <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="pt-4">
                            <Link href="/workflows">
                                <Button variant="outline" className="w-full">
                                    Skip for now
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}