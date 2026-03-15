import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Lock, Send, X, Shield, AlertTriangle } from 'lucide-react';

const P = {
  base: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  floating: '#2e2e37', border: '#33333d',
  textPrimary: '#f0eff4', textSecondary: '#a09fad', muted: '#68677a',
  accent: '#2dd4bf', success: '#34d399', danger: '#f87171',
};

function SecretMessage({ msg, isOwn }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className="max-w-[70%] px-3.5 py-2 rounded-2xl" style={{
        background: isOwn ? `${P.success}18` : P.elevated,
        borderBottomRightRadius: isOwn ? 4 : 16,
        borderBottomLeftRadius: isOwn ? 16 : 4,
      }}>
        {!isOwn && (
          <p className="text-[11px] font-semibold mb-0.5" style={{ color: P.success }}>{msg.author_name}</p>
        )}
        <p className="text-[13px] leading-relaxed" style={{ color: P.textPrimary }}>{msg.content}</p>
        <p className="text-[11px] text-right mt-0.5" style={{ color: P.muted }}>
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

export default function SecretChatView({ currentUserId, currentUserName, otherUserName, onExit }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      content: text,
      author_id: currentUserId,
      author_name: currentUserName,
      timestamp: new Date().toISOString(),
    }]);
    setInput('');
  }, [input, currentUserId, currentUserName]);

  const handleExit = useCallback(() => {
    setMessages([]);
    onExit();
  }, [onExit]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Secret chat banner */}
      <div className="px-4 py-3 flex items-center gap-3" style={{ background: `${P.success}08`, borderBottom: `1px solid ${P.success}20` }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${P.success}15` }}>
          <Lock className="w-4 h-4" style={{ color: P.success }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold" style={{ color: P.success }}>Secret Chat</p>
          <p className="text-[11px] leading-snug" style={{ color: P.muted }}>
            Messages are end-to-end encrypted and disappear when you leave. They are never stored on Kairo's servers.
          </p>
        </div>
        <button onClick={handleExit}
          className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors hover:brightness-110"
          style={{ background: `${P.danger}15`, color: P.danger }}>
          Leave
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-none px-4 py-4">
        {messages.length === 0 && (
          <div className="text-center py-16 k-fade-in">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: `${P.success}10` }}>
              <Shield className="w-7 h-7" style={{ color: P.success, opacity: 0.5 }} />
            </div>
            <p className="text-[15px] font-semibold mb-1" style={{ color: P.textSecondary }}>This is a Secret Chat</p>
            <p className="text-[13px] max-w-sm mx-auto leading-relaxed" style={{ color: P.muted }}>
              Messages are end-to-end encrypted and disappear when you leave. They are never stored on Kairo's servers.
            </p>
            <div className="flex items-center gap-2 justify-center mt-4 px-3 py-2 rounded-lg mx-auto w-fit"
              style={{ background: `${P.warning}08`, border: `1px solid ${P.warning}15` }}>
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: P.warning }} />
              <span className="text-[11px]" style={{ color: P.warning }}>Both users must be online. No offline delivery.</span>
            </div>
          </div>
        )}
        {messages.map(msg => (
          <SecretMessage key={msg.id} msg={msg} isOwn={msg.author_id === currentUserId} />
        ))}
      </div>

      {/* Input */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl"
          style={{ background: P.elevated, border: `1px solid ${P.success}30` }}>
          <Lock className="w-4 h-4 flex-shrink-0" style={{ color: P.success, opacity: 0.5 }} />
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={`Message ${otherUserName} secretly...`}
            className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#68677a]"
            style={{ color: P.textPrimary }} />
          {input.trim() && (
            <button onClick={handleSend}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:brightness-110"
              style={{ background: P.success }}>
              <Send className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function SecretChatConfirmModal({ otherUserName, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onCancel}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden k-fade-in" style={{ background: P.floating, border: `1px solid ${P.border}` }}
        onClick={e => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: `${P.success}12` }}>
            <Lock className="w-6 h-6" style={{ color: P.success }} />
          </div>
          <h3 className="text-[16px] font-bold mb-2" style={{ color: P.textPrimary }}>Start Secret Chat?</h3>
          <p className="text-[13px] leading-relaxed mb-1" style={{ color: P.textSecondary }}>
            Start an encrypted conversation with <strong>{otherUserName}</strong>.
          </p>
          <p className="text-[12px] leading-relaxed" style={{ color: P.muted }}>
            Messages will not be stored and will disappear when either of you leaves.
            Both users must be online simultaneously.
          </p>
        </div>
        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-colors"
            style={{ background: P.elevated, color: P.textSecondary }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:brightness-110"
            style={{ background: P.success, color: '#fff' }}>
            Start Secret Chat
          </button>
        </div>
      </div>
    </div>
  );
}
