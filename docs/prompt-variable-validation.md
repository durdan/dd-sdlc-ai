# Prompt Variable Validation System

## Overview

The Prompt Variable Validation System ensures that user-created prompts are well-structured, use proper variable syntax, and provide meaningful guidance to users. This system validates both prompt templates and runtime variable values.

## Features

### 1. **Template Validation**
- ✅ Variable syntax validation (`{{variableName}}`)
- ✅ Required variable checking
- ✅ Variable naming convention enforcement
- ✅ Document type-specific validation
- ✅ AI model compatibility checks
- ✅ Content structure analysis

### 2. **Runtime Validation**
- ✅ Type checking (string, number, boolean, array, object)
- ✅ Constraint validation (length, range, pattern)
- ✅ Required field validation
- ✅ Custom validation rules
- ✅ Real-time feedback

### 3. **User Guidance**
- ✅ Template generation for each document type
- ✅ Variable suggestions based on document type
- ✅ Validation error messages with clear guidance
- ✅ Warning and suggestion system
- ✅ Interactive variable insertion

## Variable Types and Validation

### String Variables
```typescript
{
  name: 'projectDescription',
  type: 'string',
  required: true,
  validation: {
    minLength: 10,
    maxLength: 5000,
    pattern: '^[a-zA-Z0-9\\s]+$' // Optional regex pattern
  }
}
```

### Number Variables
```typescript
{
  name: 'teamSize',
  type: 'number',
  required: false,
  validation: {
    min: 1,
    max: 100
  }
}
```

### Enum Variables
```typescript
{
  name: 'methodology',
  type: 'string',
  required: false,
  validation: {
    options: ['agile', 'waterfall', 'lean', 'devops']
  }
}
```

### Boolean Variables
```typescript
{
  name: 'includeTests',
  type: 'boolean',
  required: false,
  defaultValue: true
}
```

### Array Variables
```typescript
{
  name: 'technologies',
  type: 'array',
  required: false,
  description: 'List of technologies to use'
}
```

## Document Type Variables

### Business Analysis
- `input` (required): Main project description
- `stakeholders`: Key stakeholders
- `budget`: Budget constraints
- `timeline`: Project deadlines
- `industry`: Industry context

### Functional Specification
- `input` (required): Business requirements
- `userRoles`: System user roles
- `integrations`: Required integrations
- `constraints`: Business/technical constraints

### Technical Specification
- `input` (required): Functional requirements
- `technology`: Preferred tech stack
- `architecture`: Architectural patterns
- `scalability`: Scalability requirements
- `security`: Security considerations

### UX Specification
- `input` (required): Project requirements
- `targetAudience`: User demographics
- `devices`: Target devices
- `accessibility`: Accessibility needs
- `brandGuidelines`: Design constraints

### Mermaid Diagrams
- `input` (required): System description
- `diagramType`: Preferred diagram types
- `complexity`: Diagram complexity level

### SDLC Composite
- `input` (required): Complete project description
- `methodology`: Development methodology
- `teamSize`: Development team size

## Validation Rules

### 1. **Variable Syntax**
- ✅ Must use `{{variableName}}` format
- ❌ No nested variables: `{{outer{{inner}}}}`
- ❌ No JavaScript syntax: `${variable}`
- ❌ No printf syntax: `%s`, `%d`

### 2. **Variable Naming**
- ✅ Start with letter: `{{projectName}}`
- ✅ Alphanumeric and underscore: `{{user_role}}`
- ❌ Special characters: `{{project-name}}`
- ❌ Numbers first: `{{1stProject}}`
- ❌ Too long: max 50 characters

### 3. **Content Structure**
- ✅ Include clear instructions
- ✅ Provide context/background
- ✅ Specify output format
- ✅ Use action verbs (analyze, generate, create)

### 4. **AI Compatibility**
- ✅ Reasonable token length (< 3000 estimated tokens)
- ✅ Clear and unambiguous instructions
- ✅ Proper variable placement

## Usage Examples

### Creating a Validated Prompt

```typescript
import { promptValidationService } from '@/lib/prompt-validation'

const promptContent = `
Please analyze the following project and generate a business analysis:

Project Description: {{input}}
Stakeholders: {{stakeholders}}
Budget: {{budget}}

