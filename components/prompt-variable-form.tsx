'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle, Info } from 'lucide-react'
import { promptValidationService, type PromptVariable, type ValidationResult } from '@/lib/prompt-validation'

interface PromptVariableFormProps {
  variables: PromptVariable[]
  documentType: string
  onValuesChange: (values: Record<string, any>, isValid: boolean) => void
  initialValues?: Record<string, any>
}

export function PromptVariableForm({ 
  variables, 
  documentType, 
  onValuesChange, 
  initialValues = {} 
}: PromptVariableFormProps) {
  const [values, setValues] = useState<Record<string, any>>(initialValues)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Validate values whenever they change
    const result = promptValidationService.validateVariableValues(values, documentType)
    setValidationResult(result)
    onValuesChange(values, result.isValid)
  }, [values, documentType, onValuesChange])

  const handleValueChange = (variableName: string, value: any) => {
    setValues(prev => ({
      ...prev,
      [variableName]: value
    }))
    setTouchedFields(prev => new Set(prev).add(variableName))
  }

  const getFieldError = (variableName: string): string | null => {
    if (!validationResult || !touchedFields.has(variableName)) return null
    
    const error = validationResult.errors.find(err => 
      err.includes(`'${variableName}'`)
    )
    return error || null
  }

  const renderVariableInput = (variable: PromptVariable) => {
    const fieldError = getFieldError(variable.name)
    const value = values[variable.name] || ''

    const inputProps = {
      id: variable.name,
      value: value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        handleValueChange(variable.name, e.target.value),
      className: fieldError ? 'border-red-500' : '',
      placeholder: variable.defaultValue || `Enter ${variable.name}...`
    }

    switch (variable.type) {
      case 'string':
        if (variable.validation?.maxLength && variable.validation.maxLength > 200) {
          return (
            <Textarea 
              {...inputProps}
              className={`min-h-[100px] ${fieldError ? 'border-red-500' : ''}`}
            />
          )
        }
        
        if (variable.validation?.options) {
          return (
            <Select 
              value={value} 
              onValueChange={(newValue) => handleValueChange(variable.name, newValue)}
            >
              <SelectTrigger className={fieldError ? 'border-red-500' : ''}>
                <SelectValue placeholder={`Select ${variable.name}`} />
              </SelectTrigger>
              <SelectContent>
                {variable.validation.options.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        }
        
        return <Input {...inputProps} type="text" />

      case 'number':
        return (
          <Input 
            {...inputProps}
            type="number"
            min={variable.validation?.min}
            max={variable.validation?.max}
            onChange={(e) => handleValueChange(variable.name, parseFloat(e.target.value) || 0)}
          />
        )

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={variable.name}
              checked={Boolean(value)}
              onCheckedChange={(checked) => handleValueChange(variable.name, checked)}
            />
            <Label htmlFor={variable.name}>
              {value ? 'Yes' : 'No'}
            </Label>
          </div>
        )

      case 'array':
        return (
          <Textarea
            {...inputProps}
            placeholder="Enter items separated by commas or new lines"
            className={`min-h-[80px] ${fieldError ? 'border-red-500' : ''}`}
            onChange={(e) => {
              const arrayValue = e.target.value
                .split(/[,\n]/)
                .map(item => item.trim())
                .filter(item => item.length > 0)
              handleValueChange(variable.name, arrayValue)
            }}
            value={Array.isArray(value) ? value.join('\n') : value}
          />
        )

      default:
        return <Input {...inputProps} type="text" />
    }
  }

  const getVariableConstraintText = (variable: PromptVariable): string => {
    const constraints: string[] = []
    
    if (variable.validation) {
      const v = variable.validation
      if (v.minLength) constraints.push(`min ${v.minLength} chars`)
      if (v.maxLength) constraints.push(`max ${v.maxLength} chars`)
      if (v.min !== undefined) constraints.push(`min ${v.min}`)
      if (v.max !== undefined) constraints.push(`max ${v.max}`)
      if (v.pattern) constraints.push('custom format')
      if (v.options) constraints.push(`options: ${v.options.join(', ')}`)
    }
    
    return constraints.length > 0 ? `(${constraints.join(', ')})` : ''
  }

  if (variables.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Info className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Variables Required
          </h3>
          <p className="text-gray-500">
            This prompt doesn't require any variable inputs.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Prompt Variables
            {validationResult?.isValid ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
          </CardTitle>
          <CardDescription>
            Fill in the required information for your prompt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {variables.map((variable) => {
            const fieldError = getFieldError(variable.name)
            
            return (
              <div key={variable.name} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor={variable.name} className="font-medium">
                    {variable.name}
                  </Label>
                  {variable.required && (
                    <Badge variant="destructive" className="text-xs">
                      Required
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {variable.type}
                  </Badge>
                </div>
                
                {variable.description && (
                  <p className="text-sm text-gray-600">
                    {variable.description} {getVariableConstraintText(variable)}
                  </p>
                )}
                
                {renderVariableInput(variable)}
                
                {fieldError && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {fieldError}
                  </p>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Validation Summary */}
      {validationResult && (validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Validation Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {validationResult.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div className="font-medium">Please fix these errors:</div>
                    {validationResult.errors.map((error, index) => (
                      <div key={index} className="text-sm">• {error}</div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {validationResult.warnings.length > 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div className="font-medium">Warnings:</div>
                    {validationResult.warnings.map((warning, index) => (
                      <div key={index} className="text-sm">• {warning}</div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Success State */}
      {validationResult?.isValid && touchedFields.size > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            All variables are valid! You can proceed with generating your content.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// Utility function to extract variables from prompt content
export function extractVariablesFromPrompt(promptContent: string): PromptVariable[] {
  return promptValidationService.extractVariables(promptContent)
}

// Utility function to replace variables in prompt content
export function replaceVariablesInPrompt(
  promptContent: string, 
  values: Record<string, any>
): string {
  let result = promptContent
  
  Object.entries(values).forEach(([key, value]) => {
    const variablePattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    result = result.replace(variablePattern, String(value || ''))
  })
  
  return result
} 