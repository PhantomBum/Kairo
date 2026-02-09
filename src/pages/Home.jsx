import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function HomePage() {
  const navigate = useNavigate();
  useEffect(() => { navigate(createPageUrl('KairoV4')); }, [navigate]);
  return null;
}