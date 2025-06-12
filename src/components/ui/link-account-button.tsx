'use client'

import { Button } from "@/components/ui/button"
import { getAurinkoAuthUrl } from "@/lib/aurinko"

const LinkAccountButton = () => {
    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Coming Soon:</span>
            <Button 
                disabled 
                onClick={async () => {
                    // Preserved for future use
                    const authUrl = await getAurinkoAuthUrl('Google')
                    window.location.href = authUrl
                }}
            >
                Link Account
            </Button>
        </div>
    )
}

export default LinkAccountButton