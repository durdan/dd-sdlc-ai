import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Shield, 
  Eye, 
  Database, 
  Cookie, 
  Mail, 
  Globe, 
  Lock,
  ArrowLeft,
  AlertTriangle,
  Users,
  FileText,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy - SDLC.dev',
  description: 'Privacy Policy for SDLC.dev - AI-Powered Development Lifecycle Platform. GDPR compliant data protection and privacy practices.',
}

export default function PrivacyPage() {
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
                  style={{ 
                    maxWidth: 'none'  // Override Tailwind's max-width: 100%
                  }}
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
            <Shield className="h-4 w-4 mr-2" />
            GDPR Compliant
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            Privacy{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-transparent">
              Policy
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Your privacy is important to us. This policy explains how we collect, use, and protect your data.
          </p>
          
          <div className="mt-6 text-sm text-gray-400">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>Effective date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Experimental Platform Notice */}
        <Card className="bg-amber-900/20 border-amber-800/30 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-300">
              <AlertTriangle className="h-5 w-5" />
              Experimental Platform Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-amber-200">
              <p className="leading-relaxed">
                <strong>Important:</strong> SDLC.dev is an experimental platform provided for research and development purposes. 
                This Privacy Policy applies to our experimental services and may be updated frequently as we develop new features.
              </p>
              <p className="text-sm">
                By using SDLC.dev, you acknowledge that this is an experimental platform and consent to the data practices described in this policy.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Controller Information */}
        <Card className="bg-gray-900/50 border-gray-800/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Users className="h-5 w-5 text-blue-400" />
              Data Controller Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-300">
              <p><strong>Service:</strong> SDLC.dev (Experimental AI-Powered Development Lifecycle Platform)</p>
              <p><strong>Nature:</strong> Experimental research and development platform</p>
              <p><strong>Purpose:</strong> Testing and developing AI-powered SDLC automation tools</p>
              <p><strong>Contact:</strong> For privacy-related inquiries, please contact us through our platform</p>
            </div>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card className="bg-gray-900/50 border-gray-800/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Database className="h-5 w-5 text-green-400" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 text-gray-300">
              <div>
                <h4 className="font-semibold text-white mb-3">1. Account Information</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Email address (for authentication)</li>
                  <li>Name (if provided)</li>
                  <li>Authentication tokens from third-party services (GitHub, Google, etc.)</li>
                  <li>Profile information from connected accounts</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">2. Usage Data</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Project requirements and descriptions you input</li>
                  <li>Generated documentation and AI responses</li>
                  <li>Integration configurations (JIRA, Confluence, etc.)</li>
                  <li>Usage patterns and feature interactions</li>
                  <li>Error logs and performance metrics</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">3. Technical Data</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>IP address and location data</li>
                  <li>Browser type and version</li>
                  <li>Device information and screen resolution</li>
                  <li>Operating system</li>
                  <li>Referrer URLs</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">4. Cookies and Similar Technologies</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Essential cookies for authentication and security</li>
                  <li>Analytics cookies to understand platform usage</li>
                  <li>Preference cookies to remember your settings</li>
                  <li>Performance cookies to optimize loading times</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card className="bg-gray-900/50 border-gray-800/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Settings className="h-5 w-5 text-purple-400" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 text-gray-300">
              <div>
                <h4 className="font-semibold text-white mb-3">Legal Basis for Processing (GDPR)</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Consent:</strong> AI model training and improvement</li>
                  <li><strong>Legitimate Interest:</strong> Platform security and performance optimization</li>
                  <li><strong>Contract Performance:</strong> Providing the experimental services</li>
                  <li><strong>Legal Obligation:</strong> Compliance with applicable laws</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">Specific Uses</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Generate AI-powered documentation and responses</li>
                  <li>Provide integrations with third-party services</li>
                  <li>Improve our AI models and algorithms</li>
                  <li>Analyze usage patterns to enhance the platform</li>
                  <li>Ensure platform security and prevent abuse</li>
                  <li>Provide customer support and troubleshooting</li>
                  <li>Send important service updates and notifications</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Sharing and Third Parties */}
        <Card className="bg-gray-900/50 border-gray-800/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Globe className="h-5 w-5 text-yellow-400" />
              Data Sharing and Third Parties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-300">
              <p><strong>AI Service Providers:</strong> We share your input data with AI service providers (OpenAI, Anthropic) to generate responses. These providers have their own privacy policies.</p>
              
              <p><strong>Integration Partners:</strong> When you connect third-party services (JIRA, Confluence, GitHub), we share relevant data to provide integration functionality.</p>
              
              <p><strong>Analytics Services:</strong> We may use analytics services to understand platform usage patterns.</p>
              
              <p><strong>Legal Requirements:</strong> We may disclose data if required by law or to protect our rights and safety.</p>
              
              <p><strong>No Data Sales:</strong> We do not sell, rent, or trade your personal data to third parties for marketing purposes.</p>
            </div>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card className="bg-gray-900/50 border-gray-800/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <FileText className="h-5 w-5 text-red-400" />
              Data Retention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-300">
              <p><strong>Account Data:</strong> Retained while your account is active and for 30 days after deletion.</p>
              
              <p><strong>Generated Content:</strong> Retained for platform improvement and may be used for AI model training.</p>
              
              <p><strong>Usage Analytics:</strong> Aggregated and anonymized data may be retained indefinitely for research purposes.</p>
              
              <p><strong>Legal Requirements:</strong> Some data may be retained longer to comply with legal obligations.</p>
              
              <p><strong>Experimental Data:</strong> As an experimental platform, some data may be retained for ongoing research and development.</p>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights (GDPR) */}
        <Card className="bg-gray-900/50 border-gray-800/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Lock className="h-5 w-5 text-blue-400" />
              Your Rights Under GDPR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-300">
              <p>If you are in the European Economic Area (EEA), you have the following rights:</p>
              
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Access:</strong> Request access to your personal data</li>
                <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
                <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Restriction:</strong> Request restriction of processing</li>
                <li><strong>Objection:</strong> Object to processing based on legitimate interest</li>
                <li><strong>Consent Withdrawal:</strong> Withdraw consent for specific processing activities</li>
              </ul>
              
              <p className="mt-4">
                <strong>Note:</strong> As an experimental platform, some rights may be limited by our research and development needs, but we will honor all requests to the fullest extent possible.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cookies Policy */}
        <Card className="bg-gray-900/50 border-gray-800/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Cookie className="h-5 w-5 text-orange-400" />
              Cookies Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-300">
              <p>We use cookies and similar technologies to:</p>
              
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Essential Cookies:</strong> Authentication, security, and basic functionality</li>
                <li><strong>Analytics Cookies:</strong> Understand how you use our platform</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Performance Cookies:</strong> Optimize loading times and performance</li>
              </ul>
              
              <p>You can manage cookie preferences through your browser settings. Note that disabling certain cookies may affect platform functionality.</p>
              
              <p>Our cookie consent banner allows you to accept or reject non-essential cookies in compliance with EU regulations.</p>
            </div>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="bg-gray-900/50 border-gray-800/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="h-5 w-5 text-green-400" />
              Data Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-300">
              <p>We implement appropriate technical and organizational security measures:</p>
              
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Encryption in transit and at rest</li>
                <li>Access controls and authentication</li>
                <li>Regular security audits and monitoring</li>
                <li>Secure hosting infrastructure</li>
                <li>Employee training on data protection</li>
              </ul>
              
              <p><strong>Data Breach Notification:</strong> We will notify affected users and relevant authorities within 72 hours of discovering a data breach, as required by GDPR.</p>
            </div>
          </CardContent>
        </Card>

        {/* International Data Transfers */}
        <Card className="bg-gray-900/50 border-gray-800/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Globe className="h-5 w-5 text-purple-400" />
              International Data Transfers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-300">
              <p>Your data may be transferred to and processed in countries outside the EEA, including the United States, for the following services:</p>
              
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>AI Services:</strong> OpenAI, Anthropic (Claude)</li>
                <li><strong>Cloud Infrastructure:</strong> Hosting and storage providers</li>
                <li><strong>Analytics:</strong> Usage analytics services</li>
              </ul>
              
              <p>We ensure adequate protection through:</p>
              
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Standard Contractual Clauses (SCCs)</li>
                <li>Privacy Shield frameworks where applicable</li>
                <li>Adequacy decisions by the European Commission</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Changes to This Policy */}
        <Card className="bg-gray-900/50 border-gray-800/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Mail className="h-5 w-5 text-pink-400" />
              Changes to This Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-300">
              <p>As an experimental platform, this Privacy Policy may be updated frequently. We will:</p>
              
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Post updates on this page with the effective date</li>
                <li>Notify users of significant changes via email or platform notifications</li>
                <li>Provide 30 days notice for material changes where possible</li>
                <li>Archive previous versions for reference</li>
              </ul>
              
              <p>Continued use of the platform after changes constitutes acceptance of the updated policy.</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-gray-900/50 border-gray-800/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Mail className="h-5 w-5 text-blue-400" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-300">
              <p>For questions about this Privacy Policy or to exercise your rights, please contact us:</p>
              
              <div className="space-y-2 ml-4">
                <p><strong>Platform:</strong> Use the contact form within SDLC.dev</p>
                <p><strong>Subject:</strong> Privacy Policy Inquiry</p>
                <p><strong>Response Time:</strong> We aim to respond within 72 hours</p>
              </div>
              
              <p className="text-sm text-gray-400 mt-6">
                <strong>Data Protection Officer:</strong> As an experimental platform, we do not currently have a designated DPO, but privacy inquiries are handled by our development team.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-gray-800/50">
          <p className="text-gray-400 text-sm">
            This Privacy Policy is designed to comply with GDPR and other applicable privacy laws.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            SDLC.dev - Experimental AI-Powered Development Lifecycle Platform
          </p>
        </div>
      </div>
    </div>
  )
} 