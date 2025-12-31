'use client';

import { useState } from 'react';
import { useWizard } from '@/lib/idea-to-spec/wizard-context';

const EXAMPLE_IDEAS = [
  {
    title: 'E-commerce Platform',
    description: 'Online marketplace with cart, payments, and order tracking',
    idea: 'Build an e-commerce platform where vendors can list products, customers can browse and purchase items, with features like shopping cart, secure payments via Stripe, order tracking, reviews, and a recommendation engine based on browsing history.',
  },
  {
    title: 'Task Management App',
    description: 'Kanban-style project management tool',
    idea: 'Create a task management application with Kanban boards, drag-and-drop functionality, team collaboration, due dates and reminders, file attachments, time tracking, and integration with Slack and Google Calendar.',
  },
  {
    title: 'Learning Platform',
    description: 'Online courses with progress tracking',
    idea: 'Develop an online learning platform where instructors can create courses with video content, quizzes, and assignments. Students can enroll, track progress, earn certificates, participate in discussions, and receive personalized recommendations.',
  },
];

export function SparkStep() {
  const { state, setIdea } = useWizard();
  const [localIdea, setLocalIdea] = useState(state.idea);

  const handleIdeaChange = (value: string) => {
    setLocalIdea(value);
    setIdea(value);
  };

  const handleExampleClick = (example: typeof EXAMPLE_IDEAS[0]) => {
    setLocalIdea(example.idea);
    setIdea(example.idea);
  };

  return (
    <div className="space-y-6">
      {/* Main input card */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">✦</span>
          <div>
            <h2 className="text-xl font-semibold text-white">Capture Your Idea</h2>
            <p className="text-sm text-white/60">Describe your project in detail. The more context you provide, the better the specifications.</p>
          </div>
        </div>

        <textarea
          value={localIdea}
          onChange={(e) => handleIdeaChange(e.target.value)}
          placeholder="Describe your project idea in detail...

For example:
• What problem does it solve?
• Who are the users?
• What are the main features?
• Any specific technologies or integrations?"
          className="w-full h-64 bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 resize-none transition-all"
        />

        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-white/40">
            {localIdea.length} characters
          </span>
          {localIdea.length > 0 && (
            <button
              onClick={() => handleIdeaChange('')}
              className="text-sm text-white/40 hover:text-red-400 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Example ideas */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-medium text-white/60 mb-4 flex items-center gap-2">
          <span>💡</span>
          Need inspiration? Try these examples:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {EXAMPLE_IDEAS.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              className="text-left p-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-orange-500/30 rounded-xl transition-all group"
            >
              <h4 className="font-medium text-white group-hover:text-orange-400 transition-colors">
                {example.title}
              </h4>
              <p className="text-sm text-white/50 mt-1">{example.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="flex items-start gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
        <span className="text-orange-400 text-lg">ℹ️</span>
        <div className="text-sm text-orange-200/80">
          <strong className="text-orange-300">Pro tip:</strong> Include details about user roles, key features, integrations, and any constraints. This helps generate more accurate diagrams and specifications.
        </div>
      </div>
    </div>
  );
}
