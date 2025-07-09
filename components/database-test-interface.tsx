"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, FileText, Play, Loader2 } from "lucide-react"
import { AIIntegrationService } from '@/lib/database/ai-integration-service'

interface DatabaseTestInterfaceProps {
  user: any
}

export function DatabaseTestInterface({ user }: DatabaseTestInterfaceProps) {
  const [testResults, setTestResults] = useState<{ [key: string]: { success: boolean; message: string; details?: any } }>({})
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const runIndividualTest = async (testName: string) => {
    addLog(`Running ${testName}...`)
    try {
      let result;
      
      // Handle methods that require userId parameter
      const methodsNeedingUserId = ['testCRUDOperations', 'testUserConfigOperations', 'testHelperFunctions'];
      
      if (methodsNeedingUserId.includes(testName)) {
        const userId = user?.id || crypto.randomUUID(); // Use actual user ID or generate test UUID
        result = await (AIIntegrationService[testName as keyof typeof AIIntegrationService] as any)(userId);
      } else {
        result = await (AIIntegrationService[testName as keyof typeof AIIntegrationService] as any)();
      }
      
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: true, message: 'Test passed', details: result }
      }))
      addLog(`✅ ${testName} passed`)
    } catch (error: any) {
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: false, message: error.message || 'Test failed' }
      }))
      addLog(`❌ ${testName} failed: ${error.message}`)
    }
  }

  const runAllTests = async () => {
    setIsRunningTests(true)
    setTestResults({})
    setLogs([])
    addLog('Starting comprehensive database tests...')

    try {
      const results = await AIIntegrationService.runComprehensiveTests()
      setTestResults(results)
      addLog('All tests completed!')
    } catch (error: any) {
      addLog(`❌ Test suite failed: ${error.message}`)
    } finally {
      setIsRunningTests(false)
    }
  }

  const availableTests = [
    'testDatabaseConnection',
    'testSchemaExists', 
    'testTablesExist',
    'testHelperFunctions',
    'testAIProviderOperations',
    'testUserConfigOperations',
    'testCRUDOperations',
    'testSampleDataExists',
    'getSampleDataSummary'
  ]

  return (
    <div className="space-y-6">
      {/* Test Controls */}
      <div className="flex flex-wrap gap-3">
        <Button 
          onClick={runAllTests} 
          disabled={isRunningTests}
          className="flex items-center space-x-2"
        >
          {isRunningTests ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          <span>Run All Tests</span>
        </Button>
        
        {availableTests.map(testName => (
          <Button
            key={testName}
            onClick={() => runIndividualTest(testName)}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            {testName.replace('test', '').replace(/([A-Z])/g, ' $1').trim()}
          </Button>
        ))}
      </div>

      {/* Test Results Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(testResults).map(([testName, result]) => (
          <Card key={testName} className={`border-l-4 ${result.success ? 'border-l-green-500' : 'border-l-red-500'}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center space-x-2">
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span>{testName.replace('test', '').replace(/([A-Z])/g, ' $1').trim()}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{result.message}</p>
              {result.details && (
                <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Test Logs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-xs max-h-64 overflow-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Run tests to see output...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expected Schema Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Expected Database Schema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-gray-600 space-y-2">
            <p><strong>Tables:</strong> sdlc_ai_providers, sdlc_user_ai_configurations, sdlc_ai_tasks, sdlc_github_integrations, sdlc_code_generations, sdlc_task_executions, sdlc_pull_requests, sdlc_api_key_rotations, sdlc_provider_usage_logs, sdlc_security_audit_logs, sdlc_task_dependencies, sdlc_automation_rules, sdlc_code_review_feedback</p>
            <p><strong>Views:</strong> ai_provider_stats, user_activity_summary, task_performance_metrics</p>
            <p><strong>Functions:</strong> encrypt_api_key(), decrypt_api_key(), log_api_usage(), get_user_usage_stats()</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 