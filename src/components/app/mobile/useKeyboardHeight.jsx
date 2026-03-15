import { useState, useEffect } from 'react';

export function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    let lastHeight = vv.height;

    function onResize() {
      const diff = window.innerHeight - vv.height;
      const kbHeight = diff > 50 ? diff : 0;
      setKeyboardHeight(kbHeight);
      lastHeight = vv.height;
    }

    vv.addEventListener('resize', onResize);
    vv.addEventListener('scroll', onResize);

    return () => {
      vv.removeEventListener('resize', onResize);
      vv.removeEventListener('scroll', onResize);
    };
  }, []);

  return keyboardHeight;
}

export function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return mobile;
}
