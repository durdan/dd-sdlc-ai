export const meetingTranscriptSections: Record<string, {
  id: string
  name: string
  icon: string
  description: string
  prompt: string
}> = {
  meeting_summary: {
    id: 'meeting_summary',
    name: "Meeting Summary",
    icon: "📝",
    description: "High-level overview and key takeaways",
    prompt: `Create a concise meeting summary including:
- Meeting purpose and objectives
- Key topics discussed
- Main outcomes achieved
- Overall meeting effectiveness
- Executive summary for stakeholders`
  },
  attendees: {
    id: 'attendees',
    name: "Attendees",
    icon: "👥",
    description: "List of participants and their roles",
    prompt: `Document meeting participants:
- Attendee names and titles
- Department/team representation
- Roles in the meeting (facilitator, note-taker, etc.)
- Attendance status (present, absent, partial)
- Contact information if needed`
  },
  agenda_items: {
    id: 'agenda_items',
    name: "Agenda Items",
    icon: "📋",
    description: "Topics discussed and time allocated",
    prompt: `Detail agenda items covered:
- Topic descriptions
- Time allocated vs actual
- Discussion leaders
- Priority levels
- Completion status`
  },
  key_decisions: {
    id: 'key_decisions',
    name: "Key Decisions",
    icon: "✅",
    description: "Decisions made and rationale",
    prompt: `Record key decisions:
- Decision statements
- Rationale and context
- Decision makers
- Impact assessment
- Implementation timeline`
  },
  action_items: {
    id: 'action_items',
    name: "Action Items",
    icon: "🎯",
    description: "Tasks assigned with owners and deadlines",
    prompt: `Track action items:
- Task descriptions
- Assigned owners
- Due dates
- Priority levels
- Dependencies
- Success criteria`
  },
  discussion_points: {
    id: 'discussion_points',
    name: "Discussion Points",
    icon: "💬",
    description: "Detailed discussion notes and insights",
    prompt: `Capture discussion details:
- Key points raised
- Different perspectives shared
- Questions asked and answered
- Concerns expressed
- Ideas generated`
  },
  risks_issues: {
    id: 'risks_issues',
    name: "Risks & Issues",
    icon: "⚠️",
    description: "Identified risks, issues, and concerns",
    prompt: `Identify risks and issues:
- Risk descriptions
- Impact assessment
- Likelihood ratings
- Mitigation strategies
- Issue resolution plans`
  },
  next_steps: {
    id: 'next_steps',
    name: "Next Steps",
    icon: "➡️",
    description: "Follow-up actions and next meeting plans",
    prompt: `Define next steps:
- Immediate next actions
- Follow-up meeting schedule
- Preparation requirements
- Communication plans
- Success metrics`
  },
  parking_lot: {
    id: 'parking_lot',
    name: "Parking Lot",
    icon: "🅿️",
    description: "Topics deferred for future discussion",
    prompt: `Document parking lot items:
- Deferred topics
- Reason for deferment
- Proposed future discussion date
- Required preparation
- Stakeholders involved`
  },
  resources: {
    id: 'resources',
    name: "Resources & Links",
    icon: "🔗",
    description: "Referenced documents and resources",
    prompt: `List referenced resources:
- Document links
- Presentation materials
- Reference websites
- Related projects
- Supporting data sources`
  }
}

const defaultMeetingTranscriptPrompt = `Generate a comprehensive meeting transcript for the following meeting:

Meeting Topic: {{input}}
${`{{business_analysis}}` ? `\nRelated Business Context:\n{{business_analysis}}` : ''}
${`{{functional_spec}}` ? `\nRelated Functional Context:\n{{functional_spec}}` : ''}
${`{{technical_spec}}` ? `\nRelated Technical Context:\n{{technical_spec}}` : ''}

Create a detailed meeting transcript including:

1. **Meeting Header**
   - Date, time, and duration
   - Meeting type and purpose
   - Location/platform

2. **Attendees**
   - Participants list with roles
   - Apologies and absences
   - Meeting roles (chair, scribe)

3. **Agenda Review**
   - Planned agenda items
   - Time allocations
   - Objectives for each item

4. **Discussion Summary**
   - Key topics discussed
   - Main points raised
   - Questions and answers

5. **Decisions Made**
   - Decision statements
   - Voting results if applicable
   - Rationale documented

6. **Action Items**
   - Tasks assigned
   - Responsible parties
   - Due dates
   - Dependencies

7. **Risks and Issues**
   - New risks identified
   - Issue escalations
   - Mitigation plans

8. **Next Steps**
   - Follow-up actions
   - Next meeting schedule
   - Preparation required

9. **Parking Lot**
   - Deferred items
   - Future discussion topics

10. **Attachments**
    - Referenced documents
    - Presentation materials
    - Supporting resources

Format as a professional meeting transcript with clear sections and actionable outcomes.`

export function generateCombinedMeetingTranscript(selectedSections: string[], context: {
  input: string
  business_analysis?: string
  functional_spec?: string
  technical_spec?: string
}): string {
  if (selectedSections.length === 0) {
    return defaultMeetingTranscriptPrompt
  }

  const sections = selectedSections.map(id => meetingTranscriptSections[id]).filter(Boolean)
  
  const combinedPrompt = `As a Professional Meeting Facilitator and Scribe, create a comprehensive meeting transcript covering multiple aspects.

Meeting Topic/Context: {{input}}
${context.business_analysis ? `Business Context: {{business_analysis}}` : ''}
${context.functional_spec ? `Functional Context: {{functional_spec}}` : ''}
${context.technical_spec ? `Technical Context: {{technical_spec}}` : ''}

Generate a detailed meeting transcript covering the following areas:

${sections.map((section, index) => `
## Part ${index + 1}: ${section.name}
${section.prompt}
`).join('\n\n')}

Ensure all sections are clear, actionable, and formatted as a professional meeting document that can be shared with stakeholders.`

  return combinedPrompt
}