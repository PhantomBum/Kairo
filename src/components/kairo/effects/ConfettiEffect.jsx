import React, { useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

// Confetti presets for different occasions
const PRESETS = {
  celebrate: {
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  },
  fireworks: {
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    gravity: 0,
    decay: 0.94,
    origin: { y: 0.5 }
  },
  stars: {
    particleCount: 50,
    spread: 100,
    shapes: ['star'],
    colors: ['#FFD700', '#FFA500', '#FF6347']
  },
  snow: {
    particleCount: 50,
    spread: 100,
    origin: { y: 0 },
    gravity: 0.5,
    drift: 2,
    shapes: ['circle'],
    colors: ['#FFFFFF', '#E0E0E0', '#C0C0C0']
  },
  hearts: {
    particleCount: 30,
    spread: 100,
    shapes: ['circle'],
    colors: ['#FF69B4', '#FF1493', '#DC143C', '#FF0000']
  },
  rainbow: {
    particleCount: 100,
    spread: 180,
    origin: { y: 0.4 },
    colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3']
  }
};

export function useConfetti() {
  const fire = useCallback((preset = 'celebrate', options = {}) => {
    const config = { ...PRESETS[preset], ...options };
    
    if (preset === 'fireworks') {
      // Special fireworks animation
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          ...config,
          particleCount,
          origin: { x: Math.random(), y: Math.random() - 0.2 }
        });
      }, 250);
      return;
    }

    if (preset === 'snow') {
      // Continuous snow effect
      const duration = 5000;
      const animationEnd = Date.now() + duration;

      const frame = () => {
        confetti({
          ...config,
          particleCount: 2,
          origin: { x: Math.random(), y: 0 }
        });

        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      };
      frame();
      return;
    }

    // Default burst
    confetti({ ...config, zIndex: 9999 });
  }, []);

  const schoolPride = useCallback(() => {
    const end = Date.now() + 3000;
    const colors = ['#8B5CF6', '#6366F1'];

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
        zIndex: 9999
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
        zIndex: 9999
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return { fire, schoolPride };
}

// Auto-trigger confetti on special messages
export function ConfettiTrigger({ message }) {
  const { fire, schoolPride } = useConfetti();

  useEffect(() => {
    if (!message) return;
    
    const content = message.toLowerCase();
    
    // Trigger confetti for celebration keywords
    if (content.includes('🎉') || content.includes('congrat') || content.includes('celebrate')) {
      fire('celebrate');
    } else if (content.includes('🎆') || content.includes('firework')) {
      fire('fireworks');
    } else if (content.includes('❤️') || content.includes('love you')) {
      fire('hearts');
    } else if (content.includes('🌈') || content.includes('rainbow')) {
      fire('rainbow');
    } else if (content.includes('⭐') || content.includes('amazing') || content.includes('awesome')) {
      fire('stars');
    } else if (content.includes('gg') || content.includes('pog') || content.includes('lets go')) {
      schoolPride();
    }
  }, [message, fire, schoolPride]);

  return null;
}

export default function ConfettiButton({ preset = 'celebrate', children, className, ...props }) {
  const { fire } = useConfetti();

  return (
    <button
      onClick={() => fire(preset)}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}