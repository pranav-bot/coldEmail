import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Target, Search, PenTool, Send, Briefcase, Code, Rocket } from "lucide-react"
import Link from "next/link"

interface WorkflowDiagramProps {
  userId?: string | null
}

export function WorkflowDiagram({ userId }: WorkflowDiagramProps) {
  const steps = [
    {
      number: 1,
      title: "Define Your Target",
      description: "Tell us who you want to reach: companies, roles, or specific individuals",
      icon: Target,
      tag: "🎯 Target Selection"
    },
    {
      number: 2,
      title: "AI-Powered Research",
      description: "Our AI agent researches your targets, finding key insights and contact info",
      icon: Search,
      tag: "🔍 Smart Analysis"
    },
    {
      number: 3,
      title: "Generate Email",
      description: "AI crafts personalized emails based on research and your objectives",
      icon: PenTool,
      tag: "✍️ Smart Writing"
    },
    {
      number: 4,
      title: "Send & Track",
      description: "Review, send, and track responses. Follow up automatically when needed",
      icon: Send,
      tag: "📧 Smart Outreach"
    }
  ]

  const useCases = [
    {
      title: "Job Seekers",
      description: "Land your dream role",
      icon: Briefcase,
      benefits: [
        "Research hiring managers",
        "Craft compelling pitches",
        "Follow up strategically"
      ],
      outcome: "Get noticed by recruiters"
    },
    {
      title: "Freelancers",
      description: "Win high-value clients",
      icon: Code,
      benefits: [
        "Find ideal prospects",
        "Showcase your expertise",
        "Convert leads to clients"
      ],
      outcome: "Scale your business"
    },
    {
      title: "Founders",
      description: "Secure funding & partnerships",
      icon: Rocket,
      benefits: [
        "Connect with investors",
        "Find strategic partners",
        "Build your network"
      ],
      outcome: "Raise your next round"
    }
  ]

  return (
    <div className="w-full space-y-16">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">How PitchSnag Works</h2>
        <p className="text-muted-foreground">From target research to personalized outreach in 4 simple steps</p>
      </div>

      {/* Main Workflow Steps */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <div key={step.number} className="relative">
              <Card className="h-full bg-card hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 text-center">
                  {/* Step Number */}
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary-foreground font-bold text-lg">{step.number}</span>
                  </div>
                  
                  {/* Icon */}
                  <div className="mb-4">
                    <Icon className="w-8 h-8 mx-auto text-muted-foreground" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="font-semibold text-lg mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{step.description}</p>
                  
                  {/* Tag */}
                  <Badge variant="secondary" className="text-xs">
                    {step.tag}
                  </Badge>
                </CardContent>
              </Card>
              
              {/* Arrow */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-6.5 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-6 h-6 text-primary" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Use Cases Section */}
      <div>
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-2">Perfect For Any Outreach Goal</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {useCases.map((useCase) => {
            const Icon = useCase.icon
            return (
              <Card key={useCase.title} className="bg-card border hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Icon className="w-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{useCase.title}</h4>
                      <p className="text-sm text-muted-foreground">{useCase.description}</p>
                    </div>
                  </div>
                  
                  {/* Benefits */}
                  <ul className="space-y-2 mb-4">
                    {useCase.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  
                  {/* Outcome */}
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-primary" />
                      {useCase.outcome}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      {!userId && (
        <div className="text-center">
          <Link href="/sign-up">
            <Button size="lg">
              Start Your First Workflow
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
