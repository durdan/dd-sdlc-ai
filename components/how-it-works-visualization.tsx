"use client"

import { ArrowDown, FileText, Bot, Merge, Globe, GitBranch, CheckCircle } from "lucide-react"

export function HowItWorksVisualization() {
  const steps = [
    {
      id: 1,
      title: "User submits input (bug/feature/business case)",
      description: "Describe your project requirements in natural language",
      icon: <FileText className="h-6 w-6" />,
      color: "bg-blue-500",
    },
    {
      id: 2,
      title: "Classify input & select template",
      description: "AI analyzes your input and selects the appropriate SDLC template",
      icon: <Bot className="h-6 w-6" />,
      color: "bg-purple-500",
    },
    {
      id: 3,
      title: "Business Analyst Research (GenAI)",
      description: "Generate comprehensive business analysis and requirements",
      icon: <FileText className="h-6 w-6" />,
      color: "bg-green-500",
    },
    {
      id: 4,
      title: "Parallel Specification Generation",
      description: "Create functional, technical, and UX specifications simultaneously",
      icon: <Merge className="h-6 w-6" />,
      color: "bg-orange-500",
      isParallel: true,
      subSteps: ["Functional Spec (GenAI)", "UX Spec (GenAI)", "Technical Spec (GenAI)", "Generate Mermaid Diagrams"],
    },
    {
      id: 5,
      title: "Merge All Packs",
      description: "Combine all generated specifications into a cohesive package",
      icon: <Merge className="h-6 w-6" />,
      color: "bg-indigo-500",
    },
    {
      id: 6,
      title: "Prepare Confluence Content",
      description: "Format and structure content for documentation platform",
      icon: <Globe className="h-6 w-6" />,
      color: "bg-teal-500",
    },
    {
      id: 7,
      title: "Create Documentation & Project",
      description: "Generate Confluence page and JIRA epic simultaneously",
      icon: <GitBranch className="h-6 w-6" />,
      color: "bg-red-500",
      isParallel: true,
      subSteps: ["Create Confluence Page", "Create JIRA Epic"],
    },
    {
      id: 8,
      title: "Return links & summary to user",
      description: "Deliver complete project documentation with direct links",
      icon: <CheckCircle className="h-6 w-6" />,
      color: "bg-emerald-500",
    },
  ]

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 rounded-lg">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">SDLC Automation Process</h2>
          <p className="text-gray-300">From idea to complete project documentation in minutes</p>
        </div>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              {/* Main Step */}
              <div className="flex items-start gap-4">
                {/* Step Number & Icon */}
                <div className="flex flex-col items-center">
                  <div className={`${step.color} rounded-full p-3 text-white shadow-lg`}>{step.icon}</div>
                  <div className="bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mt-2">
                    {step.id}
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-300 text-sm">{step.description}</p>

                  {/* Parallel Sub-steps */}
                  {step.isParallel && step.subSteps && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {step.subSteps.map((subStep, subIndex) => (
                        <div key={subIndex} className="bg-gray-700 rounded p-3 text-center">
                          <div className="text-sm font-medium">{subStep}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Arrow to next step */}
              {index < steps.length - 1 && (
                <div className="flex justify-center my-4">
                  <ArrowDown className="h-6 w-6 text-gray-500" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Flow Diagram Section */}
        <div className="mt-12 mb-12">
          <h3 className="text-xl font-bold text-center mb-6">Process Flow Diagram</h3>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jXhlWGnkYHOwvMEgAIj39ZflX08zZI.png"
              alt="SDLC Automation Process Flow Diagram"
              className="w-full h-auto rounded-lg"
            />
          </div>
          <p className="text-center text-gray-300 text-sm mt-4">
            Visual representation of the complete SDLC automation workflow showing parallel processing and integration
            points
          </p>
        </div>

        {/* Key Benefits */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
            <div className="bg-blue-500 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-semibold mb-2">AI-Powered</h4>
            <p className="text-gray-300 text-sm">Advanced AI generates comprehensive documentation automatically</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
            <div className="bg-green-500 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <Merge className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-semibold mb-2">Parallel Processing</h4>
            <p className="text-gray-300 text-sm">Multiple specifications generated simultaneously for efficiency</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
            <div className="bg-purple-500 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <GitBranch className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-semibold mb-2">Integrated Workflow</h4>
            <p className="text-gray-300 text-sm">Seamless integration with JIRA and Confluence platforms</p>
          </div>
        </div>

        {/* Process Stats */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h4 className="font-semibold mb-4 text-center">Process Efficiency</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">~5 min</div>
              <div className="text-sm text-gray-300">Total Process Time</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">4</div>
              <div className="text-sm text-gray-300">Documents Generated</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">2</div>
              <div className="text-sm text-gray-300">Platforms Integrated</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">80%</div>
              <div className="text-sm text-gray-300">Time Saved</div>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6">
            <h4 className="font-semibold mb-2">Ready to Get Started?</h4>
            <p className="text-gray-200 text-sm mb-4">
              Simply describe your project requirements and let AI handle the rest
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-200">
              <span>💡 Tip: Be as detailed as possible in your initial description for best results</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
