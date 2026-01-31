import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldCheck, ShieldAlert, Lock, Mail, Clock, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/kairo/v4/primitives/Button';

// Verification levels
export const VERIFICATION_LEVELS = {
  none: {
    level: 0,
    name: 'None',
    description: 'Unrestricted',
    icon: Shield,
    requirements: [],
  },
  low: {
    level: 1,
    name: 'Low',
    description: 'Must have a verified email',
    icon: Mail,
    requirements: ['email_verified'],
  },
  medium: {
    level: 2,
    name: 'Medium', 
    description: 'Must be registered for longer than 5 minutes',
    icon: Clock,
    requirements: ['email_verified', 'account_age_5min'],
  },
  high: {
    level: 3,
    name: 'High',
    description: 'Must be a member of the server for longer than 10 minutes',
    icon: ShieldCheck,
    requirements: ['email_verified', 'account_age_5min', 'member_age_10min'],
  },
  highest: {
    level: 4,
    name: 'Highest',
    description: 'Must have a verified phone number',
    icon: Phone,
    requirements: ['email_verified', 'account_age_5min', 'member_age_10min', 'phone_verified'],
  },
};

// Check if user meets verification requirements
export function checkVerification(user, member, server) {
  const level = server?.settings?.verification_level || 'none';
  const config = VERIFICATION_LEVELS[level];
  
  if (!config) return { passed: true, missing: [] };
  
  const missing = [];
  
  for (const req of config.requirements) {
    switch (req) {
      case 'email_verified':
        // In this app, having an email means verified
        if (!user?.email) missing.push('Verified email');
        break;
      
      case 'account_age_5min':
        const accountAge = Date.now() - new Date(user?.created_date).getTime();
        if (accountAge < 5 * 60 * 1000) missing.push('Account age (5 minutes)');
        break;
      
      case 'member_age_10min':
        const memberAge = Date.now() - new Date(member?.joined_at).getTime();
        if (memberAge < 10 * 60 * 1000) missing.push('Member age (10 minutes)');
        break;
      
      case 'phone_verified':
        // Not implemented in this app
        break;
    }
  }
  
  return {
    passed: missing.length === 0,
    missing,
    level: config.level,
  };
}

// Verification gate component
export function VerificationGate({ user, member, server, children }) {
  const result = checkVerification(user, member, server);
  
  if (result.passed) return children;
  
  const config = VERIFICATION_LEVELS[server?.settings?.verification_level || 'none'];
  const Icon = config.icon;
  
  return (
    <div className="flex-1 flex items-center justify-center bg-[#09090b]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md text-center p-8"
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
          <Icon className="w-8 h-8 text-amber-400" />
        </div>
        
        <h2 className="text-xl font-semibold text-white mb-3">
          Verification Required
        </h2>
        
        <p className="text-sm text-zinc-400 mb-4">
          This server requires verification level: <strong>{config.name}</strong>
        </p>
        
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4 mb-6">
          <p className="text-xs text-zinc-500 uppercase mb-2">Missing Requirements</p>
          <ul className="space-y-1">
            {result.missing.map((req, i) => (
              <li key={i} className="text-sm text-zinc-400 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {req}
              </li>
            ))}
          </ul>
        </div>
        
        <p className="text-xs text-zinc-600">
          Please wait until you meet the requirements to interact in this server.
        </p>
      </motion.div>
    </div>
  );
}

// Verification level selector for server settings
export function VerificationLevelSelector({ value, onChange, disabled }) {
  return (
    <div className="space-y-3">
      {Object.entries(VERIFICATION_LEVELS).map(([key, config]) => {
        const Icon = config.icon;
        const isSelected = value === key;
        
        return (
          <button
            key={key}
            onClick={() => !disabled && onChange(key)}
            disabled={disabled}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-lg text-left transition-all',
              isSelected 
                ? 'bg-indigo-500/10 border border-indigo-500/40' 
                : 'bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04]',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              isSelected ? 'bg-indigo-500/20' : 'bg-white/[0.04]'
            )}>
              <Icon className={cn(
                'w-5 h-5',
                isSelected ? 'text-indigo-400' : 'text-zinc-500'
              )} />
            </div>
            <div className="flex-1">
              <p className={cn(
                'text-sm font-medium',
                isSelected ? 'text-white' : 'text-zinc-300'
              )}>
                {config.name}
              </p>
              <p className="text-xs text-zinc-500">{config.description}</p>
            </div>
            {isSelected && (
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}