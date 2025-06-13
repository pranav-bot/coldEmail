import { Button } from "@/components/ui/button"
import { ArrowRight, Mail } from "lucide-react"
import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { ThemeToggle } from "@/components/theme-toggle"
import { WorkflowDiagram } from "@/components/workflow-diagram"

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
            <span className="font-bold">PitchSnag</span>
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
              Find Your Next Opportunity – with One Smart Email
            </h1>
            <p className="text-xl text-muted-foreground mx-auto max-w-[600px]">
              Whether you&apos;re seeking jobs, clients, or investors — our AI agent crafts cold emails that open doors for job seekers, freelancers, and early-stage founders.
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
            <WorkflowDiagram userId={userId} />
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16">
          <div className="container max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold flex items-center justify-center gap-2">💸 Pricing Plans</h2>
              <p className="text-muted-foreground mt-2">Choose the plan that fits your outreach needs</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Free Plan */}
              <div className="bg-card p-8 rounded-lg border flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🟢</span>
                  <h3 className="text-xl font-semibold">Free Plan</h3>
                </div>
                <p className="mb-6 text-muted-foreground">Perfect for new users and casual outreach.</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2"><span>✅</span>3 Active Workflows</li>
                  <li className="flex items-center gap-2"><span>✅</span>Access to Basic AI for Pitch Drafts</li>
                  <li className="flex items-center gap-2"><span>❌</span>No Direct Sending from Dashboard</li>
                  <li className="flex items-center gap-2"><span>❌</span>Limited Customization</li>
                </ul>
                <div className="mt-auto">
                  <div className="text-3xl font-bold mb-2">$0<span className="text-base font-normal">/month</span></div>
                  {!userId && (
                    <Link href="/sign-up">
                      <Button className="w-full">Get Started Free</Button>
                    </Link>
                  )}
                </div>
              </div>
              {/* Pro Plan */}
              <div className="bg-card p-8 rounded-lg border flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🔵</span>
                  <h3 className="text-xl font-semibold">Pro Plan</h3>
                </div>
                <p className="mb-6 text-muted-foreground">Designed for professionals, freelancers, and job seekers ready to scale their outreach.</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2"><span>✅</span>Unlimited Workflows</li>
                  <li className="flex items-center gap-2"><span>✅</span>Send Pitches Directly from Dashboard</li>
                  <li className="flex items-center gap-2"><span>✅</span>Access to Advanced AI Models for Smarter, Personalized Emails</li>
                  <li className="flex items-center gap-2"><span>✅</span>Priority Support</li>
                </ul>
                <div className="mt-auto">
                  <div className="text-3xl font-bold mb-2">Coming Soon</div>
                  <Button className="w-full" disabled>Upgrade (Coming Soon)</Button>
                </div>
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