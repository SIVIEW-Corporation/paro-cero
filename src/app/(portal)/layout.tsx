'use client';

import { useEffect, useRef } from 'react';
import Navbar from '@/app/dashboard/components/Navbar';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  color: string;
  phase: number;
}

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const particles: Particle[] = [];
    const PARTICLE_COUNT = 80;
    const COLORS = [
      '#ee9c4a',
      '#ee9c4a',
      '#ee9c4a',
      '#ee9c4a',
      '#ee9c4a',
      '#ee9c4a',
      '#ee9c4a',
      '#d4c9af',
      '#d4c9af',
      '#d4c9af',
    ];

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function createParticles() {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          size: Math.random() * 1.5 + 0.5,
          speedY: -(Math.random() * 0.1 + 0.03),
          speedX: Math.random() * 0.06 - 0.03,
          opacity: Math.random() * 0.22 + 0.05,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    function animate(time: number) {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(time * 0.0005 + p.phase) * 0.1;

        if (p.y < -2) p.y = canvas.height + 2;
        if (p.x < -2) p.x = canvas.width + 2;
        if (p.x > canvas.width + 2) p.x = -2;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animationId = requestAnimationFrame(animate);
    }

    resize();
    createParticles();
    animationId = requestAnimationFrame(animate);

    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className='pointer-events-none absolute inset-0 -z-10'
      style={{ width: '100%', height: '100%' }}
    />
  );
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='w-full overflow-x-hidden'>
      <Navbar />
      <main className='relative min-h-screen w-full overflow-hidden py-20'>
        <ParticleCanvas />
        {children}
      </main>
    </div>
  );
}
