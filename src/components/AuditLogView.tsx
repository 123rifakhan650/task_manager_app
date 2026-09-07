import React, { useState, useEffect } from 'react';
import {
  History, Search, ShieldCheck, Filter, Clock, User as UserIcon,
  HardDrive, Lock, ShieldAlert, KeyRound, CheckCircle2, AlertTriangle,
  RefreshCw, Users, ArrowRight, Shield, Sparkles, ChevronDown, Eye
} from 'lucide-react';
import { AuditLog, User } from '../types';
import { api } from '../api';

interface AuditLogViewProps {
  auditLogs: AuditLog[];
  currentUser: User | null;
  onRefreshLogs?: () => Promise<void>;
  onUserUpdated?: (updatedUser: User) => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  auditLogs,
  currentUser,
  onRefreshLogs,
  onUserUpdated,
}) => {
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Check strict authorization: ONLY Rifa Khanum (rifakhanum14@gmail.com)
  const isAuthorized = Boolean(
    currentUser && (
      (currentUser.email || '').trim().toLowerCase() === 'rifakhanum14@gmail.com' ||
      (currentUser.username || '').trim().toLowerCase() === 'rifakhanum14@gmail.com' ||
      (currentUser.username || '').trim().toLowerCase() === 'rifakhanum' ||
      (currentUser.username || '').trim().toLowerCase() === 'rifa'
    )
  );

  // If user is restricted (NOT Rifa Khanum)
  if (!isAuthorized) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto py-6">
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-rose-900/60 p-8 rounded-2xl text-center space-y-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-800 flex items-center justify-center mx-auto text-rose-400 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-white">Access Denied: Confidential Audit Ledger</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              System audit logs, event tracking, and security records are strictly private and accessible <strong className="text-emerald-400">exclusively to Admin Rifa Khanum (rifakhanum14@gmail.com)</strong>.
            </p>
          </div>

          <div className="max-w-md mx-auto bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-left space-y-2.5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Current Session Status</div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Logged in Account:</span>
              <span className="font-mono text-slate-200 font-medium">{currentUser?.email || currentUser?.username || 'Guest'}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Assigned Role:</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700">
                {currentUser?.role || 'member'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Audit Log Permission:</span>
              <span className="flex items-center gap-1 text-rose-400 font-semibold font-mono">
                <Lock className="w-3.5 h-3.5" /> FORBIDDEN (Rifa Khanum only)
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            To view confidential audit records, log out and sign in using your Admin account: <span className="text-emerald-400 font-mono">rifakhanum14@gmail.com</span>.
          </p>
        </div>
      </div>
    );
  }

  // If user IS authorized
  const uniqueActions = Array.from(new Set(auditLogs.map(l => l.action)));
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      search === '' ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.username.toLowerCase().includes(search.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      (log.ip_address && log.ip_address.includes(search));
    const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Ledger • Accessible exclusively to Rifa Khanum (rifakhanum14@gmail.com)</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">System Audit & Security Logs</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable tracking for task actions, lifecycle state changes, user sessions, and AI operations.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {onRefreshLogs && (
            <button
              onClick={onRefreshLogs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Refresh</span>
            </button>
          )}
          <div className="flex items-center gap-2 font-mono text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span>{auditLogs.length} Events Logged</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by keyword, actor, action, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Actions ({auditLogs.length})</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
          {onRefreshLogs && (
            <button
              onClick={() => onRefreshLogs()}
              title="Refresh ledger"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800 text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4 text-right">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                    className="hover:bg-slate-800/50 cursor-pointer transition"
                  >
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded font-semibold border ${
                          log.action.includes('REGISTER') || log.action.includes('LOGIN')
                            ? 'bg-blue-950 text-blue-300 border-blue-800'
                            : log.action.includes('CREATE')
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : log.action.includes('COMPLETE')
                            ? 'bg-teal-950 text-teal-300 border-teal-800'
                            : log.action.includes('GEMINI') || log.action.includes('AI')
                            ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                            : log.action.includes('GRANT') || log.action.includes('REVOKE') || log.action.includes('DENIED')
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : log.action.includes('CHANGE')
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {log.entity_type}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-200 whitespace-nowrap flex items-center gap-1.5">
                      <UserIcon className="w-3 h-3 text-slate-500" />
                      <span>{log.username}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-md truncate">
                      {log.details}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Log Detail Modal */}
      {selectedLog && (
        <div className="bg-slate-900 border border-slate-700 p-5 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Audit Entry Inspector</span>
            </div>
            <button
              onClick={() => setSelectedLog(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Action</span>
              <span className="font-semibold text-emerald-400">{selectedLog.action}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Entity</span>
              <span className="text-slate-200">{selectedLog.entity_type} {selectedLog.entity_id}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Actor</span>
              <span className="text-slate-200">{selectedLog.username}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Client IP</span>
              <span className="font-mono text-slate-300">{selectedLog.ip_address || '127.0.0.1'}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase font-mono mb-1">Payload / Description</span>
            <pre className="text-xs font-mono bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300 whitespace-pre-wrap">
              {selectedLog.details}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
