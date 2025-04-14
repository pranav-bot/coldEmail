'use client'

import { Button } from "@/components/ui/button"
import { getAruinkoAuthUrl } from "@/lib/aurinko"

const LinkAccountButton = () => {
    return (
        <Button onClick={async () => {
            const authUrl = await getAruinkoAuthUrl('Google')
            window.location.href = authUrl
        }}>
            Link Account
        </Button>
    )
}

export default LinkAccountButton