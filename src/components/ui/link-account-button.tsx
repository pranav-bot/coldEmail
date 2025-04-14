'use client'

import { Button } from "@/components/ui/button"
import { getAruinkoAuthUrl } from "@/lib/aruinko"

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