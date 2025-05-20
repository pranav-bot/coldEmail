import { Button } from "@/components/ui/button"
import { ArrowRight, Mail, Briefcase, Code } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import LinkAccountButton from "@/components/ui/link-account-button"
import { auth } from "@clerk/nextjs/server"
import { ThemeToggle } from "@/components/theme-toggle"

export default async function Home() {
  const { userId } = await auth()
 
  // No redirect needed - we show different content based on auth status
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
            {userId ? (
              <>
                <Link href="/workflows">
                  <Button variant="ghost">Go to Workflows</Button>
                </Link>
                <Link href="/sign-out">
                  <Button variant="outline">Sign Out</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container max-w-6xl mx-auto px-4 py-24 space-y-8 text-center md:py-32">
          <div className="space-y-6 max-w-[700px] mx-auto">
            <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
              Find Your Next Job or Client – with One Smart Email
            </h1>
            <p className="text-xl text-muted-foreground mx-auto max-w-[600px]">
              Whether you&apos;re seeking internships, full-time roles, or freelance gigs — our AI agent crafts cold emails that open doors.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {userId ? (
                <Link href="/workflows">
                  <Button size="lg" className="w-full sm:w-auto">
                    Go to Workflows <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/sign-up">
                    <Button size="lg" className="w-full sm:w-auto">
                      Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  {/* <LinkAccountButton className="w-full sm:w-auto" /> */}
                </>
              )}
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

        {/* Who It&apos;s For Section */}
        <section className="py-16">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Who It&apos;s For</h2>
              <p className="text-muted-foreground mt-2">Designed for professionals at every stage of their career journey</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Job Seekers Card */}
              <div className="bg-card p-8 rounded-lg border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Job Seekers</h3>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="text-primary text-lg">•</span>
                    <span>Land internships, research roles, or full-time jobs</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary text-lg">•</span>
                    <span>Stand out from the crowd with AI-personalized outreach</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary text-lg">•</span>
                    <span>Build connections with recruiters and hiring managers</span>
                  </li>
                </ul>
                {!userId && (
                  <Link href="/sign-up">
                    <Button className="w-full">
                      Start Your Job Search <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
              
              {/* Freelancers Card */}
              <div className="bg-card p-8 rounded-lg border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Code className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Freelancers</h3>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="text-primary text-lg">•</span>
                    <span>Pitch high-value clients without cold-call anxiety</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary text-lg">•</span>
                    <span>Secure gigs faster with automated follow-ups</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary text-lg">•</span>
                    <span>Let the agent find and reach your ideal clients</span>
                  </li>
                </ul>
                {!userId && (
                  <Link href="/sign-up">
                    <Button className="w-full">
                      Grow Your Freelance Business <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* Footer */}
      <footer className="border-t">
        <div className="container max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span className="font-semibold">PitchSnag</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 PitchSnag AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}