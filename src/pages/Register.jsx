import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    try {
      await base44.auth.register({ email: email.trim(), password, full_name: name.trim() || email.split('@')[0] });
      toast.success('Account created. Sign in to continue.');
      navigate('/login');
    } catch (err) {
      toast.error(err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="k-page">
      <div className="k-box">
        <div className="k-center">
          <div className="k-logo">K</div>
          <h1 className="k-title">Create account</h1>
          <p className="k-subtitle">Get started with Kairo</p>
        </div>
        <form onSubmit={handleSubmit}>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Display name" autoComplete="name" className="k-input" />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required autoComplete="email" className="k-input" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required minLength={6} autoComplete="new-password" className="k-input" />
          <button type="submit" disabled={loading} className="k-btn k-btn-primary k-btn-full">{loading ? '…' : 'Create account'}</button>
        </form>
        <p className="k-center k-text k-mt">Already have an account? <a href="/login" className="k-link">Sign in</a></p>
      </div>
    </div>
  );
}
