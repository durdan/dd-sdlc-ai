'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Custom hook for mobile detection
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

// Types
interface Tool {
  id: string;
  label: string;
  subtitle: string;
  icon: string;
  desc: string;
  price: string;
  url: string;
  vendor: 'anthropic' | 'google' | 'openai' | 'microsoft' | 'other';
}

interface Layer {
  label: string;
  icon: string;
  color: string;
  colorHex: string;
  tools: Tool[];
}

interface Role {
  name: string;
  icon: string;
  subtitle: string;
  color: string;
  layers: {
    thinking: Layer;
    assistants: Layer;
    orchestration: Layer;
    execution: Layer;
    productivity: Layer;
  };
  target: { label: string; icon: string; subtitle: string };
}

// Complete roles data
const rolesData: Record<string, Role> = {
  developer: {
    name: 'Software Developer', icon: '👨‍💻', subtitle: 'Frontend | Backend | Full-Stack', color: '#22d3ee',
    layers: {
      thinking: { label: 'Thinking & Research', icon: '🧠', color: 'emerald', colorHex: '#10b981', tools: [
        { id: 'chatgpt', label: 'ChatGPT', subtitle: 'o1/o3/o4-mini', icon: '🤖', desc: 'Architecture planning, complex reasoning, code generation', price: '$20/mo Pro', url: 'https://chat.openai.com', vendor: 'openai' },
        { id: 'claude', label: 'Claude', subtitle: 'Opus/Sonnet 4.5', icon: '🎭', desc: 'Deep code analysis, 200K context window, superior reasoning', price: '$20/mo Pro', url: 'https://claude.ai', vendor: 'anthropic' },
        { id: 'workbench', label: 'Anthropic Workbench', subtitle: 'Prompt Testing', icon: '🔬', desc: 'Test and iterate prompts, compare model outputs', price: 'API pricing', url: 'https://console.anthropic.com', vendor: 'anthropic' },
        { id: 'gemini', label: 'Gemini', subtitle: '3 Pro/Flash', icon: '💎', desc: 'Multimodal reasoning, 1M+ context, Deep Think mode', price: 'Free/$20 Ultra', url: 'https://gemini.google.com', vendor: 'google' },
        { id: 'aistudio', label: 'Google AI Studio', subtitle: 'Prototyping', icon: '🎨', desc: 'Prompt design, model testing, API key generation', price: 'Free tier', url: 'https://aistudio.google.com', vendor: 'google' },
        { id: 'perplexity', label: 'Perplexity', subtitle: 'Research', icon: '🔍', desc: 'Real-time research with citations', price: 'Free/$20', url: 'https://perplexity.ai', vendor: 'other' },
        { id: 'phind', label: 'Phind', subtitle: 'Code Q&A', icon: '💡', desc: 'Technical Q&A optimized for developers', price: 'Free', url: 'https://phind.com', vendor: 'other' },
      ]},
      assistants: { label: 'Code Assistants', icon: '🛠️', color: 'blue', colorHex: '#3b82f6', tools: [
        { id: 'claudecode', label: 'Claude Code', subtitle: 'Terminal Agent', icon: '⌨️', desc: 'Terminal-native agentic coding, MCP support, multi-file edits', price: '$20 Pro/API', url: 'https://claude.ai/code', vendor: 'anthropic' },
        { id: 'geminicodeassist', label: 'Gemini Code Assist', subtitle: 'IDE Plugin', icon: '💎', desc: 'VS Code/JetBrains AI coding, 2.5x productivity boost', price: 'Free/$19/mo', url: 'https://codeassist.google', vendor: 'google' },
        { id: 'geminicli', label: 'Gemini CLI', subtitle: 'Open Source', icon: '📟', desc: 'Terminal agent, 1000 req/day free, OSS', price: 'Free', url: 'https://github.com/google-gemini/gemini-cli', vendor: 'google' },
        { id: 'cursor', label: 'Cursor', subtitle: 'AI-Native IDE', icon: '📝', desc: 'Multi-file Composer, Claude/GPT models', price: '$20/mo', url: 'https://cursor.com', vendor: 'other' },
        { id: 'windsurf', label: 'Windsurf', subtitle: 'Cascade', icon: '🏄', desc: 'Flow-based context, beginner friendly', price: '$15/mo', url: 'https://codeium.com/windsurf', vendor: 'other' },
        { id: 'copilot', label: 'GitHub Copilot', subtitle: 'Inline', icon: '🐙', desc: 'Deep GitHub integration, Claude 4 support', price: '$10/mo', url: 'https://github.com/features/copilot', vendor: 'microsoft' },
        { id: 'aider', label: 'Aider', subtitle: 'OSS', icon: '🔧', desc: 'Best Git integration, pair programming', price: 'Free+API', url: 'https://aider.chat', vendor: 'other' },
      ]},
      orchestration: { label: 'Agent Orchestration', icon: '🎯', color: 'orange', colorHex: '#f97316', tools: [
        { id: 'mcp', label: 'MCP', subtitle: 'Model Context Protocol', icon: '🔌', desc: 'Open standard connecting AI to tools, 1000s of servers', price: 'Free/OSS', url: 'https://modelcontextprotocol.io', vendor: 'anthropic' },
        { id: 'claudeapi', label: 'Claude API', subtitle: 'Tool Use', icon: '⚡', desc: 'Advanced tool use, parallel execution, code execution', price: 'Pay per token', url: 'https://docs.anthropic.com', vendor: 'anthropic' },
        { id: 'vertexai', label: 'Vertex AI', subtitle: 'Enterprise', icon: '🏢', desc: 'Production AI platform, model garden, tuning', price: 'Pay per use', url: 'https://cloud.google.com/vertex-ai', vendor: 'google' },
        { id: 'antigravity', label: 'Google Antigravity', subtitle: 'Agentic Platform', icon: '🚀', desc: 'New agentic development platform for complex workflows', price: 'Preview', url: 'https://cloud.google.com/antigravity', vendor: 'google' },
        { id: 'langgraph', label: 'LangGraph', subtitle: 'Stateful', icon: '📊', desc: 'Graph-based workflows, production-ready', price: 'OSS', url: 'https://langchain-ai.github.io/langgraph/', vendor: 'other' },
        { id: 'crewai', label: 'CrewAI', subtitle: 'Teams', icon: '👥', desc: 'Role-based agent teams, easy setup', price: 'OSS', url: 'https://crewai.com', vendor: 'other' },
        { id: 'openai-sdk', label: 'OpenAI Agents SDK', subtitle: 'Primitives', icon: '⚡', desc: 'Lightweight agent building blocks', price: 'API', url: 'https://platform.openai.com', vendor: 'openai' },
      ]},
      execution: { label: 'Execution Layer', icon: '🚀', color: 'pink', colorHex: '#ec4899', tools: [
        { id: 'computeruse', label: 'Computer Use', subtitle: 'Desktop Agent', icon: '🖥️', desc: 'AI controls mouse/keyboard, browser automation', price: 'API pricing', url: 'https://docs.anthropic.com/en/docs/agents-and-tools/computer-use', vendor: 'anthropic' },
        { id: 'jules', label: 'Jules', subtitle: 'GitHub Agent', icon: '🤖', desc: 'Automated GitHub PR agent, background tasks', price: 'Preview', url: 'https://labs.google/jules', vendor: 'google' },
        { id: 'firebasestudio', label: 'Firebase Studio', subtitle: 'Full IDE', icon: '🔥', desc: 'Browser-based dev environment with Gemini', price: 'Free tier', url: 'https://firebase.studio', vendor: 'google' },
        { id: 'v0', label: 'v0.dev', subtitle: 'UI Gen', icon: '✨', desc: 'AI UI component generation', price: 'Free/$20', url: 'https://v0.dev', vendor: 'other' },
        { id: 'bolt', label: 'Bolt.new', subtitle: 'Full Stack', icon: '⚡', desc: 'Full-stack app generation', price: 'Free/$20', url: 'https://bolt.new', vendor: 'other' },
        { id: 'playwright', label: 'Playwright+MCP', subtitle: 'Browser', icon: '🎭', desc: 'Browser automation with AI integration', price: 'OSS', url: 'https://playwright.dev', vendor: 'other' },
        { id: 'ghactions', label: 'GitHub Actions', subtitle: 'CI/CD', icon: '⚙️', desc: 'Automated workflows with AI steps', price: 'Free tier', url: 'https://github.com/features/actions', vendor: 'microsoft' },
      ]},
      productivity: { label: 'Side Productivity', icon: '📐', color: 'purple', colorHex: '#a855f7', tools: [
        { id: 'notebooklm', label: 'NotebookLM', subtitle: 'Research', icon: '📓', desc: 'AI research assistant, audio summaries', price: 'Free', url: 'https://notebooklm.google.com', vendor: 'google' },
        { id: 'geminiworkspace', label: 'Gemini for Workspace', subtitle: 'Docs/Sheets', icon: '📄', desc: 'AI in Google Docs, Sheets, Slides', price: '$20/mo', url: 'https://workspace.google.com/solutions/ai/', vendor: 'google' },
        { id: 'mermaid', label: 'Mermaid', subtitle: 'Diagrams', icon: '🧜‍♀️', desc: 'Diagram-as-code, AI generation', price: 'OSS', url: 'https://mermaid.js.org', vendor: 'other' },
        { id: 'n8n', label: 'n8n', subtitle: 'Workflows', icon: '🔀', desc: '70+ LangChain nodes, automation', price: 'OSS', url: 'https://n8n.io', vendor: 'other' },
        { id: 'notion', label: 'Notion AI', subtitle: 'Docs', icon: '📓', desc: 'AI documentation and writing', price: '$10/mo', url: 'https://notion.so', vendor: 'other' },
      ]}
    },
    target: { label: 'Production Codebase', icon: '🎯', subtitle: 'Ship quality code faster' }
  },
  tester: {
    name: 'QA/Tester', icon: '🧪', subtitle: 'Test Automation | Manual | Performance', color: '#a855f7',
    layers: {
      thinking: { label: 'Thinking & Research', icon: '🧠', color: 'emerald', colorHex: '#10b981', tools: [
        { id: 'claude-t', label: 'Claude', subtitle: 'Test Strategy', icon: '🎭', desc: 'Generate test plans, analyze requirements', price: '$20/mo', url: 'https://claude.ai', vendor: 'anthropic' },
        { id: 'gemini-t', label: 'Gemini', subtitle: 'Test Design', icon: '💎', desc: 'Multimodal test case generation', price: 'Free/$20', url: 'https://gemini.google.com', vendor: 'google' },
        { id: 'chatgpt-t', label: 'ChatGPT', subtitle: 'Test Cases', icon: '🤖', desc: 'Generate comprehensive test cases', price: '$20/mo', url: 'https://chat.openai.com', vendor: 'openai' },
        { id: 'perplexity-t', label: 'Perplexity', subtitle: 'Research', icon: '🔍', desc: 'Research testing frameworks', price: 'Free', url: 'https://perplexity.ai', vendor: 'other' },
      ]},
      assistants: { label: 'Code Assistants', icon: '🛠️', color: 'blue', colorHex: '#3b82f6', tools: [
        { id: 'claudecode-t', label: 'Claude Code', subtitle: 'Test Writing', icon: '⌨️', desc: 'Generate and refactor test code', price: 'API', url: 'https://claude.ai/code', vendor: 'anthropic' },
        { id: 'geminicodeassist-t', label: 'Gemini Code Assist', subtitle: 'Unit Tests', icon: '💎', desc: 'Auto-generate unit tests in IDE', price: 'Free/$19', url: 'https://codeassist.google', vendor: 'google' },
        { id: 'qodo-t', label: 'Qodo', subtitle: 'Test Gen', icon: '✅', desc: 'AI test generation and coverage', price: 'Free', url: 'https://qodo.ai', vendor: 'other' },
        { id: 'cursor-t', label: 'Cursor', subtitle: 'Edit', icon: '📝', desc: 'Multi-file test editing', price: '$20/mo', url: 'https://cursor.com', vendor: 'other' },
        { id: 'testim', label: 'Testim.io', subtitle: 'ML Tests', icon: '🔬', desc: 'ML-powered test authoring', price: 'Contact', url: 'https://testim.io', vendor: 'other' },
      ]},
      orchestration: { label: 'Agent Orchestration', icon: '🎯', color: 'orange', colorHex: '#f97316', tools: [
        { id: 'mcp-t', label: 'MCP', subtitle: 'Test Tools', icon: '🔌', desc: 'Connect test runners via MCP', price: 'Free', url: 'https://modelcontextprotocol.io', vendor: 'anthropic' },
        { id: 'crewai-t', label: 'CrewAI', subtitle: 'Test Agents', icon: '👥', desc: 'Multi-agent testing workflows', price: 'OSS', url: 'https://crewai.com', vendor: 'other' },
        { id: 'langgraph-t', label: 'LangGraph', subtitle: 'Workflows', icon: '📊', desc: 'Test orchestration pipelines', price: 'OSS', url: 'https://langchain-ai.github.io/langgraph/', vendor: 'other' },
      ]},
      execution: { label: 'Execution Layer', icon: '🚀', color: 'pink', colorHex: '#ec4899', tools: [
        { id: 'computeruse-t', label: 'Computer Use', subtitle: 'E2E Testing', icon: '🖥️', desc: 'AI-driven end-to-end UI testing', price: 'API', url: 'https://anthropic.com', vendor: 'anthropic' },
        { id: 'playwright-t', label: 'Playwright', subtitle: 'Browser', icon: '🎭', desc: 'Cross-browser automation', price: 'OSS', url: 'https://playwright.dev', vendor: 'other' },
        { id: 'testsigma', label: 'Testsigma', subtitle: 'Plain English', icon: '📝', desc: 'Natural language test scripts', price: 'Free', url: 'https://testsigma.com', vendor: 'other' },
        { id: 'mabl', label: 'mabl', subtitle: 'Auto-heal', icon: '🔧', desc: 'Self-healing tests with ML', price: 'Contact', url: 'https://mabl.com', vendor: 'other' },
      ]},
      productivity: { label: 'Side Productivity', icon: '📐', color: 'purple', colorHex: '#a855f7', tools: [
        { id: 'notebooklm-t', label: 'NotebookLM', subtitle: 'Test Docs', icon: '📓', desc: 'Analyze test documentation', price: 'Free', url: 'https://notebooklm.google.com', vendor: 'google' },
        { id: 'mermaid-t', label: 'Mermaid', subtitle: 'Test Flows', icon: '🧜‍♀️', desc: 'Visualize test flows', price: 'OSS', url: 'https://mermaid.js.org', vendor: 'other' },
        { id: 'allure', label: 'Allure', subtitle: 'Reports', icon: '📊', desc: 'Beautiful test reports', price: 'OSS', url: 'https://allurereport.org', vendor: 'other' },
        { id: 'applitools', label: 'Applitools', subtitle: 'Visual AI', icon: '👁️', desc: 'Visual regression testing', price: 'Free tier', url: 'https://applitools.com', vendor: 'other' },
      ]}
    },
    target: { label: 'Quality Assured Release', icon: '✅', subtitle: 'Zero critical bugs' }
  },
  devops: {
    name: 'DevOps/SRE', icon: '⚙️', subtitle: 'Infrastructure | Reliability', color: '#f97316',
    layers: {
      thinking: { label: 'Thinking & Research', icon: '🧠', color: 'emerald', colorHex: '#10b981', tools: [
        { id: 'claude-d', label: 'Claude', subtitle: 'Incident Analysis', icon: '🎭', desc: 'Root cause analysis, postmortems', price: '$20/mo', url: 'https://claude.ai', vendor: 'anthropic' },
        { id: 'gemini-d', label: 'Gemini', subtitle: 'Cloud Docs', icon: '💎', desc: 'GCP documentation expert', price: 'Free/$20', url: 'https://gemini.google.com', vendor: 'google' },
        { id: 'amazonq', label: 'Amazon Q', subtitle: 'AWS Expert', icon: '☁️', desc: 'AWS knowledge and guidance', price: 'Included', url: 'https://aws.amazon.com/q/', vendor: 'other' },
      ]},
      assistants: { label: 'IaC Assistants', icon: '🛠️', color: 'blue', colorHex: '#3b82f6', tools: [
        { id: 'claudecode-d', label: 'Claude Code', subtitle: 'IaC', icon: '⌨️', desc: 'Generate Terraform, Pulumi, CloudFormation', price: 'API', url: 'https://claude.ai/code', vendor: 'anthropic' },
        { id: 'geminicodeassist-d', label: 'Gemini Code Assist', subtitle: 'GCP', icon: '💎', desc: 'GCP infrastructure code', price: 'Free/$19', url: 'https://codeassist.google', vendor: 'google' },
        { id: 'copilot-d', label: 'GitHub Copilot', subtitle: 'IaC', icon: '🐙', desc: 'Infrastructure as Code', price: '$10/mo', url: 'https://github.com/features/copilot', vendor: 'microsoft' },
        { id: 'ansible', label: 'Ansible Lightspeed', subtitle: 'Playbooks', icon: '🔧', desc: 'AI playbook generation', price: 'Sub', url: 'https://ansible.com', vendor: 'other' },
      ]},
      orchestration: { label: 'AIOps Agents', icon: '🎯', color: 'orange', colorHex: '#f97316', tools: [
        { id: 'vertexai-d', label: 'Vertex AI', subtitle: 'MLOps', icon: '🏢', desc: 'ML pipelines, model serving', price: 'Pay per use', url: 'https://cloud.google.com/vertex-ai', vendor: 'google' },
        { id: 'pagerduty', label: 'PagerDuty AIOps', subtitle: 'Incidents', icon: '📟', desc: 'AI incident management', price: 'Enterprise', url: 'https://pagerduty.com', vendor: 'other' },
        { id: 'datadog', label: 'Datadog Bits', subtitle: 'Triage', icon: '🐕', desc: 'AI observability assistant', price: 'Sub', url: 'https://datadoghq.com', vendor: 'other' },
      ]},
      execution: { label: 'Infrastructure Execution', icon: '🚀', color: 'pink', colorHex: '#ec4899', tools: [
        { id: 'jules-d', label: 'Jules', subtitle: 'GitOps', icon: '🤖', desc: 'Automated infrastructure PRs', price: 'Preview', url: 'https://labs.google/jules', vendor: 'google' },
        { id: 'pulumi', label: 'Pulumi AI', subtitle: 'Multi-cloud', icon: '🌐', desc: 'Natural language to IaC', price: 'Free', url: 'https://pulumi.com', vendor: 'other' },
        { id: 'k8sgpt', label: 'K8sGPT', subtitle: 'CNCF', icon: '☸️', desc: 'K8s troubleshooting AI', price: 'OSS', url: 'https://k8sgpt.ai', vendor: 'other' },
        { id: 'terraform', label: 'Terraform', subtitle: 'IaC', icon: '🏗️', desc: 'Industry standard IaC', price: 'Free', url: 'https://terraform.io', vendor: 'other' },
      ]},
      productivity: { label: 'Side Productivity', icon: '📐', color: 'purple', colorHex: '#a855f7', tools: [
        { id: 'geminiworkspace-d', label: 'Gemini Workspace', subtitle: 'Runbooks', icon: '📄', desc: 'AI runbook documentation', price: '$20/mo', url: 'https://workspace.google.com', vendor: 'google' },
        { id: 'hava', label: 'Hava.io', subtitle: 'Auto-diagrams', icon: '🗺️', desc: 'Auto cloud architecture diagrams', price: 'Sub', url: 'https://hava.io', vendor: 'other' },
        { id: 'spotio', label: 'Spot.io', subtitle: 'Cost AI', icon: '💰', desc: 'Cloud cost optimization', price: 'Sub', url: 'https://spot.io', vendor: 'other' },
      ]}
    },
    target: { label: 'Cloud Infrastructure', icon: '☁️', subtitle: 'AWS/Azure/GCP/K8s' }
  },
  security: {
    name: 'Security Engineer', icon: '🔒', subtitle: 'AppSec | DevSecOps', color: '#ef4444',
    layers: {
      thinking: { label: 'Threat Modeling', icon: '🧠', color: 'emerald', colorHex: '#10b981', tools: [
        { id: 'claude-s', label: 'Claude', subtitle: 'Threat Analysis', icon: '🎭', desc: 'Security architecture review, threat modeling', price: '$20/mo', url: 'https://claude.ai', vendor: 'anthropic' },
        { id: 'gemini-s', label: 'Gemini', subtitle: 'Vulnerability Research', icon: '💎', desc: 'CVE analysis, security research', price: 'Free/$20', url: 'https://gemini.google.com', vendor: 'google' },
      ]},
      assistants: { label: 'SAST Tools', icon: '🛠️', color: 'blue', colorHex: '#3b82f6', tools: [
        { id: 'claudecode-s', label: 'Claude Code', subtitle: 'Security Review', icon: '⌨️', desc: 'Code security analysis and fixes', price: 'API', url: 'https://claude.ai/code', vendor: 'anthropic' },
        { id: 'snykcode', label: 'Snyk Code', subtitle: '50x faster', icon: '🔍', desc: 'AI-powered auto-fix for vulnerabilities', price: 'Free tier', url: 'https://snyk.io', vendor: 'other' },
        { id: 'codeql', label: 'GitHub CodeQL', subtitle: 'Semantic', icon: '🔬', desc: 'Semantic code analysis', price: 'Free', url: 'https://github.com/features/security', vendor: 'microsoft' },
      ]},
      orchestration: { label: 'Security Agents', icon: '🎯', color: 'orange', colorHex: '#f97316', tools: [
        { id: 'mcp-s', label: 'MCP Security', subtitle: 'Secure Tools', icon: '🔌', desc: 'Secure MCP server connections', price: 'Free', url: 'https://modelcontextprotocol.io', vendor: 'anthropic' },
        { id: 'mscopilot', label: 'Security Copilot', subtitle: 'Microsoft', icon: '🛡️', desc: 'AI security operations', price: 'Enterprise', url: 'https://microsoft.com/security/copilot', vendor: 'microsoft' },
      ]},
      execution: { label: 'DAST & Scanning', icon: '🚀', color: 'pink', colorHex: '#ec4899', tools: [
        { id: 'invicti', label: 'Invicti', subtitle: 'Scanner', icon: '🌐', desc: 'Web application security scanner', price: 'Contact', url: 'https://invicti.com', vendor: 'other' },
        { id: 'stackhawk', label: 'StackHawk', subtitle: 'CI/CD', icon: '🦅', desc: 'DAST in CI/CD pipelines', price: 'Free tier', url: 'https://stackhawk.com', vendor: 'other' },
      ]},
      productivity: { label: 'Side Productivity', icon: '📐', color: 'purple', colorHex: '#a855f7', tools: [
        { id: 'notebooklm-s', label: 'NotebookLM', subtitle: 'Threat Intel', icon: '📓', desc: 'Analyze threat intelligence reports', price: 'Free', url: 'https://notebooklm.google.com', vendor: 'google' },
      ]}
    },
    target: { label: 'Secure Application', icon: '🔐', subtitle: 'Zero critical vulnerabilities' }
  },
  pm: {
    name: 'Product Manager', icon: '📋', subtitle: 'Strategy | Roadmap', color: '#10b981',
    layers: {
      thinking: { label: 'Strategy & Research', icon: '🧠', color: 'emerald', colorHex: '#10b981', tools: [
        { id: 'claude-p', label: 'Claude', subtitle: 'Strategy', icon: '🎭', desc: 'Product strategy, competitive analysis', price: '$20/mo', url: 'https://claude.ai', vendor: 'anthropic' },
        { id: 'gemini-p', label: 'Gemini', subtitle: 'Research', icon: '💎', desc: 'Market research, trend analysis', price: 'Free/$20', url: 'https://gemini.google.com', vendor: 'google' },
        { id: 'perplexity-p', label: 'Perplexity', subtitle: '70% faster', icon: '🔍', desc: 'Competitive research with citations', price: 'Free/$20', url: 'https://perplexity.ai', vendor: 'other' },
      ]},
      assistants: { label: 'Document AI', icon: '🛠️', color: 'blue', colorHex: '#3b82f6', tools: [
        { id: 'chatprd', label: 'ChatPRD', subtitle: '75% faster', icon: '📄', desc: 'AI PRD generation', price: 'Free/$29', url: 'https://chatprd.ai', vendor: 'other' },
        { id: 'notion-p', label: 'Notion AI', subtitle: 'Docs', icon: '📓', desc: 'AI documentation', price: '$10/mo', url: 'https://notion.so', vendor: 'other' },
      ]},
      orchestration: { label: 'Insight Agents', icon: '🎯', color: 'orange', colorHex: '#f97316', tools: [
        { id: 'buildbetter', label: 'BuildBetter', subtitle: 'Insights', icon: '🔮', desc: 'Customer feedback analysis', price: 'Contact', url: 'https://buildbetter.ai', vendor: 'other' },
      ]},
      execution: { label: 'Prototyping', icon: '🚀', color: 'pink', colorHex: '#ec4899', tools: [
        { id: 'v0-p', label: 'v0.dev', subtitle: 'UI Gen', icon: '✨', desc: 'AI UI component generation', price: 'Free/$20', url: 'https://v0.dev', vendor: 'other' },
        { id: 'figma', label: 'Figma AI', subtitle: 'Design', icon: '🎨', desc: 'AI-powered design tools', price: 'Sub', url: 'https://figma.com', vendor: 'other' },
      ]},
      productivity: { label: 'Side Productivity', icon: '📐', color: 'purple', colorHex: '#a855f7', tools: [
        { id: 'notebooklm-p', label: 'NotebookLM', subtitle: 'Research', icon: '📓', desc: 'Analyze market research', price: 'Free', url: 'https://notebooklm.google.com', vendor: 'google' },
        { id: 'miro', label: 'Miro AI', subtitle: 'Boards', icon: '📋', desc: 'AI collaborative whiteboard', price: 'Sub', url: 'https://miro.com', vendor: 'other' },
      ]}
    },
    target: { label: 'Product Launch', icon: '🚀', subtitle: 'Ship features users love' }
  },
  designer: {
    name: 'UX/UI Designer', icon: '🎨', subtitle: 'Product Design | Prototyping', color: '#ec4899',
    layers: {
      thinking: { label: 'UX Research', icon: '🧠', color: 'emerald', colorHex: '#10b981', tools: [
        { id: 'claude-u', label: 'Claude', subtitle: 'UX Writing', icon: '🎭', desc: 'UX copy, microcopy generation', price: '$20/mo', url: 'https://claude.ai', vendor: 'anthropic' },
        { id: 'gemini-u', label: 'Gemini', subtitle: 'Visual Analysis', icon: '💎', desc: 'Analyze UI screenshots, suggest improvements', price: 'Free/$20', url: 'https://gemini.google.com', vendor: 'google' },
      ]},
      assistants: { label: 'Design AI', icon: '🛠️', color: 'blue', colorHex: '#3b82f6', tools: [
        { id: 'figmaai', label: 'Figma AI', subtitle: 'First Draft', icon: '🎨', desc: 'Text-to-design, AI prototyping', price: '$15/mo', url: 'https://figma.com', vendor: 'other' },
        { id: 'uizard', label: 'Uizard', subtitle: 'Sketch→UI', icon: '📱', desc: 'Sketch to mockup conversion', price: 'Free/$19', url: 'https://uizard.io', vendor: 'other' },
      ]},
      orchestration: { label: 'AI Plugins', icon: '🎯', color: 'orange', colorHex: '#f97316', tools: [
        { id: 'magician', label: 'Magician', subtitle: 'Figma', icon: '🪄', desc: 'AI icon and copy generation', price: '$5/mo', url: 'https://magician.design', vendor: 'other' },
      ]},
      execution: { label: 'Design-to-Code', icon: '🚀', color: 'pink', colorHex: '#ec4899', tools: [
        { id: 'firebasestudio-u', label: 'Firebase Studio', subtitle: 'Vibe Code', icon: '🔥', desc: 'Design to working app', price: 'Free tier', url: 'https://firebase.studio', vendor: 'google' },
        { id: 'locofy', label: 'Locofy.ai', subtitle: '10x faster', icon: '⚡', desc: 'Figma to React/Vue', price: 'Free tier', url: 'https://locofy.ai', vendor: 'other' },
      ]},
      productivity: { label: 'Side Productivity', icon: '📐', color: 'purple', colorHex: '#a855f7', tools: [
        { id: 'framer', label: 'Framer AI', subtitle: 'Websites', icon: '🌐', desc: 'AI website builder', price: 'Free/$5', url: 'https://framer.com', vendor: 'other' },
      ]}
    },
    target: { label: 'Production UI', icon: '🎯', subtitle: 'Beautiful interfaces' }
  },
  writer: {
    name: 'Technical Writer', icon: '📝', subtitle: 'API Docs | Knowledge Base', color: '#8b5cf6',
    layers: {
      thinking: { label: 'Content Strategy', icon: '🧠', color: 'emerald', colorHex: '#10b981', tools: [
        { id: 'claude-w', label: 'Claude', subtitle: 'Writing', icon: '🎭', desc: 'Technical writing, API documentation', price: '$20/mo', url: 'https://claude.ai', vendor: 'anthropic' },
        { id: 'gemini-w', label: 'Gemini', subtitle: 'Research', icon: '💎', desc: 'Technical research, fact-checking', price: 'Free/$20', url: 'https://gemini.google.com', vendor: 'google' },
        { id: 'notebooklm-w', label: 'NotebookLM', subtitle: 'Sources', icon: '📓', desc: 'Analyze source materials, create audio', price: 'Free', url: 'https://notebooklm.google.com', vendor: 'google' },
      ]},
      assistants: { label: 'Writing AI', icon: '🛠️', color: 'blue', colorHex: '#3b82f6', tools: [
        { id: 'grammarly', label: 'Grammarly', subtitle: 'Style', icon: '✍️', desc: 'AI writing assistant', price: 'Free/$12', url: 'https://grammarly.com', vendor: 'other' },
        { id: 'doc360', label: 'Document360', subtitle: 'Eddy AI', icon: '📚', desc: 'AI knowledge base', price: 'Contact', url: 'https://document360.com', vendor: 'other' },
      ]},
      orchestration: { label: 'Doc Agents', icon: '🎯', color: 'orange', colorHex: '#f97316', tools: [
        { id: 'mintlifyagent', label: 'Mintlify AI', subtitle: 'Self-update', icon: '🤖', desc: 'Auto-updating documentation', price: 'Free tier', url: 'https://mintlify.com', vendor: 'other' },
      ]},
      execution: { label: 'Doc Platforms', icon: '🚀', color: 'pink', colorHex: '#ec4899', tools: [
        { id: 'mintlify', label: 'Mintlify', subtitle: 'LLMs.txt', icon: '📖', desc: 'Used by Anthropic, Cursor', price: 'Free tier', url: 'https://mintlify.com', vendor: 'other' },
        { id: 'readme', label: 'ReadMe', subtitle: 'Interactive', icon: '📗', desc: 'Interactive API docs', price: 'Free tier', url: 'https://readme.com', vendor: 'other' },
      ]},
      productivity: { label: 'Side Productivity', icon: '📐', color: 'purple', colorHex: '#a855f7', tools: [
        { id: 'geminiworkspace-w', label: 'Gemini Workspace', subtitle: 'Docs', icon: '📄', desc: 'AI in Google Docs', price: '$20/mo', url: 'https://workspace.google.com', vendor: 'google' },
        { id: 'mermaid-w', label: 'Mermaid', subtitle: 'Flowcharts', icon: '🧜‍♀️', desc: 'Technical diagrams', price: 'OSS', url: 'https://mermaid.js.org', vendor: 'other' },
      ]}
    },
    target: { label: 'Published Docs', icon: '📚', subtitle: 'Clear documentation' }
  },
  data: {
    name: 'Data Engineer', icon: '📊', subtitle: 'ETL | Data Pipelines', color: '#06b6d4',
    layers: {
      thinking: { label: 'Data Strategy', icon: '🧠', color: 'emerald', colorHex: '#10b981', tools: [
        { id: 'claude-da', label: 'Claude', subtitle: 'Analysis', icon: '🎭', desc: 'Data architecture design', price: '$20/mo', url: 'https://claude.ai', vendor: 'anthropic' },
        { id: 'gemini-da', label: 'Gemini', subtitle: 'BigQuery Expert', icon: '💎', desc: 'GCP data stack expertise', price: 'Free/$20', url: 'https://gemini.google.com', vendor: 'google' },
        { id: 'chatgpt-da', label: 'ChatGPT', subtitle: 'Design', icon: '🤖', desc: 'Pipeline architecture', price: '$20/mo', url: 'https://chat.openai.com', vendor: 'openai' },
      ]},
      assistants: { label: 'Text-to-SQL', icon: '🛠️', color: 'blue', colorHex: '#3b82f6', tools: [
        { id: 'geminibigquery', label: 'Gemini in BigQuery', subtitle: 'Native', icon: '💎', desc: 'Natural language to SQL in BigQuery', price: 'Included', url: 'https://cloud.google.com/bigquery', vendor: 'google' },
        { id: 'vanna', label: 'Vanna.ai', subtitle: 'RAG SQL', icon: '🔮', desc: 'OSS RAG-based SQL', price: 'OSS', url: 'https://vanna.ai', vendor: 'other' },
        { id: 'databricks', label: 'Databricks AI', subtitle: '150K users', icon: '🧱', desc: 'SQL assistant', price: 'Included', url: 'https://databricks.com', vendor: 'other' },
        { id: 'snowflake', label: 'Snowflake Copilot', subtitle: 'GA', icon: '❄️', desc: 'Native SQL copilot', price: 'Included', url: 'https://snowflake.com', vendor: 'other' },
      ]},
      orchestration: { label: 'Pipeline Orchestration', icon: '🎯', color: 'orange', colorHex: '#f97316', tools: [
        { id: 'vertexai-da', label: 'Vertex AI Pipelines', subtitle: 'GCP', icon: '🏢', desc: 'Managed ML pipelines', price: 'Pay per use', url: 'https://cloud.google.com/vertex-ai', vendor: 'google' },
        { id: 'dagster', label: 'Dagster', subtitle: 'Components', icon: '📊', desc: 'Modern data orchestration', price: 'OSS', url: 'https://dagster.io', vendor: 'other' },
        { id: 'prefect', label: 'Prefect', subtitle: 'Workflows', icon: '🔀', desc: 'Python-native workflows', price: 'OSS', url: 'https://prefect.io', vendor: 'other' },
      ]},
      execution: { label: 'Data Quality', icon: '🚀', color: 'pink', colorHex: '#ec4899', tools: [
        { id: 'colabenterprise', label: 'Colab Enterprise', subtitle: 'Notebooks', icon: '📓', desc: 'Managed Jupyter with Gemini', price: 'GCP pricing', url: 'https://cloud.google.com/colab', vendor: 'google' },
        { id: 'montecarlo', label: 'Monte Carlo', subtitle: 'GenAI', icon: '🎰', desc: 'Data observability platform', price: 'Contact', url: 'https://montecarlodata.com', vendor: 'other' },
        { id: 'greatexp', label: 'Great Expectations', subtitle: 'Validation', icon: '✅', desc: 'Data validation framework', price: 'OSS', url: 'https://greatexpectations.io', vendor: 'other' },
      ]},
      productivity: { label: 'Data Catalogs', icon: '📐', color: 'purple', colorHex: '#a855f7', tools: [
        { id: 'dataplex', label: 'Dataplex', subtitle: 'GCP', icon: '🗂️', desc: 'Google data catalog and governance', price: 'GCP pricing', url: 'https://cloud.google.com/dataplex', vendor: 'google' },
        { id: 'atlan', label: 'Atlan', subtitle: 'Gartner Leader', icon: '🏆', desc: 'AI-powered data catalog', price: 'Contact', url: 'https://atlan.com', vendor: 'other' },
      ]}
    },
    target: { label: 'Data Warehouse', icon: '🏢', subtitle: 'BigQuery/Snowflake/Databricks' }
  },
  architect: {
    name: 'Solutions Architect', icon: '🏗️', subtitle: 'Cloud Architecture | FinOps', color: '#f59e0b',
    layers: {
      thinking: { label: 'Architecture Design', icon: '🧠', color: 'emerald', colorHex: '#10b981', tools: [
        { id: 'claude-a', label: 'Claude', subtitle: 'Design', icon: '🎭', desc: 'Architecture design and review', price: '$20/mo', url: 'https://claude.ai', vendor: 'anthropic' },
        { id: 'gemini-a', label: 'Gemini', subtitle: 'GCP Expert', icon: '💎', desc: 'Google Cloud architecture', price: 'Free/$20', url: 'https://gemini.google.com', vendor: 'google' },
        { id: 'aistudio-a', label: 'Google AI Studio', subtitle: 'Prototyping', icon: '🎨', desc: 'Prototype AI solutions', price: 'Free', url: 'https://aistudio.google.com', vendor: 'google' },
        { id: 'perplexity-a', label: 'Perplexity', subtitle: 'Research', icon: '🔍', desc: 'Best practices research', price: 'Free', url: 'https://perplexity.ai', vendor: 'other' },
      ]},
      assistants: { label: 'Cloud AI', icon: '🛠️', color: 'blue', colorHex: '#3b82f6', tools: [
        { id: 'geminicodeassist-a', label: 'Gemini Code Assist', subtitle: 'GCP', icon: '💎', desc: 'GCP infrastructure code', price: 'Free/$19', url: 'https://codeassist.google', vendor: 'google' },
        { id: 'amazonq-a', label: 'Amazon Q Dev', subtitle: 'AWS', icon: '☁️', desc: 'CloudFormation generation', price: 'Free', url: 'https://aws.amazon.com/q/', vendor: 'other' },
        { id: 'azurecopilot', label: 'Azure Copilot', subtitle: 'Bicep', icon: '🔷', desc: 'Bicep/ARM generation', price: 'Included', url: 'https://azure.microsoft.com', vendor: 'microsoft' },
      ]},
      orchestration: { label: 'Cost Optimization', icon: '🎯', color: 'orange', colorHex: '#f97316', tools: [
        { id: 'vertexai-a', label: 'Vertex AI', subtitle: 'ML Platform', icon: '🏢', desc: 'Enterprise AI platform', price: 'Pay per use', url: 'https://cloud.google.com/vertex-ai', vendor: 'google' },
        { id: 'spotio-a', label: 'Spot.io', subtitle: 'ML-driven', icon: '💰', desc: 'Cloud cost optimization', price: 'Sub', url: 'https://spot.io', vendor: 'other' },
        { id: 'castai', label: 'Cast.ai', subtitle: 'K8s', icon: '📉', desc: 'K8s auto-optimization', price: 'Free tier', url: 'https://cast.ai', vendor: 'other' },
      ]},
      execution: { label: 'IaC Generation', icon: '🚀', color: 'pink', colorHex: '#ec4899', tools: [
        { id: 'pulumi-a', label: 'Pulumi AI', subtitle: 'Multi-cloud', icon: '🌐', desc: 'Natural language to IaC', price: 'Free', url: 'https://pulumi.com', vendor: 'other' },
      ]},
      productivity: { label: 'Auto-Diagrams', icon: '📐', color: 'purple', colorHex: '#a855f7', tools: [
        { id: 'hava-a', label: 'Hava.io', subtitle: 'Live infra', icon: '🗺️', desc: 'Auto diagrams from cloud', price: 'Sub', url: 'https://hava.io', vendor: 'other' },
        { id: 'eraser', label: 'Eraser', subtitle: 'DiagramGPT', icon: '✏️', desc: 'AI architecture diagrams', price: 'Free tier', url: 'https://eraser.io', vendor: 'other' },
      ]}
    },
    target: { label: 'Cloud Architecture', icon: '☁️', subtitle: 'Multi-cloud design' }
  },
  manager: {
    name: 'Engineering Manager', icon: '👥', subtitle: 'Team Leadership | DevProd', color: '#6366f1',
    layers: {
      thinking: { label: 'Strategy & Planning', icon: '🧠', color: 'emerald', colorHex: '#10b981', tools: [
        { id: 'claude-m', label: 'Claude', subtitle: 'Strategy', icon: '🎭', desc: 'Team planning, 1:1 prep', price: '$20/mo', url: 'https://claude.ai', vendor: 'anthropic' },
        { id: 'gemini-m', label: 'Gemini', subtitle: 'Analysis', icon: '💎', desc: 'Team performance analysis', price: 'Free/$20', url: 'https://gemini.google.com', vendor: 'google' },
        { id: 'chatgpt-m', label: 'ChatGPT', subtitle: 'Planning', icon: '🤖', desc: 'Team strategy and planning', price: '$20/mo', url: 'https://chat.openai.com', vendor: 'openai' },
      ]},
      assistants: { label: 'Code Review AI', icon: '🛠️', color: 'blue', colorHex: '#3b82f6', tools: [
        { id: 'copilotent', label: 'Copilot Enterprise', subtitle: '$39/user', icon: '🐙', desc: 'Enterprise code review', price: '$39/user', url: 'https://github.com/features/copilot', vendor: 'microsoft' },
        { id: 'deepsource', label: 'DeepSource', subtitle: 'Analysis', icon: '🔍', desc: 'AI code quality analysis', price: 'Free tier', url: 'https://deepsource.io', vendor: 'other' },
      ]},
      orchestration: { label: 'Eng Intelligence', icon: '🎯', color: 'orange', colorHex: '#f97316', tools: [
        { id: 'linearb', label: 'LinearB', subtitle: 'DORA Free', icon: '📊', desc: 'Free DORA metrics', price: 'Free tier', url: 'https://linearb.io', vendor: 'other' },
        { id: 'jellyfish', label: 'Jellyfish', subtitle: 'R&D Cap', icon: '🪼', desc: 'R&D capitalization', price: 'Contact', url: 'https://jellyfish.co', vendor: 'other' },
      ]},
      execution: { label: 'Meeting AI', icon: '🚀', color: 'pink', colorHex: '#ec4899', tools: [
        { id: 'fireflies', label: 'Fireflies.ai', subtitle: '90%+ accuracy', icon: '🔥', desc: '69 languages transcription', price: '$10/mo', url: 'https://fireflies.ai', vendor: 'other' },
        { id: 'otter', label: 'Otter.ai', subtitle: 'Transcribe', icon: '🦦', desc: 'Meeting transcription', price: '$8/mo', url: 'https://otter.ai', vendor: 'other' },
      ]},
      productivity: { label: 'Side Productivity', icon: '📐', color: 'purple', colorHex: '#a855f7', tools: [
        { id: 'geminiworkspace-m', label: 'Gemini Workspace', subtitle: 'Docs/Slides', icon: '📄', desc: 'AI in team documents', price: '$20/mo', url: 'https://workspace.google.com', vendor: 'google' },
        { id: 'notion-m', label: 'Notion AI', subtitle: 'Team Docs', icon: '📓', desc: 'Team documentation', price: '$10/mo', url: 'https://notion.so', vendor: 'other' },
      ]}
    },
    target: { label: 'Team Productivity', icon: '📈', subtitle: 'DORA metrics improvement' }
  },
  mobile: {
    name: 'Mobile Developer', icon: '📱', subtitle: 'iOS | Android | Flutter', color: '#14b8a6',
    layers: {
      thinking: { label: 'Mobile Strategy', icon: '🧠', color: 'emerald', colorHex: '#10b981', tools: [
        { id: 'claude-mo', label: 'Claude', subtitle: 'Architecture', icon: '🎭', desc: 'Mobile architecture design', price: '$20/mo', url: 'https://claude.ai', vendor: 'anthropic' },
        { id: 'gemini-mo', label: 'Gemini', subtitle: 'Android Expert', icon: '💎', desc: 'Android development expertise', price: 'Free/$20', url: 'https://gemini.google.com', vendor: 'google' },
        { id: 'chatgpt-mo', label: 'ChatGPT', subtitle: 'Cross-platform', icon: '🤖', desc: 'Cross-platform strategies', price: '$20/mo', url: 'https://chat.openai.com', vendor: 'openai' },
      ]},
      assistants: { label: 'Mobile Code AI', icon: '🛠️', color: 'blue', colorHex: '#3b82f6', tools: [
        { id: 'androidstudio', label: 'Gemini in Android Studio', subtitle: 'Native', icon: '🤖', desc: 'AI coding for Android, Agent Mode', price: 'Free/$45', url: 'https://developer.android.com/studio/gemini', vendor: 'google' },
        { id: 'geminifirebase', label: 'Gemini in Firebase', subtitle: 'Full Stack', icon: '🔥', desc: 'Mobile backend with AI', price: 'Free tier', url: 'https://firebase.google.com', vendor: 'google' },
        { id: 'cursor-mo', label: 'Cursor', subtitle: 'Flutter/RN', icon: '📝', desc: 'Cross-platform development', price: '$20/mo', url: 'https://cursor.com', vendor: 'other' },
        { id: 'copilot-mo', label: 'GitHub Copilot', subtitle: 'Swift/Kotlin', icon: '🐙', desc: 'Mobile code completion', price: '$10/mo', url: 'https://github.com/features/copilot', vendor: 'microsoft' },
      ]},
      orchestration: { label: 'App Builders', icon: '🎯', color: 'orange', colorHex: '#f97316', tools: [
        { id: 'firebasestudio-mo', label: 'Firebase Studio', subtitle: 'Full App', icon: '🔥', desc: 'AI-powered app development', price: 'Free tier', url: 'https://firebase.studio', vendor: 'google' },
        { id: 'flutterflow', label: 'FlutterFlow', subtitle: 'Visual', icon: '🎨', desc: 'Visual Flutter builder', price: 'Free/$30', url: 'https://flutterflow.io', vendor: 'other' },
        { id: 'expo', label: 'Expo AI', subtitle: 'React Native', icon: '⚡', desc: 'RN development platform', price: 'Free tier', url: 'https://expo.dev', vendor: 'other' },
      ]},
      execution: { label: 'Testing & CI/CD', icon: '🚀', color: 'pink', colorHex: '#ec4899', tools: [
        { id: 'testsigma-mo', label: 'Testsigma', subtitle: 'Mobile', icon: '📱', desc: 'Mobile test automation', price: 'Free tier', url: 'https://testsigma.com', vendor: 'other' },
        { id: 'browserstack', label: 'BrowserStack', subtitle: 'Devices', icon: '📲', desc: 'Real device cloud', price: 'Contact', url: 'https://browserstack.com', vendor: 'other' },
      ]},
      productivity: { label: 'On-Device ML', icon: '📐', color: 'purple', colorHex: '#a855f7', tools: [
        { id: 'mlkit', label: 'ML Kit', subtitle: 'Google', icon: '🤖', desc: 'On-device ML for Android/iOS', price: 'Free', url: 'https://developers.google.com/ml-kit', vendor: 'google' },
        { id: 'coreml', label: 'Core ML', subtitle: 'iOS', icon: '🍎', desc: 'Apple on-device ML', price: 'Free', url: 'https://developer.apple.com/machine-learning/', vendor: 'other' },
      ]}
    },
    target: { label: 'App Store', icon: '📱', subtitle: 'iOS App Store / Google Play' }
  },
  game: {
    name: 'Game Developer', icon: '🎮', subtitle: 'Unity | Unreal | NPC AI', color: '#f43f5e',
    layers: {
      thinking: { label: 'Game Design', icon: '🧠', color: 'emerald', colorHex: '#10b981', tools: [
        { id: 'claude-g', label: 'Claude', subtitle: 'Narrative', icon: '🎭', desc: 'Story writing, dialogue trees', price: '$20/mo', url: 'https://claude.ai', vendor: 'anthropic' },
        { id: 'gemini-g', label: 'Gemini', subtitle: 'Multimodal', icon: '💎', desc: 'Visual asset analysis, concept art review', price: 'Free/$20', url: 'https://gemini.google.com', vendor: 'google' },
        { id: 'chatgpt-g', label: 'ChatGPT', subtitle: 'Game Design', icon: '🤖', desc: 'Game mechanics design', price: '$20/mo', url: 'https://chat.openai.com', vendor: 'openai' },
      ]},
      assistants: { label: 'Code & Assets', icon: '🛠️', color: 'blue', colorHex: '#3b82f6', tools: [
        { id: 'claudecode-g', label: 'Claude Code', subtitle: 'Game Logic', icon: '⌨️', desc: 'Game programming, shader code', price: 'API', url: 'https://claude.ai/code', vendor: 'anthropic' },
        { id: 'unityai', label: 'Unity AI', subtitle: 'Beta', icon: '🎮', desc: 'Unity Muse assistant', price: 'Included', url: 'https://unity.com', vendor: 'other' },
        { id: 'leonardo', label: 'Leonardo.AI', subtitle: 'Assets', icon: '🎨', desc: 'Game asset generation', price: 'Free tier', url: 'https://leonardo.ai', vendor: 'other' },
        { id: 'scenario', label: 'Scenario', subtitle: 'Consistent', icon: '🖼️', desc: 'Consistent game assets', price: 'Contact', url: 'https://scenario.com', vendor: 'other' },
      ]},
      orchestration: { label: 'NPC AI', icon: '🎯', color: 'orange', colorHex: '#f97316', tools: [
        { id: 'inworld', label: 'Inworld AI', subtitle: 'Ubisoft/Xbox', icon: '🤖', desc: 'AI character engine', price: 'Contact', url: 'https://inworld.ai', vendor: 'other' },
        { id: 'nvidiaace', label: 'NVIDIA ACE', subtitle: 'NPCs', icon: '🎭', desc: 'AI-powered game characters', price: 'Contact', url: 'https://nvidia.com/ace', vendor: 'other' },
      ]},
      execution: { label: 'Audio AI', icon: '🚀', color: 'pink', colorHex: '#ec4899', tools: [
        { id: 'aiva', label: 'AIVA', subtitle: '250+ styles', icon: '🎵', desc: 'AI game music composition', price: 'Free/$15', url: 'https://aiva.ai', vendor: 'other' },
        { id: 'elevenlabs', label: 'ElevenLabs', subtitle: 'Voice', icon: '🗣️', desc: 'AI character voices', price: 'Free/$5', url: 'https://elevenlabs.io', vendor: 'other' },
      ]},
      productivity: { label: 'Side Productivity', icon: '📐', color: 'purple', colorHex: '#a855f7', tools: [
        { id: 'notebooklm-g', label: 'NotebookLM', subtitle: 'Lore', icon: '📓', desc: 'Game lore organization', price: 'Free', url: 'https://notebooklm.google.com', vendor: 'google' },
        { id: 'mermaid-g', label: 'Mermaid', subtitle: 'Game Flows', icon: '🧜‍♀️', desc: 'Game flow diagrams', price: 'OSS', url: 'https://mermaid.js.org', vendor: 'other' },
      ]}
    },
    target: { label: 'Published Game', icon: '🎮', subtitle: 'Steam/Console/Mobile' }
  },
  nocode: {
    name: 'No-Code Builder', icon: '🔧', subtitle: 'Citizen Developer | Automation', color: '#8b5cf6',
    layers: {
      thinking: { label: 'Planning & Design', icon: '🧠', color: 'emerald', colorHex: '#10b981', tools: [
        { id: 'claude-nc', label: 'Claude', subtitle: 'Logic Design', icon: '🎭', desc: 'Plan app logic, workflow design', price: '$20/mo', url: 'https://claude.ai', vendor: 'anthropic' },
        { id: 'gemini-nc', label: 'Gemini', subtitle: 'App Planning', icon: '💎', desc: 'App architecture without code', price: 'Free/$20', url: 'https://gemini.google.com', vendor: 'google' },
        { id: 'chatgpt-nc', label: 'ChatGPT', subtitle: 'Requirements', icon: '🤖', desc: 'Define app requirements', price: '$20/mo', url: 'https://chat.openai.com', vendor: 'openai' },
      ]},
      assistants: { label: 'App Builders', icon: '🛠️', color: 'blue', colorHex: '#3b82f6', tools: [
        { id: 'appsheet', label: 'AppSheet', subtitle: 'Google', icon: '📱', desc: 'No-code app builder from Google', price: 'Free/$5/user', url: 'https://appsheet.com', vendor: 'google' },
        { id: 'firebasestudio-nc', label: 'Firebase Studio', subtitle: 'Vibe Code', icon: '🔥', desc: 'AI-powered full app development', price: 'Free tier', url: 'https://firebase.studio', vendor: 'google' },
        { id: 'powerapps', label: 'Power Apps', subtitle: 'Microsoft', icon: '⚡', desc: 'Enterprise no-code apps', price: '$20/user/mo', url: 'https://powerapps.microsoft.com', vendor: 'microsoft' },
        { id: 'bubble', label: 'Bubble', subtitle: 'Full Apps', icon: '🫧', desc: 'Visual web app builder', price: 'Free/$29/mo', url: 'https://bubble.io', vendor: 'other' },
        { id: 'retool', label: 'Retool', subtitle: 'Internal Tools', icon: '🔨', desc: 'Build internal tools fast', price: 'Free/$10/mo', url: 'https://retool.com', vendor: 'other' },
        { id: 'glide', label: 'Glide', subtitle: 'Mobile Apps', icon: '📲', desc: 'Spreadsheet to app', price: 'Free/$25/mo', url: 'https://glideapps.com', vendor: 'other' },
        { id: 'softr', label: 'Softr', subtitle: 'Airtable Apps', icon: '🧱', desc: 'Airtable-powered apps', price: 'Free/$49/mo', url: 'https://softr.io', vendor: 'other' },
      ]},
      orchestration: { label: 'Workflow Automation', icon: '🎯', color: 'orange', colorHex: '#f97316', tools: [
        { id: 'zapier', label: 'Zapier', subtitle: '7000+ Apps', icon: '⚡', desc: 'Connect apps, automate workflows', price: 'Free/$19/mo', url: 'https://zapier.com', vendor: 'other' },
        { id: 'make', label: 'Make', subtitle: 'Visual', icon: '🔄', desc: 'Advanced visual automation', price: 'Free/$9/mo', url: 'https://make.com', vendor: 'other' },
        { id: 'n8n-nc', label: 'n8n', subtitle: 'Self-host', icon: '🔀', desc: 'Open-source workflow automation', price: 'OSS/Cloud', url: 'https://n8n.io', vendor: 'other' },
        { id: 'powerautomate', label: 'Power Automate', subtitle: 'Microsoft', icon: '🌊', desc: 'Microsoft workflow automation', price: '$15/user/mo', url: 'https://powerautomate.microsoft.com', vendor: 'microsoft' },
        { id: 'workato', label: 'Workato', subtitle: 'Enterprise', icon: '🏢', desc: 'Enterprise integration platform', price: 'Contact', url: 'https://workato.com', vendor: 'other' },
      ]},
      execution: { label: 'Data & Databases', icon: '🚀', color: 'pink', colorHex: '#ec4899', tools: [
        { id: 'airtable', label: 'Airtable', subtitle: 'Spreadsheet DB', icon: '📊', desc: 'Spreadsheet-database hybrid', price: 'Free/$20/mo', url: 'https://airtable.com', vendor: 'other' },
        { id: 'notion-nc', label: 'Notion', subtitle: 'Workspace', icon: '📓', desc: 'All-in-one workspace with databases', price: 'Free/$10/mo', url: 'https://notion.so', vendor: 'other' },
        { id: 'coda', label: 'Coda', subtitle: 'Docs + Apps', icon: '📄', desc: 'Docs that work like apps', price: 'Free/$10/mo', url: 'https://coda.io', vendor: 'other' },
        { id: 'supabase', label: 'Supabase', subtitle: 'Backend', icon: '⚡', desc: 'Open source Firebase alternative', price: 'Free/$25/mo', url: 'https://supabase.com', vendor: 'other' },
      ]},
      productivity: { label: 'Analytics & BI', icon: '📐', color: 'purple', colorHex: '#a855f7', tools: [
        { id: 'lookerstudio', label: 'Looker Studio', subtitle: 'Google', icon: '📈', desc: 'Free BI dashboards from Google', price: 'Free', url: 'https://lookerstudio.google.com', vendor: 'google' },
        { id: 'powerbi', label: 'Power BI', subtitle: 'Microsoft', icon: '📊', desc: 'Business intelligence platform', price: 'Free/$10/mo', url: 'https://powerbi.microsoft.com', vendor: 'microsoft' },
        { id: 'metabase', label: 'Metabase', subtitle: 'OSS BI', icon: '📉', desc: 'Open source business intelligence', price: 'OSS/$85/mo', url: 'https://metabase.com', vendor: 'other' },
      ]}
    },
    target: { label: 'Working Application', icon: '🚀', subtitle: 'No code required' }
  },
  aiml: {
    name: 'AI/ML Engineer', icon: '🤖', subtitle: 'Models | Training | MLOps', color: '#ec4899',
    layers: {
      thinking: { label: 'Research & Planning', icon: '🧠', color: 'emerald', colorHex: '#10b981', tools: [
        { id: 'claude-ml', label: 'Claude', subtitle: 'Architecture', icon: '🎭', desc: 'ML system design, paper analysis', price: '$20/mo', url: 'https://claude.ai', vendor: 'anthropic' },
        { id: 'gemini-ml', label: 'Gemini', subtitle: 'Research', icon: '💎', desc: 'ML research, code explanation', price: 'Free/$20', url: 'https://gemini.google.com', vendor: 'google' },
        { id: 'notebooklm-ml', label: 'NotebookLM', subtitle: 'Papers', icon: '📓', desc: 'Analyze research papers', price: 'Free', url: 'https://notebooklm.google.com', vendor: 'google' },
        { id: 'chatgpt-ml', label: 'ChatGPT', subtitle: 'Coding', icon: '🤖', desc: 'ML code generation', price: '$20/mo', url: 'https://chat.openai.com', vendor: 'openai' },
        { id: 'perplexity-ml', label: 'Perplexity', subtitle: 'Papers', icon: '🔍', desc: 'Research with citations', price: 'Free/$20', url: 'https://perplexity.ai', vendor: 'other' },
      ]},
      assistants: { label: 'ML Development', icon: '🛠️', color: 'blue', colorHex: '#3b82f6', tools: [
        { id: 'claudecode-ml', label: 'Claude Code', subtitle: 'ML Code', icon: '⌨️', desc: 'Generate PyTorch, TensorFlow code', price: 'API', url: 'https://claude.ai/code', vendor: 'anthropic' },
        { id: 'colabenterprise-ml', label: 'Colab Enterprise', subtitle: 'Notebooks', icon: '📓', desc: 'Managed Jupyter with Gemini + GPUs', price: 'GCP pricing', url: 'https://cloud.google.com/colab', vendor: 'google' },
        { id: 'cursor-ml', label: 'Cursor', subtitle: 'ML IDE', icon: '📝', desc: 'AI-native IDE for ML', price: '$20/mo', url: 'https://cursor.com', vendor: 'other' },
        { id: 'copilot-ml', label: 'GitHub Copilot', subtitle: 'Code', icon: '🐙', desc: 'ML code completion', price: '$10/mo', url: 'https://github.com/features/copilot', vendor: 'microsoft' },
      ]},
      orchestration: { label: 'ML Frameworks & APIs', icon: '🎯', color: 'orange', colorHex: '#f97316', tools: [
        { id: 'vertexai-ml', label: 'Vertex AI', subtitle: 'Full Platform', icon: '🏢', desc: 'End-to-end ML platform, Model Garden', price: 'Pay per use', url: 'https://cloud.google.com/vertex-ai', vendor: 'google' },
        { id: 'claudeapi-ml', label: 'Claude API', subtitle: 'Anthropic', icon: '🎭', desc: 'Build with Claude models', price: 'Pay per token', url: 'https://docs.anthropic.com', vendor: 'anthropic' },
        { id: 'openaiapi', label: 'OpenAI API', subtitle: 'GPT/DALL-E', icon: '🤖', desc: 'GPT-4, DALL-E, Whisper APIs', price: 'Pay per token', url: 'https://platform.openai.com', vendor: 'openai' },
        { id: 'huggingface', label: 'Hugging Face', subtitle: 'Hub', icon: '🤗', desc: 'Model hub, Transformers library', price: 'Free/$9/mo', url: 'https://huggingface.co', vendor: 'other' },
        { id: 'langchain', label: 'LangChain', subtitle: 'Framework', icon: '🔗', desc: 'LLM application framework', price: 'OSS', url: 'https://langchain.com', vendor: 'other' },
        { id: 'llamaindex', label: 'LlamaIndex', subtitle: 'RAG', icon: '🦙', desc: 'Data framework for LLMs', price: 'OSS', url: 'https://llamaindex.ai', vendor: 'other' },
      ]},
      execution: { label: 'MLOps & Deployment', icon: '🚀', color: 'pink', colorHex: '#ec4899', tools: [
        { id: 'mlflow', label: 'MLflow', subtitle: 'Tracking', icon: '📊', desc: 'Experiment tracking, model registry', price: 'OSS', url: 'https://mlflow.org', vendor: 'other' },
        { id: 'wandb', label: 'Weights & Biases', subtitle: 'Experiments', icon: '📈', desc: 'ML experiment tracking', price: 'Free/$50/mo', url: 'https://wandb.ai', vendor: 'other' },
        { id: 'modal', label: 'Modal', subtitle: 'Serverless', icon: '⚡', desc: 'Serverless ML infrastructure', price: 'Pay per use', url: 'https://modal.com', vendor: 'other' },
        { id: 'replicate', label: 'Replicate', subtitle: 'Deploy', icon: '🔄', desc: 'Run ML models in the cloud', price: 'Pay per use', url: 'https://replicate.com', vendor: 'other' },
        { id: 'sagemaker', label: 'SageMaker', subtitle: 'AWS', icon: '☁️', desc: 'AWS ML platform', price: 'Pay per use', url: 'https://aws.amazon.com/sagemaker/', vendor: 'other' },
      ]},
      productivity: { label: 'Model Fine-tuning', icon: '📐', color: 'purple', colorHex: '#a855f7', tools: [
        { id: 'vertextuning', label: 'Vertex AI Tuning', subtitle: 'Google', icon: '🎚️', desc: 'Fine-tune Gemini models', price: 'Pay per use', url: 'https://cloud.google.com/vertex-ai', vendor: 'google' },
        { id: 'openaifinteune', label: 'OpenAI Fine-tuning', subtitle: 'GPT', icon: '🔧', desc: 'Fine-tune GPT models', price: 'Pay per token', url: 'https://platform.openai.com/docs/guides/fine-tuning', vendor: 'openai' },
        { id: 'together', label: 'Together AI', subtitle: 'Open Models', icon: '🤝', desc: 'Fine-tune open source models', price: 'Pay per use', url: 'https://together.ai', vendor: 'other' },
        { id: 'axolotl', label: 'Axolotl', subtitle: 'OSS', icon: '🦎', desc: 'Open source fine-tuning tool', price: 'OSS', url: 'https://github.com/OpenAccess-AI-Collective/axolotl', vendor: 'other' },
      ]}
    },
    target: { label: 'Production Model', icon: '🧠', subtitle: 'Deployed AI system' }
  },
};

