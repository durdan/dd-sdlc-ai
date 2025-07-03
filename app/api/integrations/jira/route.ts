import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { 
      config, 
      projectData, 
      documents,
      projectName,
      description 
    } = await req.json()

    console.log('🔥 JIRA Integration Request:', { 
      hasConfig: !!config, 
      projectName, 
      hasDocuments: !!documents 
    })

    // Validate Jira configuration
    if (!config?.jiraUrl || !config?.jiraProject || !config?.jiraEmail || !config?.jiraToken) {
      console.error('❌ Missing Jira configuration')
      return NextResponse.json({ 
        success: false, 
        error: 'Missing Jira configuration (URL, Project Key, Email, or API Token)' 
      }, { status: 400 })
    }

    const jiraBase = config.jiraUrl.replace(/\/$/, '')
    const auth = Buffer.from(`${config.jiraEmail}:${config.jiraToken}`).toString('base64')
    
    console.log('🔧 Jira Config:', { 
      url: jiraBase, 
      project: config.jiraProject, 
      email: config.jiraEmail 
    })

    const createdIssues = []

    // Validate and debug project configuration first
    console.log('🔍 Validating Jira configuration:')
    console.log('- Jira URL:', config.jiraUrl)
    console.log('- Project Key:', config.jiraProject)
    console.log('- Email:', config.jiraEmail)
    console.log('- Token length:', config.jiraToken?.length || 0)
    
    // Test project accessibility before creating issues
    try {
      console.log('🔍 Testing project accessibility...')
      const projectResponse = await fetch(`${jiraBase}/rest/api/3/project/${config.jiraProject}`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (!projectResponse.ok) {
        const projectError = await projectResponse.text()
        console.error('❌ Project validation failed:', projectError)
        return NextResponse.json({ 
          success: false, 
          error: `Cannot access project '${config.jiraProject}': ${projectError}. Please verify the project key exists and you have permission to access it.` 
        })
      }
      
      const projectInfo = await projectResponse.json()
      console.log('✅ Project validated:', projectInfo.name, '- Key:', projectInfo.key)
    } catch (error) {
      console.error('❌ Project validation error:', error)
      return NextResponse.json({ 
        success: false, 
        error: `Project validation failed: ${error.message}` 
      })
    }

    // Create Epic for the project if auto-create is enabled
    if (config.jiraAutoCreate) {
      try {
        console.log('🎯 Creating Jira Epic...')
        
        // Get available issue types for the project
        console.log('🔍 Fetching available issue types...')
        const issueTypesResponse = await fetch(`${jiraBase}/rest/api/3/project/${config.jiraProject}`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          }
        })
        
        let availableIssueTypes = []
        if (issueTypesResponse.ok) {
          const projectData = await issueTypesResponse.json()
          availableIssueTypes = projectData.issueTypes?.map(it => it.name) || []
          console.log('📋 Available issue types:', availableIssueTypes)
        }
        
        // Determine the best issue type to use
        let issueTypeName = 'Task' // Default fallback
        if (availableIssueTypes.includes('Epic')) {
          issueTypeName = 'Epic'
        } else if (availableIssueTypes.includes('Story')) {
          issueTypeName = 'Story'
        } else if (availableIssueTypes.includes('User Story')) {
          issueTypeName = 'User Story'
        } else if (availableIssueTypes.length > 0) {
          issueTypeName = availableIssueTypes[0] // Use first available type
        }
        
        console.log(`🎯 Using issue type: ${issueTypeName}`)
        
        // Sanitize project name to remove newlines and limit length
        const sanitizedProjectName = (projectName || 'SDLC Project')
          .replace(/[\r\n]+/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 200)
        
        // Create a comprehensive Epic description from available SDLC content
        let epicDescription = description || ''
        if (!epicDescription && documents) {
          // Build description from available SDLC documents
          const contentSummary = []
          if (documents.businessAnalysis) {
            contentSummary.push(`Business Analysis: ${documents.businessAnalysis.substring(0, 200)}...`)
          }
          if (documents.functionalSpec) {
            contentSummary.push(`Functional Spec: ${documents.functionalSpec.substring(0, 200)}...`)
          }
          if (documents.technicalSpec) {
            contentSummary.push(`Technical Spec: ${documents.technicalSpec.substring(0, 200)}...`)
          }
          if (documents.uxSpec) {
            contentSummary.push(`UX Spec: ${documents.uxSpec.substring(0, 200)}...`)
          }
          epicDescription = contentSummary.join('\n\n') || `Project for ${sanitizedProjectName} - auto-generated by SDLC Automation Platform`
        }
        
        const sanitizedDescription = epicDescription
          .replace(/[\r\n]+/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 1500) // Increased limit for Epic description
        
        // Create the main issue (Epic/Story/Task)
        let epicPayload = {
          fields: {
            project: { key: config.jiraProject },
            summary: `[${issueTypeName.toUpperCase()}] ${sanitizedProjectName}`,
            description: {
              type: "doc",
              version: 1,
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: sanitizedDescription
                    }
                  ]
                }
              ]
            },
            issuetype: { name: issueTypeName }
          }
        }

        let epicResponse = await fetch(`${jiraBase}/rest/api/3/issue`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(epicPayload)
        })

        if (!epicResponse.ok) {
          const epicError = await epicResponse.text()
          console.error(`❌ ${issueTypeName} creation failed:`, epicError)
          throw new Error(`Issue creation failed: ${epicError}`)
        }
        
        console.log(`✅ ${issueTypeName} created successfully`)

        const epic = await epicResponse.json()
        console.log('✅ Epic created:', epic.key)
        createdIssues.push({
          type: 'Epic',
          key: epic.key,
          url: `${jiraBase}/browse/${epic.key}`,
          summary: epicPayload.fields.summary
        })

        // Helper function to convert markdown to Jira markup
        const convertToJiraMarkup = (content: string): string => {
          if (!content) return ''
          
          return content
            // Convert markdown headers to Jira headers
            .replace(/^### (.*$)/gm, 'h3. $1')
            .replace(/^## (.*$)/gm, 'h2. $1')
            .replace(/^# (.*$)/gm, 'h1. $1')
            // Convert markdown bold to Jira bold
            .replace(/\*\*(.*?)\*\*/g, '*$1*')
            // Convert markdown italic to Jira italic
            .replace(/\*(.*?)\*/g, '_$1_')
            // Convert markdown code blocks to Jira code blocks
            .replace(/```([\s\S]*?)```/g, '{code}$1{code}')
            // Convert markdown inline code to Jira monospace
            .replace(/`([^`]+)`/g, '{{$1}}')
            // Convert markdown lists to Jira lists
            .replace(/^\* (.*$)/gm, '* $1')
            .replace(/^- (.*$)/gm, '* $1')
            // Convert numbered lists
            .replace(/^\d+\. (.*$)/gm, '# $1')
            // Clean up extra whitespace
            .replace(/\n\s*\n/g, '\n\n')
            .trim()
        }

        // Create Stories for main SDLC areas (if Story type is available)
        const storyTypes = [
          { 
            doc: 'businessAnalysis', 
            title: 'Business Analysis & Requirements', 
            type: availableIssueTypes.includes('Story') ? 'Story' : 'Task',
            tasks: [
              { title: 'Requirements Gathering', content: 'businessAnalysis' },
              { title: 'Stakeholder Analysis', content: 'businessAnalysis' }
            ]
          },
          { 
            doc: 'functionalSpec', 
            title: 'Functional Specification', 
            type: availableIssueTypes.includes('Story') ? 'Story' : 'Task',
            tasks: [
              { title: 'Feature Definition', content: 'functionalSpec' },
              { title: 'User Stories', content: 'functionalSpec' }
            ]
          },
          { 
            doc: 'technicalSpec', 
            title: 'Technical Implementation', 
            type: availableIssueTypes.includes('Story') ? 'Story' : 'Task',
            tasks: [
              { title: 'Architecture Design', content: 'technicalSpec' },
              { title: 'Technical Implementation', content: 'technicalSpec' }
            ]
          },
          { 
            doc: 'uxSpec', 
            title: 'UX/UI Design', 
            type: availableIssueTypes.includes('Story') ? 'Story' : 'Task',
            tasks: [
              { title: 'UI/UX Design', content: 'uxSpec' },
              { title: 'User Experience Testing', content: 'uxSpec' }
            ]
          }
        ]

        for (const storyType of storyTypes) {
          if (documents && documents[storyType.doc]) {
            console.log(`📖 Creating ${storyType.type} for ${storyType.title}...`)
            
            // Create Story with rich Jira markup content
            const storyContent = convertToJiraMarkup(documents[storyType.doc])
            const storySummary = `${storyType.title} - ${sanitizedProjectName}`
              .replace(/[\r\n]+/g, ' ')
              .trim()
              .substring(0, 200)
            
            const storyPayload = {
              fields: {
                project: { key: config.jiraProject },
                summary: storySummary,
                description: storyContent.substring(0, 32000), // Jira limit
                issuetype: { name: storyType.type },
                // Link to Epic if possible
                ...(issueTypeName === 'Epic' && availableIssueTypes.includes('Story') ? {
                  customfield_10014: epic.key // Epic Link field (common field ID)
                } : {})
              }
            }

            const storyResponse = await fetch(`${jiraBase}/rest/api/3/issue`, {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(storyPayload)
            })

            if (storyResponse.ok) {
              const story = await storyResponse.json()
              console.log(`✅ ${storyType.type} created:`, story.key)
              createdIssues.push({
                type: storyType.type,
                key: story.key,
                url: `${jiraBase}/browse/${story.key}`,
                summary: storySummary
              })

              // Create Tasks under this Story
              for (const task of storyType.tasks) {
                console.log(`🎯 Creating task: ${task.title}...`)
                
                const taskSummary = `${task.title} - ${sanitizedProjectName}`
                  .replace(/[\r\n]+/g, ' ')
                  .trim()
                  .substring(0, 200)
                
                // Extract relevant portion of content for this task
                const taskContent = convertToJiraMarkup(
                  documents[task.content]?.substring(0, 1000) || 
                  `${task.title} implementation details for ${sanitizedProjectName}`
                )
                
                const taskPayload = {
                  fields: {
                    project: { key: config.jiraProject },
                    summary: taskSummary,
                    description: `h3. Related to ${storyType.type}: ${story.key}\n\n${taskContent}`,
                    issuetype: { name: 'Task' },
                    // Link to parent Story if possible
                    ...(availableIssueTypes.includes('Sub-task') ? {
                      parent: { key: story.key }
                    } : {})
                  }
                }

                const taskResponse = await fetch(`${jiraBase}/rest/api/3/issue`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(taskPayload)
                })

                if (taskResponse.ok) {
                  const taskResult = await taskResponse.json()
                  console.log(`✅ Task created: ${taskResult.key}`)
                  createdIssues.push({
                    type: 'Task',
                    key: taskResult.key,
                    url: `${jiraBase}/browse/${taskResult.key}`,
                    summary: taskSummary
                  })
                } else {
                  const taskError = await taskResponse.text()
                  console.error(`❌ Task creation failed for ${task.title}:`, taskError)
                }
              }
            } else {
              const storyError = await storyResponse.text()
              console.error(`❌ ${storyType.type} creation failed for ${storyType.title}:`, storyError)
            }
          }
        }

      } catch (error) {
        console.error('❌ Jira Epic/Task creation error:', error)
        return NextResponse.json({ 
          success: false, 
          error: `Jira integration failed: ${error.message}` 
        }, { status: 500 })
      }
    }

    console.log('🎉 Jira integration completed:', createdIssues)

    return NextResponse.json({
      success: true,
      message: `Successfully created ${createdIssues.length} Jira issues`,
      issues: createdIssues,
      jiraProjectUrl: `${jiraBase}/projects/${config.jiraProject}`
    })

  } catch (error) {
    console.error('❌ Jira integration error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Unknown error occurred' 
    }, { status: 500 })
  }
}
