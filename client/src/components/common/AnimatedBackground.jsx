import { useEffect, useRef, memo } from 'react';

/**
 * AnimatedBackground — Floating gradient orbs + particle canvas.
 * Variants: 'landing' | 'auth' | 'ambient'
 */
function AnimatedBackground({ variant = 'ambient' }) {
  const canvasRef = useRef(null);

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];

    const config = {
      landing: { count: 50, speed: 0.3, size: 2.5, opacity: 0.5 },
      auth:    { count: 35, speed: 0.25, size: 2, opacity: 0.4 },
      ambient: { count: 20, speed: 0.15, size: 1.5, opacity: 0.25 },
    }[variant] || { count: 20, speed: 0.15, size: 1.5, opacity: 0.25 };

    const colors = [
      'rgba(123, 47, 242,',   // purple
      'rgba(0, 196, 204,',    // teal
      'rgba(228, 75, 194,',   // pink
      'rgba(255, 190, 11,',   // gold
      'rgba(0, 199, 129,',    // green
    ];

    const resize = () => {
      canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
      canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };

    const createParticles = () => {
      particles = [];
      for (let i = 0; i < config.count; i++) {
        particles.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          vx: (Math.random() - 0.5) * config.speed,
          vy: (Math.random() - 0.5) * config.speed,
          size: Math.random() * config.size + 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * config.opacity + 0.1,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.01 + Math.random() * 0.02,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;

        // Wrap around
        if (p.x < -10) p.x = canvas.offsetWidth + 10;
        if (p.x > canvas.offsetWidth + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.offsetHeight + 10;
        if (p.y > canvas.offsetHeight + 10) p.y = -10;

        const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
        const currentSize = p.size * (0.8 + 0.2 * Math.sin(p.pulse));

        // Glow
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentSize * 4);
        gradient.addColorStop(0, `${p.color}${currentAlpha})`);
        gradient.addColorStop(1, `${p.color}0)`);
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, currentSize * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.fillStyle = `${p.color}${currentAlpha * 1.5})`;
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connection lines (landing + auth only)
      if (variant !== 'ambient') {
        const maxDist = 120;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < maxDist) {
              const lineAlpha = (1 - dist / maxDist) * 0.08;
              ctx.strokeStyle = `rgba(123, 47, 242, ${lineAlpha})`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    resize();
    createParticles();
    draw();

    window.addEventListener('resize', () => {
      resize();
      createParticles();
    });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [variant]);

  // Orb configurations per variant
  const orbs = {
    landing: [
      { className: 'orb orb-1', style: { width: '500px', height: '500px', top: '-10%', left: '-8%', background: 'radial-gradient(circle, rgba(123,47,242,0.18) 0%, transparent 70%)' } },
      { className: 'orb orb-2', style: { width: '400px', height: '400px', top: '20%', right: '-5%', background: 'radial-gradient(circle, rgba(0,196,204,0.15) 0%, transparent 70%)' } },
      { className: 'orb orb-3', style: { width: '350px', height: '350px', bottom: '5%', left: '20%', background: 'radial-gradient(circle, rgba(228,75,194,0.12) 0%, transparent 70%)' } },
      { className: 'orb orb-4', style: { width: '280px', height: '280px', top: '60%', right: '25%', background: 'radial-gradient(circle, rgba(255,190,11,0.1) 0%, transparent 70%)' } },
      { className: 'orb orb-5', style: { width: '200px', height: '200px', top: '40%', left: '10%', background: 'radial-gradient(circle, rgba(0,199,129,0.1) 0%, transparent 70%)' } },
    ],
    auth: [
      { className: 'orb orb-1', style: { width: '400px', height: '400px', top: '-15%', right: '-10%', background: 'radial-gradient(circle, rgba(123,47,242,0.14) 0%, transparent 70%)' } },
      { className: 'orb orb-2', style: { width: '350px', height: '350px', bottom: '-10%', left: '-5%', background: 'radial-gradient(circle, rgba(228,75,194,0.10) 0%, transparent 70%)' } },
      { className: 'orb orb-3', style: { width: '250px', height: '250px', top: '30%', left: '60%', background: 'radial-gradient(circle, rgba(0,196,204,0.10) 0%, transparent 70%)' } },
    ],
    ambient: [
      { className: 'orb orb-ambient-1', style: { width: '300px', height: '300px', top: '-5%', right: '-3%', background: 'radial-gradient(circle, rgba(123,47,242,0.06) 0%, transparent 70%)' } },
      { className: 'orb orb-ambient-2', style: { width: '250px', height: '250px', bottom: '10%', left: '-2%', background: 'radial-gradient(circle, rgba(0,196,204,0.05) 0%, transparent 70%)' } },
    ],
  };

  const currentOrbs = orbs[variant] || orbs.ambient;

  return (
    <div className={`animated-bg animated-bg-${variant}`}>
      {currentOrbs.map((orb, i) => (
        <div key={i} className={orb.className} style={orb.style} />
      ))}
      <canvas
        ref={canvasRef}
        className="particle-canvas"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

export default memo(AnimatedBackground);
