import { Button } from "@/components/ui/button"
import { ArrowRight, Mail } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import LinkAccountButton from "@/components/ui/link-account-button"

export default async function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b">
        <div className="container max-w-6xl mx-auto px-4 flex h-14 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="h-6 w-6" />
            <span className="font-bold">ColdMail AI</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container max-w-6xl mx-auto px-4 py-24 space-y-8 text-center md:py-32">
          <div className="space-y-6 max-w-[700px] mx-auto">
            <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
              Write Perfect Cold Emails with AI
            </h1>
            <p className="text-xl text-muted-foreground mx-auto max-w-[600px]">
              Generate personalized, high-converting cold emails in seconds. 
              Powered by advanced AI to help you connect with the right leads.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              {/* <LinkAccountButton  /> */}
            </div>
          </div>
          <div className="relative mx-auto max-w-5xl">
            <Image
              src="/dashboard-preview.svg"
              alt="App Screenshot"
              width={1200}
              height={800}
              className="rounded-lg border shadow-2xl"
              priority
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span className="font-semibold">ColdMail AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 ColdMail AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
