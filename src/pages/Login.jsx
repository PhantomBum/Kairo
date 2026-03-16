import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email.trim(), password);
      navigate(searchParams.get('returnUrl') || '/');
    } catch (err) {
      toast.error(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="k-page">
      <div className="k-box">
        <div className="k-center">
          <div className="k-logo">K</div>
          <h1 className="k-title">Welcome back</h1>
          <p className="k-subtitle">Sign in to continue</p>
        </div>
        <form onSubmit={handleSubmit}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required autoComplete="email" className="k-input" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required autoComplete="current-password" className="k-input" />
          <button type="submit" disabled={loading} className="k-btn k-btn-primary k-btn-full">{loading ? '…' : 'Sign in'}</button>
        </form>
        <p className="k-center k-text k-mt">Don't have an account? <a href="/register" className="k-link">Sign up</a></p>
      </div>
    </div>
  );
}
