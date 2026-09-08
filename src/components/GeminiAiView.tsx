import React, { useState } from 'react';
import {
  Sparkles, CheckCircle2, Bot, Send,
  Calendar, Clock, AlertCircle, RefreshCw, Check,
  MessageSquare, Trash2, Edit3, Plus
} from 'lucide-react';
import { GeminiTaskPreview, Priority, Task } from '../types';

interface GeminiAiViewProps {
  tasks?: Task[];
  onDeleteTask?: (taskId: number) => Promise<void>;
  onGenerateTask: (prompt: string, category: string, priority: Priority) => Promise<GeminiTaskPreview>;
  onConfirmTask: (preview: GeminiTaskPreview, originalPrompt: string) => Promise<void>;
  onAskAssistant: (message: string) => Promise<string>;
}

export const GeminiAiView: React.FC<GeminiAiViewProps> = ({
  tasks = [],
  onDeleteTask,
  onGenerateTask,
  onConfirmTask,
  onAskAssistant,
}) => {
  // Task Prompt & Generation state
  const [prompt, setPrompt] = useState('Prepare presentation start tomorrow due Friday priority HIGH comments draft slides first');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState<Priority>('HIGH');
  const [isGenerating, setIsGenerating] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);

  // Preview state
  const [preview, setPreview] = useState<GeminiTaskPreview | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmedSuccess, setConfirmedSuccess] = useState(false);

  // Assistant state
  const [assistantMessage, setAssistantMessage] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: 'Hello! I am your AI Task Assistant. I can help you create, edit, or delete tasks directly in your tracker using plain English. For example:\n• "Create task Pay electricity bill start today due tomorrow priority URGENT"\n• "Edit task 1 change priority to HIGH"\n• "Delete task Prepare presentation"',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setConfirmedSuccess(false);
    try {
      const result = await onGenerateTask(prompt.trim(), category, priority);
      setPreview(result);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirm = async () => {
    if (!preview) return;
    setIsConfirming(true);
    try {
      await onConfirmTask(preview, prompt);
      setConfirmedSuccess(true);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = (messageText || assistantMessage).trim();
    if (!textToSend) return;
    if (!messageText) setAssistantMessage('');

    setChatHistory(prev => [
      ...prev,
      { role: 'user', text: textToSend, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);

    setIsAsking(true);
    try {
      const reply = await onAskAssistant(textToSend);
      setChatHistory(prev => [
        ...prev,
        { role: 'assistant', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const samplePrompts = [
    'Prepare quarterly presentation start tomorrow due Friday priority HIGH comments draft slides first',
    'Pay office electricity bill start today due tomorrow priority URGENT comments pending online banking login',
    'Review client vendor agreement start Monday due Wednesday priority MEDIUM comments check indemnification section',
    'Renew health insurance policy due next Friday priority HIGH comments pending HR clearance documents',
  ];

  const quickAssistantActions = [
    'Create task: Prepare presentation start tomorrow due Friday priority HIGH comments draft slides first',
    'Delete task: Prepare presentation',
    'Set priority of Prepare presentation to URGENT',
    'Mark task Prepare presentation as COMPLETED',
    'Delete last task',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          Task Assistant
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">AI Task Manager</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Give plain English instructions to create, edit, or delete tasks in your task tracker with dates, priority, description, and pending comments.
        </p>
      </div>

      {/* Grid: Task Generator + Preview & Chat Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Generate Task from Prompt */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <div className="pb-2 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Generate Task from Prompt
              </h3>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                Plain English
              </span>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Enter task details in plain English
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Prepare presentation start tomorrow due Friday priority HIGH comments draft slides first"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition placeholder-slate-500"
                />
              </div>

              {/* Sample Prompts */}
              <div>
                <span className="text-[11px] text-slate-500 block mb-1.5 font-medium">Quick examples:</span>
                <div className="flex flex-col gap-1.5">
                  {samplePrompts.map((sp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(sp)}
                      className="text-[11px] text-slate-400 hover:text-slate-200 bg-slate-800/70 hover:bg-slate-800 px-2.5 py-1.5 rounded border border-slate-700/60 truncate max-w-full transition text-left"
                    >
                      {sp}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow transition flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Extracting Task Details...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Task</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Preview Generated Task */}
          {preview && (
            <div className="rounded-xl border border-emerald-800/70 bg-slate-900 p-5 space-y-4 shadow-lg animate-in fade-in-50">
              <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-base font-semibold text-white">Generated Task Preview</h3>
                </div>
                <span className="text-xs text-emerald-400 font-medium">
                  Ready to add
                </span>
              </div>

              <div className="space-y-3 bg-slate-800/40 p-4 rounded-lg border border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`font-mono text-xs px-2.5 py-0.5 rounded font-semibold uppercase ${
                      preview.priority === 'URGENT'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : preview.priority === 'HIGH'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : preview.priority === 'MEDIUM'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    Priority: {preview.priority}
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Task Title</label>
                  <h4 className="text-base font-bold text-white mt-0.5">{preview.title}</h4>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-slate-800/60 p-2.5 rounded border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 font-medium block flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-emerald-400" /> Start Date
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-200 mt-0.5 block">
                      {preview.start_date || 'Today'}
                    </span>
                  </div>
                  <div className="bg-slate-800/60 p-2.5 rounded border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 font-medium block flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-rose-400" /> Due Date
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-200 mt-0.5 block">
                      {preview.due_date || 'Not set'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Description</label>
                  <p className="text-xs text-slate-300 leading-relaxed mt-0.5">{preview.description}</p>
                </div>

                {preview.comments && (
                  <div className="bg-amber-950/40 border border-amber-800/60 p-3 rounded-lg">
                    <div className="flex items-center gap-1.5 text-amber-300 text-xs font-semibold mb-1">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                      Comments / Pending Items
                    </div>
                    <p className="text-xs text-amber-200/90 leading-relaxed">{preview.comments}</p>
                  </div>
                )}
              </div>

              {/* Confirm & Add */}
              <div className="pt-2 flex items-center justify-between">
                {confirmedSuccess ? (
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    Task added to your tracker!
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">Review details and add to your tracker</span>
                )}
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isConfirming || confirmedSuccess}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow flex items-center gap-2 transition"
                >
                  {isConfirming ? (
                    'Adding to Tracker...'
                  ) : confirmedSuccess ? (
                    'Added'
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Add to My Tasks</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* AI Tasks in Tracker */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
            <div className="pb-2 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">AI Tasks in Tracker</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                {tasks.filter(t => t.is_ai_generated || (t.tags && t.tags.includes('ai-task'))).length} Tasks
              </span>
            </div>

            {tasks.filter(t => t.is_ai_generated || (t.tags && t.tags.includes('ai-task'))).length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                No AI-generated tasks in tracker yet. Generate one above or use the assistant chat.
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {tasks
                  .filter(t => t.is_ai_generated || (t.tags && t.tags.includes('ai-task')))
                  .map(task => (
                    <div
                      key={task.id}
                      className="p-3 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 flex items-center justify-between gap-3 transition"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">{task.title}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold uppercase ${
                              task.priority === 'URGENT'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : task.priority === 'HIGH'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-blue-950 text-blue-300 border border-blue-800'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                          <span>Due: {task.due_date || 'No deadline'}</span>
                          {task.comments_text && (
                            <span className="truncate max-w-[180px] text-amber-300/90">
                              Note: {task.comments_text}
                            </span>
                          )}
                        </div>
                      </div>

                      {onDeleteTask && (
                        <button
                          type="button"
                          onClick={async () => {
                            setDeletingTaskId(task.id);
                            try {
                              await onDeleteTask(task.id);
                            } finally {
                              setDeletingTaskId(null);
                            }
                          }}
                          disabled={deletingTaskId === task.id}
                          className="p-2 rounded bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-800 transition shrink-0"
                          title="Delete AI task"
                        >
                          {deletingTaskId === task.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-400" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Assistant for Create, Edit, Delete */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 flex flex-col h-[650px] shadow-sm">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-base font-semibold text-white">Task Assistant Chat</h3>
                <p className="text-xs text-slate-400">Tell AI to create, edit, or delete tasks directly</p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/80">
              Interactive
            </span>
          </div>

          {/* Quick Actions Bar */}
          <div className="py-2 border-b border-slate-800 flex flex-wrap gap-1.5">
            <span className="text-[10px] text-slate-500 self-center font-medium mr-1">Quick prompts:</span>
            {quickAssistantActions.map((qa, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(qa)}
                className="text-[11px] bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white px-2 py-1 rounded border border-slate-700 transition"
              >
                {qa}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
            {chatHistory.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={index}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-indigo-300 mb-1">
                        <Bot className="w-3.5 h-3.5 text-indigo-400" /> Task Assistant
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.time}</span>
                </div>
              );
            })}
            {isAsking && (
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 p-2.5 rounded-lg w-fit">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                <span>Processing task action...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="pt-3 border-t border-slate-800 flex gap-2"
          >
            <input
              type="text"
              placeholder="e.g. create task ..., edit task 1 set priority HIGH, delete task 1"
              value={assistantMessage}
              onChange={(e) => setAssistantMessage(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={isAsking || !assistantMessage.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
