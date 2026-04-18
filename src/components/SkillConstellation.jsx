import { useEffect, useRef, useState } from 'react';

/**
 * 3D Interactive Skill Constellation
 * Uses a custom Canvas 3D engine with Perspective Projection.
 */
export default function SkillConstellation({ skills = [] }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hoveredSkill, setHoveredSkill] = useState(null);
  
  const rotation = useRef({ x: 0, y: 0 });
  const mouse = useRef({ x: 0, y: 0, active: false });
  const nodes = useRef([]);

  useEffect(() => {
    if (!skills.length) return;

    // Initialize 3D points
    const techSkills = skills.slice(0, 15);
    nodes.current = techSkills.map((s, i) => {
      const phi = Math.acos(-1 + (2 * i) / techSkills.length);
      const theta = Math.sqrt(techSkills.length * Math.PI) * phi;
      return {
        name: s,
        x: Math.cos(theta) * Math.sin(phi) * 180,
        y: Math.sin(theta) * Math.sin(phi) * 180,
        z: Math.cos(phi) * 180,
        color: i % 2 === 0 ? '#14b8a6' : '#6366f1',
      };
    });

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;

    const resize = () => {
      const box = containerRef.current.getBoundingClientRect();
      canvas.width = box.width * window.devicePixelRatio;
      canvas.height = box.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const project = (x, y, z) => {
      const focalLength = 400;
      const scale = focalLength / (focalLength + z);
      return {
        x: x * scale + canvas.width / (2 * window.devicePixelRatio),
        y: y * scale + canvas.height / (2 * window.devicePixelRatio),
        scale
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Auto-rotation when mouse is not active
      if (!mouse.current.active) {
        rotation.current.y += 0.005;
        rotation.current.x += 0.002;
      }

      const sinX = Math.sin(rotation.current.x);
      const cosX = Math.cos(rotation.current.x);
      const sinY = Math.sin(rotation.current.y);
      const cosY = Math.cos(rotation.current.y);

      // Sort nodes by Z for depth rendering
      const renderedNodes = nodes.current.map(node => {
        // Rotate around Y
        let x1 = node.x * cosY - node.z * sinY;
        let z1 = node.z * cosY + node.x * sinY;
        // Rotate around X
        let y1 = node.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + node.y * sinX;

        return { ...node, tx: x1, ty: y1, tz: z2, ...project(x1, y1, z2) };
      }).sort((a, b) => b.tz - a.tz);

      // Draw connections (constellation lines)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < renderedNodes.length; i++) {
        for (let j = i + 1; j < renderedNodes.length; j++) {
            const dist = Math.sqrt(
                Math.pow(renderedNodes[i].tx - renderedNodes[j].tx, 2) +
                Math.pow(renderedNodes[i].ty - renderedNodes[j].ty, 2)
            );
            if (dist < 150) {
                ctx.moveTo(renderedNodes[i].x, renderedNodes[i].y);
                ctx.lineTo(renderedNodes[j].x, renderedNodes[j].y);
            }
        }
      }
      ctx.stroke();

      // Draw nodes
      renderedNodes.forEach(node => {
        const size = 3 * node.scale;
        
        // Glow effect
        const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, size * 4);
        grad.addColorStop(0, node.color);
        grad.addColorStop(1, 'transparent');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fill();

        // Label for top nodes
        if (node.scale > 0.8) {
          ctx.fillStyle = 'rgba(255,255,255,' + (node.scale - 0.5) + ')';
          ctx.font = `bold ${Math.round(10 * node.scale)}px Inter`;
          ctx.textAlign = 'center';
          ctx.fillText(node.name, node.x, node.y + 15 * node.scale);
        }
      });

      raf = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, [skills]);

  const handleMouseDown = (e) => {
    mouse.current.active = true;
    mouse.current.lastX = e.clientX;
    mouse.current.lastY = e.clientY;
  };

  const handleMouseMove = (e) => {
    if (!mouse.current.active) return;
    const dx = e.clientX - mouse.current.lastX;
    const dy = e.clientY - mouse.current.lastY;
    rotation.current.y += dx * 0.01;
    rotation.current.x += dy * 0.01;
    mouse.current.lastX = e.clientX;
    mouse.current.lastY = e.clientY;
  };

  const handleMouseUp = () => {
    mouse.current.active = false;
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[500px] cursor-grab active:cursor-grabbing bg-dark-bg/50 rounded-[3rem] border border-white/5 overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
      
      {/* HUD overlay */}
      <div className="absolute top-8 left-8 pointer-events-none">
        <p className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em] mb-1">Career DNA</p>
        <h3 className="text-xl font-black text-white">Skill Constellation</h3>
      </div>
      
      <div className="absolute bottom-8 right-8 text-right pointer-events-none">
        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Interact to explore</p>
      </div>
    </div>
  );
}