const rolesList = [
  { key: 'developer', icon: '👨‍💻', label: 'Software' },
  { key: 'tester', icon: '🧪', label: 'QA/Tester' },
  { key: 'devops', icon: '⚙️', label: 'DevOps/SRE' },
  { key: 'security', icon: '🔒', label: 'Security' },
  { key: 'pm', icon: '📋', label: 'Product' },
  { key: 'designer', icon: '🎨', label: 'UX/UI' },
  { key: 'writer', icon: '📝', label: 'Tech Writer' },
  { key: 'data', icon: '📊', label: 'Data Eng' },
  { key: 'architect', icon: '🏗️', label: 'Architect' },
  { key: 'manager', icon: '👥', label: 'Eng Manager' },
  { key: 'mobile', icon: '📱', label: 'Mobile' },
  { key: 'game', icon: '🎮', label: 'Game Dev' },
  { key: 'nocode', icon: '🔧', label: 'No-Code' },
  { key: 'aiml', icon: '🤖', label: 'AI/ML' },
];

const vendorConfig: Record<string, { bg: string; text: string; label: string }> = {
  anthropic: { bg: 'bg-amber-600', text: 'text-white', label: 'Anthropic' },
  google: { bg: 'bg-blue-500', text: 'text-white', label: 'Google' },
  openai: { bg: 'bg-emerald-600', text: 'text-white', label: 'OpenAI' },
  microsoft: { bg: 'bg-cyan-500', text: 'text-white', label: 'Microsoft' },
  other: { bg: 'bg-gray-600', text: 'text-white', label: '' },
};

