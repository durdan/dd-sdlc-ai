import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Shield, 
  AlertTriangle, 
  Scale, 
  FileText, 
  Users, 
  Lock,
  ArrowLeft,
  ExternalLink,
  Zap,
  Ban,
  Clock,
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service - SDLC.dev',
  description: 'Terms of Service for SDLC.dev - AI-Powered Development Lifecycle Platform. Legal terms and conditions for using our experimental platform.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <img 
                  src="/img/logo-sdlc-white.png" 
                  alt="SDLC.dev Logo" 
                  className="h-16 w-auto" 
                />
                <div className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-transparent font-black text-xl">
                  SDLC.dev
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-blue-900/20 border border-blue-800/30 rounded-full text-blue-300 text-sm mb-6">
            <Scale className="h-4 w-4 mr-2" />
            Legal Terms
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            Terms of{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-transparent">
              Service
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Please read these terms carefully before using our experimental AI-powered development platform.
          </p>
          
          <div className="mt-6 text-sm text-gray-400">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>Effective date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Experimental Platform Warning */}
        <Card className="bg-red-900/20 border-red-800/30 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-300">
              <AlertTriangle className="h-5 w-5" />
              Experimental Platform Warning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-red-200">
              <p className="leading-relaxed">
                <strong>CRITICAL NOTICE:</strong> SDLC.dev is an experimental research platform provided "AS IS" without warranties of any kind. 
                By using this platform, you acknowledge and accept:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Services may be interrupted, modified, or discontinued at any time</li>
                <li>No guarantees of data integrity, availability, or performance</li>
                <li>Features are provided for experimentation and testing purposes only</li>
                <li>Not suitable for production or mission-critical applications</li>
                <li>Use at your own risk with no liability on our part</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Acceptance of Terms */}
        <Card className="bg-gray-900/50 border-gray-800/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <FileText className="h-5 w-5 text-blue-400" />
              Acceptance of Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-300">
              <p>By accessing, using, or creating an account on SDLC.dev, you agree to be bound by these Terms of Service and our Privacy Policy.</p>
              
              <p>If you do not agree to these terms, you must not use our platform.</p>
              
              <p><strong>Capacity:</strong> You represent that you have the legal authority to enter into these terms and are at least 16 years old (or the age of majority in your jurisdiction).</p>
              
              <p><strong>Updates:</strong> We reserve the right to modify these terms at any time. Changes will be posted on this page with an updated effective date.</p>
            </div>
          </CardContent>
        </Card>

        {/* Description of Service */}
        <Card className="bg-gray-900/50 border-gray-800/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Zap className="h-5 w-5 text-yellow-400" />
              Description of Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-300">
              <p>SDLC.dev is an experimental AI-powered platform that provides:</p>
              
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>AI-generated software development lifecycle documentation</li>
                <li>Integration with third-party development tools (JIRA, Confluence, GitHub)</li>
                <li>Project management and workflow automation features</li>
                <li>Experimental AI services and research functionalities</li>
              </ul>
              
              <p><strong>Experimental Nature:</strong> All features are provided for research, testing, and experimentation purposes. The platform is not intended for production use or commercial applications.</p>
              
              <p><strong>No Service Level Agreement:</strong> We do not provide any guarantees regarding uptime, performance, or availability.</p>
            </div>
          </CardContent>
        </Card>

        {/* User Responsibilities */}
        <Card className="bg-gray-900/50 border-gray-800/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Users className="h-5 w-5 text-green-400" />
              User Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-300">
              <p>As a user of SDLC.dev, you agree to:</p>
              
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate and truthful information</li>
                <li>Keep your account credentials secure</li>
                <li>Use the platform only for lawful purposes</li>
                <li>Not attempt to reverse engineer or hack the platform</li>
                <li>Not use the service for any commercial purposes without permission</li>
                <li>Respect intellectual property rights</li>
                <li>Not upload malicious code or content</li>
                <li>Report security vulnerabilities responsibly</li>
              </ul>
              
              <p><strong>Account Security:</strong> You are responsible for all activities that occur under your account. Notify us immediately of any unauthorized use.</p>
            </div>
          </CardContent>
        </Card>

        {/* Prohibited Uses */}
        <Card className="bg-gray-900/50 border-gray-800/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Ban className="h-5 w-5 text-red-400" />
              Prohibited Uses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-300">
              <p>You may not use SDLC.dev for:</p>
              
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Any illegal activities or violations of applicable laws</li>
                <li>Harassment, abuse, or harm to others</li>
                <li>Spam, phishing, or fraudulent activities</li>
                <li>Distributing malware or malicious content</li>
                <li>Attempting to gain unauthorized access to systems</li>
                <li>Violating intellectual property rights</li>
                <li>Commercial use without explicit permission</li>
                <li>Automated scraping or data harvesting</li>
                <li>Overloading or disrupting our services</li>
              </ul>
              
              <p><strong>Consequences:</strong> Violation of these terms may result in immediate account suspension or termination.</p>
            </div>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="bg-gray-900/50 border-gray-800/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Lock className="h-5 w-5 text-purple-400" />
              Intellectual Property
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-300">
              <div>
                <h4 className="font-semibold text-white mb-3">Our Rights</h4>
                <p>SDLC.dev and its original content, features, and functionality are owned by us and are protected by intellectual property laws.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-3">User Content</h4>
                <p>You retain ownership of your input data and project requirements. However, by using our platform, you grant us a non-exclusive, royalty-free license to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Process your data to provide services</li>
                  <li>Use anonymized data for research and improvement</li>
                  <li>Generate AI responses based on your input</li>
                  <li>Store and backup your data for service provision</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-3">AI-Generated Content</h4>
                <p>AI-generated documentation and responses are provided "as is" without any ownership claims. You may use this content according to the terms of the underlying AI service providers.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Third-Party Services */}
        <Card className="bg-gray-900/50 border-gray-800/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <ExternalLink className="h-5 w-5 text-blue-400" />
              Third-Party Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-300">
              <p>SDLC.dev integrates with various third-party services:</p>
              
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>AI Services:</strong> OpenAI, Anthropic (Claude)</li>
                <li><strong>Authentication:</strong> GitHub, Google, other OAuth providers</li>
                <li><strong>Integrations:</strong> JIRA, Confluence, GitHub Projects</li>
                <li><strong>Analytics:</strong> Usage tracking and performance monitoring</li>
              </ul>
              
              <p><strong>Third-Party Terms:</strong> Your use of these services through our platform is subject to their respective terms of service and privacy policies.</p>
              
              <p><strong>No Endorsement:</strong> We do not endorse or guarantee the performance of third-party services.</p>
              
              <p><strong>Service Interruptions:</strong> Third-party service disruptions may affect platform functionality.</p>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimers and Limitations */}
        <Card className="bg-gray-900/50 border-gray-800/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="h-5 w-5 text-yellow-400" />
              Disclaimers and Limitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-300">
              <div>
                <h4 className="font-semibold text-white mb-3">No Warranties</h4>
                <p>SDLC.dev is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied, including but not limited to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Merchantability or fitness for a particular purpose</li>
                  <li>Non-infringement of third-party rights</li>
                  <li>Accuracy, reliability, or completeness of content</li>
                  <li>Uninterrupted or error-free operation</li>
                  <li>Security or freedom from viruses</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-3">Limitation of Liability</h4>
                <p>To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Loss of profits, data, or business opportunities</li>
                  <li>Service interruptions or delays</li>
                  <li>Errors in AI-generated content</li>
                  <li>Third-party service failures</li>
                  <li>Security breaches or data loss</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-3">Maximum Liability</h4>
                <p>Our total liability for any claims arising from or related to these terms or your use of SDLC.dev shall not exceed $100 USD.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Indemnification */}
        <Card className="bg-gray-900/50 border-gray-800/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Scale className="h-5 w-5 text-green-400" />
              Indemnification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-300">
              <p>You agree to indemnify, defend, and hold harmless SDLC.dev and its affiliates from and against any claims, damages, losses, costs, and expenses arising from or related to:</p>
              
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your use of the platform</li>
                <li>Your violation of these terms</li>
                <li>Your infringement of third-party rights</li>
                <li>Your data or content submitted to the platform</li>
                <li>Your use of AI-generated content</li>
              </ul>
              
              <p>This indemnification obligation will survive termination of these terms.</p>
            </div>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="bg-gray-900/50 border-gray-800/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Clock className="h-5 w-5 text-red-400" />
              Termination
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-300">
              <p><strong>By You:</strong> You may terminate your account at any time by contacting us or using account deletion features.</p>
              
              <p><strong>By Us:</strong> We may terminate or suspend your account immediately, without prior notice, for any reason, including:</p>
              
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violation of these terms</li>
                <li>Suspected illegal activity</li>
                <li>Platform discontinuation</li>
                <li>Technical or security reasons</li>
              </ul>
              
              <p><strong>Effect of Termination:</strong> Upon termination, your right to use the platform ceases immediately. We may retain certain data as described in our Privacy Policy.</p>
              
              <p><strong>No Refunds:</strong> As this is a free experimental platform, no refunds are applicable.</p>
            </div>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card className="bg-gray-900/50 border-gray-800/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Globe className="h-5 w-5 text-blue-400" />
              Governing Law
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-300">
              <p>These terms are governed by and construed in accordance with applicable laws, without regard to conflict of law principles.</p>
              
              <p><strong>Dispute Resolution:</strong> Any disputes will be resolved through binding arbitration rather than court proceedings, except for:</p>
              
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Intellectual property disputes</li>
                <li>Small claims court matters</li>
                <li>Injunctive relief requests</li>
              </ul>
              
              <p><strong>Class Action Waiver:</strong> You waive any right to participate in class action lawsuits or class-wide arbitrations.</p>
            </div>
          </CardContent>
        </Card>

        {/* Miscellaneous */}
        <Card className="bg-gray-900/50 border-gray-800/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <FileText className="h-5 w-5 text-purple-400" />
              Miscellaneous
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-300">
              <p><strong>Entire Agreement:</strong> These terms, together with our Privacy Policy, constitute the entire agreement between you and SDLC.dev.</p>
              
              <p><strong>Severability:</strong> If any provision is found unenforceable, the remaining provisions will continue in full force.</p>
              
              <p><strong>No Waiver:</strong> Our failure to enforce any provision does not constitute a waiver of that provision.</p>
              
              <p><strong>Assignment:</strong> We may assign these terms without notice. You may not assign your rights without our written consent.</p>
              
              <p><strong>Survival:</strong> Provisions that by their nature should survive termination will survive, including intellectual property, indemnification, and liability limitations.</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-gray-900/50 border-gray-800/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Users className="h-5 w-5 text-green-400" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-300">
              <p>For questions about these Terms of Service, please contact us:</p>
              
              <div className="space-y-2 ml-4">
                <p><strong>Platform:</strong> Use the contact form within SDLC.dev</p>
                <p><strong>Subject:</strong> Terms of Service Inquiry</p>
                <p><strong>Response Time:</strong> We aim to respond within 72 hours</p>
              </div>
              
              <p className="text-sm text-gray-400 mt-6">
                <strong>Legal Notices:</strong> For legal notices and formal communications, please use the contact methods provided within the platform.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-gray-800/50">
          <p className="text-gray-400 text-sm">
            These Terms of Service protect both users and SDLC.dev while maintaining transparency about our experimental nature.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            SDLC.dev - Experimental AI-Powered Development Lifecycle Platform
          </p>
        </div>
      </div>
    </div>
  )
} 