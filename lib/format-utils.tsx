/**
 * Utility functions for consistent document formatting across the platform
 */

import React from 'react'

/**
 * Preprocesses markdown content to ensure proper formatting
 * Converts bullet points to markdown format and ensures proper line breaks
 */
export function preprocessMarkdownContent(content: string): string {
  if (!content) return ''
  
  let processed = content
  
  // Convert bullet points (•) to markdown list format (-)
  processed = processed.replace(/^• /gm, '- ')
  processed = processed.replace(/\n• /g, '\n- ')
  
  // Ensure proper spacing after headers
  processed = processed.replace(/^(#{1,6} .+)$/gm, '$1\n')
  
  // Ensure lists have proper spacing
  processed = processed.replace(/^(-|\*|\d+\.) /gm, '\n$1 ')
  
  // Clean up excessive newlines (more than 2)
  processed = processed.replace(/\n{3,}/g, '\n\n')
  
  // Ensure code blocks are properly formatted
  processed = processed.replace(/```(\w*)\n/g, '\n```$1\n')
  processed = processed.replace(/\n```/g, '\n\n```')
  
  return processed.trim()
}

/**
 * Common markdown component styles for consistent rendering
 */
export const markdownComponents = {
  h1: ({children}: any) => (
    <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900 border-b border-gray-200 pb-2">
      {children}
    </h1>
  ),
  h2: ({children}: any) => (
    <h2 className="text-xl font-semibold mt-5 mb-3 text-gray-800">
      {children}
    </h2>
  ),
  h3: ({children}: any) => (
    <h3 className="text-lg font-medium mt-4 mb-2 text-gray-800">
      {children}
    </h3>
  ),
  h4: ({children}: any) => (
    <h4 className="text-base font-medium mt-3 mb-2 text-gray-700">
      {children}
    </h4>
  ),
  ul: ({children}: any) => (
    <ul className="list-disc pl-6 space-y-2 my-3 text-gray-700">
      {children}
    </ul>
  ),
  ol: ({children}: any) => (
    <ol className="list-decimal pl-6 space-y-2 my-3 text-gray-700">
      {children}
    </ol>
  ),
  li: ({children}: any) => (
    <li className="leading-relaxed">
      {children}
    </li>
  ),
  p: ({children}: any) => (
    <p className="mb-3 leading-relaxed text-gray-700">
      {children}
    </p>
  ),
  strong: ({children}: any) => (
    <strong className="font-semibold text-gray-900">
      {children}
    </strong>
  ),
  em: ({children}: any) => (
    <em className="italic text-gray-700">
      {children}
    </em>
  ),
  code: ({children, className}: any) => {
    const isInline = !className
    return isInline ? (
      <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800">
        {children}
      </code>
    ) : (
      <code className={`${className} block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono`}>
        {children}
      </code>
    )
  },
  pre: ({children}: any) => (
    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 text-sm">
      {children}
    </pre>
  ),
  blockquote: ({children}: any) => (
    <blockquote className="border-l-4 border-indigo-300 pl-4 italic my-4 text-gray-600 bg-gray-50 py-2">
      {children}
    </blockquote>
  ),
  hr: () => (
    <hr className="my-6 border-gray-200" />
  ),
  table: ({children}: any) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full divide-y divide-gray-200">
        {children}
      </table>
    </div>
  ),
  thead: ({children}: any) => (
    <thead className="bg-gray-50">
      {children}
    </thead>
  ),
  tbody: ({children}: any) => (
    <tbody className="bg-white divide-y divide-gray-200">
      {children}
    </tbody>
  ),
  tr: ({children}: any) => (
    <tr>
      {children}
    </tr>
  ),
  th: ({children}: any) => (
    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      {children}
    </th>
  ),
  td: ({children}: any) => (
    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
      {children}
    </td>
  ),
  a: ({children, href}: any) => (
    <a href={href} className="text-indigo-600 hover:text-indigo-800 underline" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
}

/**
 * Mobile-optimized markdown component styles
 */
export const mobileMarkdownComponents = {
  ...markdownComponents,
  h1: ({children}: any) => (
    <h1 className="text-lg sm:text-2xl font-bold mt-4 sm:mt-6 mb-2 sm:mb-4 text-gray-900 border-b border-gray-200 pb-1 sm:pb-2">
      {children}
    </h1>
  ),
  h2: ({children}: any) => (
    <h2 className="text-base sm:text-xl font-semibold mt-3 sm:mt-5 mb-2 sm:mb-3 text-gray-800">
      {children}
    </h2>
  ),
  h3: ({children}: any) => (
    <h3 className="text-sm sm:text-lg font-medium mt-2 sm:mt-4 mb-1 sm:mb-2 text-gray-800">
      {children}
    </h3>
  ),
  ul: ({children}: any) => (
    <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2 my-2 sm:my-3 text-xs sm:text-base text-gray-700">
      {children}
    </ul>
  ),
  ol: ({children}: any) => (
    <ol className="list-decimal pl-4 sm:pl-6 space-y-1 sm:space-y-2 my-2 sm:my-3 text-xs sm:text-base text-gray-700">
      {children}
    </ol>
  ),
  p: ({children}: any) => (
    <p className="mb-2 sm:mb-3 leading-relaxed text-xs sm:text-base text-gray-700">
      {children}
    </p>
  ),
  code: ({children, className}: any) => {
    const isInline = !className
    return isInline ? (
      <code className="bg-gray-100 px-1 py-0.5 rounded text-xs sm:text-sm font-mono text-gray-800">
        {children}
      </code>
    ) : (
      <code className={`${className} block bg-gray-900 text-gray-100 p-2 sm:p-4 rounded-lg overflow-x-auto text-xs sm:text-sm font-mono`}>
        {children}
      </code>
    )
  },
}