const layerGradients: Record<string, string> = {
  emerald: 'from-emerald-500 to-emerald-400',
  blue: 'from-blue-500 to-blue-400',
  orange: 'from-orange-500 to-orange-400',
  pink: 'from-pink-500 to-pink-400',
  purple: 'from-purple-500 to-purple-400',
};

// Tool Card Component
function ToolCard({ tool, onClick, isMobile }: { tool: Tool; onClick: () => void; isMobile: boolean }) {
  const vendor = vendorConfig[tool.vendor];

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15] transition-all text-left ${
        isMobile ? 'w-full' : ''
      }`}
    >
      <span className="text-xl flex-shrink-0">{tool.icon}</span>
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-white text-sm whitespace-nowrap">{tool.label}</span>
          {tool.vendor !== 'other' && (
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${vendor.bg} ${vendor.text}`}>
              {vendor.label}
            </span>
          )}
        </div>
        <p className="text-white/50 text-xs">{tool.subtitle}</p>
      </div>
    </button>
  );
}

// Layer Section Component
function LayerSection({ layer, onSelectTool, isMobile }: { layer: Layer; onSelectTool: (tool: Tool) => void; isMobile: boolean }) {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/[0.08]">
      {/* Top gradient bar */}
      <div className={`h-1 bg-gradient-to-r ${layerGradients[layer.color]}`} />

      <div className={`${isMobile ? 'p-3' : 'p-6'}`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${layerGradients[layer.color]} text-white text-sm font-medium`}>
            <span>{layer.icon}</span>
            <span className={isMobile ? 'text-xs' : ''}>{layer.label}</span>
          </div>
          <span className="text-white/40 text-sm">{layer.tools.length} Tools</span>
        </div>

        {/* Tools - Flex wrap centered */}
        <div className={`${isMobile ? 'flex flex-col gap-2' : 'flex flex-wrap justify-center gap-3'}`}>
          {layer.tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onClick={() => onSelectTool(tool)} isMobile={isMobile} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Arrow Connector
function ArrowConnector() {
  return (
    <div className="flex justify-center py-2">
      <div className="relative">
        <div className="w-0.5 h-8 bg-gradient-to-b from-white/30 to-white/10" />
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white/30" />
      </div>
    </div>
  );
}

// Sidebar
function Sidebar({ tool, onClose, isMobile }: { tool: Tool | null; onClose: () => void; isMobile: boolean }) {
  if (!tool) return null;
  const vendor = vendorConfig[tool.vendor];

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className={`fixed ${isMobile ? 'inset-x-0 bottom-0 h-[85vh] rounded-t-3xl' : 'right-0 top-0 h-full w-80'} bg-slate-900/98 backdrop-blur-xl border-l border-white/10 z-50 overflow-y-auto shadow-2xl`}>
        <div className={`${isMobile ? 'p-4' : 'p-5'}`}>
          <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>

          <div className="mt-8 space-y-5">
            <div className="flex items-center gap-4">
              <span className="text-5xl">{tool.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-white">{tool.label}</h2>
                <p className="text-sm text-white/50">{tool.subtitle}</p>
              </div>
            </div>

            {tool.vendor !== 'other' && (
              <div className="flex items-center gap-2">
                <div className={`w-3 h-2 rounded-sm ${vendor.bg}`} />
                <span className="text-sm text-white/70">{vendor.label}</span>
              </div>
            )}

            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-white/50 uppercase mb-2">Description</h3>
              <p className="text-white/90 text-sm leading-relaxed">{tool.desc}</p>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-white/50 uppercase mb-2">Pricing</h3>
              <p className="text-cyan-400 font-bold text-lg">{tool.price}</p>
            </div>

            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all"
            >
              Visit Website <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default function LearningPathsPage() {
  const [selectedRole, setSelectedRole] = useState<string>('developer');
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [completedTools, setCompletedTools] = useState<Set<string>>(new Set());
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const isMobile = useIsMobile();

  const role = rolesData[selectedRole];
  const totalTools = Object.values(role.layers).reduce((sum, layer) => sum + layer.tools.length, 0);

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Background Grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-lg md:text-xl font-bold text-white italic">SDLC.dev</span>
              </Link>
              <span className="text-white/30 hidden sm:inline">|</span>
              <span className="text-white/60 text-xs sm:text-sm hidden sm:inline">GenAI Learning Paths</span>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <div className="text-xs md:text-sm">
                <span className="text-white/50 hidden sm:inline">Progress </span>
                <span className="text-cyan-400 font-bold">{completedTools.size}/{totalTools}</span>
              </div>
              <Link href="/">
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 px-2 md:px-3">
                  <ArrowLeft className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Home</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Role Tabs */}
      <div className="sticky top-[57px] z-20 bg-slate-900/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Mobile: Dropdown selector */}
          {isMobile ? (
            <div className="relative">
              <button
                onClick={() => setShowRoleSelector(!showRoleSelector)}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{role.icon}</span>
                  <span>{role.name}</span>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${showRoleSelector ? 'rotate-180' : ''}`} />
              </button>
              {showRoleSelector && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800/98 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden z-30 max-h-[60vh] overflow-y-auto">
                  {rolesList.map(({ key, icon, label }) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedRole(key);
                        setShowRoleSelector(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                        selectedRole === key
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="text-xl">{icon}</span>
                      <span className="font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Desktop: Horizontal tabs with scroll */
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 min-w-max">
                {rolesList.map(({ key, icon, label }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedRole(key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      selectedRole === key
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                        : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vendor Legend - Fixed Left */}
      <div className="fixed left-4 top-36 z-10 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl p-3 hidden lg:block">
        <div className="text-[10px] text-white/50 mb-2 font-semibold uppercase">Vendors</div>
        <div className="space-y-1.5">
          {Object.entries(vendorConfig).filter(([k]) => k !== 'other').map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-4 h-2.5 rounded-sm ${config.bg}`} />
              <span className="text-white/70 text-xs">{config.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div className="w-4 h-2.5 rounded-sm bg-gray-500" />
            <span className="text-white/70 text-xs">Other</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className={`relative z-10 max-w-5xl mx-auto ${isMobile ? 'px-4 py-4' : 'px-6 py-8'}`}>
        {/* Role Header */}
        <div className={`text-center ${isMobile ? 'mb-4' : 'mb-8'}`}>
          <div
            className={`${isMobile ? 'w-16 h-16' : 'w-24 h-24'} rounded-full border-2 flex items-center justify-center mx-auto mb-3 bg-slate-800/50`}
            style={{ borderColor: role.color, boxShadow: `0 0 40px ${role.color}30` }}
          >
            <span className={isMobile ? 'text-3xl' : 'text-5xl'}>{role.icon}</span>
          </div>
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-white mb-1`}>{role.name}</h1>
          <p className="text-white/50 text-sm">{role.subtitle}</p>
        </div>

        <ArrowConnector />

        {/* Layers */}
        <div className={`${isMobile ? 'space-y-2' : 'space-y-3'}`}>
          <LayerSection layer={role.layers.thinking} onSelectTool={setSelectedTool} isMobile={isMobile} />
          <ArrowConnector />
          <LayerSection layer={role.layers.assistants} onSelectTool={setSelectedTool} isMobile={isMobile} />
          <ArrowConnector />
          <LayerSection layer={role.layers.orchestration} onSelectTool={setSelectedTool} isMobile={isMobile} />
          <ArrowConnector />
          <LayerSection layer={role.layers.execution} onSelectTool={setSelectedTool} isMobile={isMobile} />
          <ArrowConnector />
          <LayerSection layer={role.layers.productivity} onSelectTool={setSelectedTool} isMobile={isMobile} />
        </div>

        <ArrowConnector />

        {/* Target */}
        <div className="flex justify-center">
          <div className="text-center px-10 py-6 rounded-2xl border border-white/10 bg-slate-800/50 shadow-xl">
            <span className="text-4xl block mb-2">{role.target.icon}</span>
            <div className="font-bold text-white text-lg">{role.target.label}</div>
            <div className="text-white/50 text-sm">{role.target.subtitle}</div>
          </div>
        </div>
      </main>

      {/* Layer Legend - Fixed Bottom */}
      <div className="fixed left-4 bottom-4 z-10 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl p-3 hidden md:block">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-white/60">Thinking</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /><span className="text-white/60">Assistants</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-orange-500" /><span className="text-white/60">Orchestration</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-pink-500" /><span className="text-white/60">Execution</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-purple-500" /><span className="text-white/60">Productivity</span></div>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar tool={selectedTool} onClose={() => setSelectedTool(null)} isMobile={isMobile} />
    </div>
  );
}