Provide:
1. Executive Summary
2. Requirements Analysis
3. Risk Assessment
`

const result = promptValidationService.validatePrompt(
  promptContent,
  'business',
  { strictMode: false, allowCustomVariables: true }
)

if (result.isValid) {
  console.log('Prompt is valid!')
  console.log('Variables found:', result.extractedVariables)
} else {
  console.log('Validation errors:', result.errors)
}
```

### Runtime Variable Validation

```typescript
const variables = {
  input: 'Build a task management app',
  stakeholders: 'Product team, Development team',
  budget: '$50,000'
}

const validationResult = promptValidationService.validateVariableValues(
  variables,
  'business'
)

if (validationResult.isValid) {
  // Proceed with prompt execution
} else {
  // Show validation errors to user
}
```

### Using the Variable Form Component

```tsx
import { PromptVariableForm } from '@/components/prompt-variable-form'

function MyPromptForm() {
  const [values, setValues] = useState({})
  const [isValid, setIsValid] = useState(false)

  const variables = [
    {
      name: 'input',
      type: 'string',
      required: true,
      description: 'Project description',
      validation: { minLength: 10, maxLength: 1000 }
    }
  ]

  return (
    <PromptVariableForm
      variables={variables}
      documentType="business"
      onValuesChange={(values, isValid) => {
        setValues(values)
        setIsValid(isValid)
      }}
    />
  )
}
```

## Error Messages and Guidance

### Common Validation Errors

1. **Missing Required Variable**
   - Error: "Missing required variable: {{input}}"
   - Solution: Add the required variable to your prompt

2. **Invalid Variable Syntax**
   - Error: "Invalid variable name: {{project-name}}. Use alphanumeric characters and underscores only."
   - Solution: Change to `{{project_name}}`

3. **Variable Too Long**
   - Error: "Variable 'projectDescription' must be no more than 1000 characters long"
   - Solution: Shorten the input or increase the limit

4. **Invalid Type**
   - Error: "Variable 'teamSize' should be of type number"
   - Solution: Enter a numeric value

### Warning Messages

1. **Short Prompt**
   - Warning: "Prompt is quite short. Consider adding more detailed instructions."

2. **Unknown Variable**
   - Warning: "Unknown variable: {{customVar}}. Consider using standard variables."

3. **Long Prompt**
   - Warning: "Prompt is very long. Consider breaking it into smaller, focused prompts."

### Suggestions

1. **Missing Context**
   - Suggestion: "Consider adding context or background information to improve results"

2. **Missing Variables**
   - Suggestion: "Consider adding these optional variables: {{stakeholders}}, {{budget}}"

3. **Format Instructions**
   - Suggestion: "Consider specifying the desired output format or structure"

## Best Practices

### 1. **Prompt Design**
- Start with a template and customize
- Use clear, actionable instructions
- Include context and background
- Specify desired output format
- Test with real data

### 2. **Variable Usage**
- Use descriptive variable names
- Follow naming conventions
- Include helpful descriptions
- Set appropriate validation rules
- Provide default values when possible

### 3. **Validation Strategy**
- Validate during prompt creation
- Validate at runtime before execution
- Provide clear error messages
- Offer suggestions for improvement
- Allow progressive enhancement

### 4. **User Experience**
- Show validation status in real-time
- Provide helpful error messages
- Offer variable suggestions
- Include examples and templates
- Make validation non-blocking for warnings

## Integration Points

### 1. **Prompt Creation Form**
- Real-time validation as user types
- Variable suggestion panel
- Template loading
- Error highlighting

### 2. **Prompt Testing Interface**
- Variable value validation
- Test execution with validation
- Result preview with variable substitution

### 3. **API Endpoints**
- Server-side validation before processing
- Variable value sanitization
- Error responses with validation details

### 4. **Admin Interface**
- Bulk validation of existing prompts
- System-wide validation statistics
- Validation rule management

## Future Enhancements

### 1. **Advanced Validation**
- Cross-variable validation rules
- Conditional variable requirements
- Custom validation functions
- Integration with external validators

### 2. **AI-Powered Suggestions**
- Automatic variable extraction from descriptions
- Smart template recommendations
- Content improvement suggestions
- Variable naming suggestions

### 3. **Collaboration Features**
- Shared variable libraries
- Team validation standards
- Approval workflows for prompts
- Version control with validation history

### 4. **Analytics and Insights**
- Validation success rates
- Common error patterns
- Variable usage statistics
- Performance impact analysis

This validation system ensures that users create high-quality, reliable prompts while providing excellent guidance and user experience throughout the process. 