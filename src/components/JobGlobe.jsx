import { useEffect, useRef } from 'react';

/**
 * 3D Interactive Job Opportunity Globe
 * Visualizes job locations as glowing pins on a 3D sphere.
 */
export default function JobGlobe({ jobs = [] }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const rotation = useRef({ x: 0.1, y: 0 });
  const mouse = useRef({ x: 0, y: 0, active: false });
  
  // Mock geodata for demonstration
  const LOCATIONS = {
    'india': { lat: 20, lng: 78 },
    'bangalore': { lat: 12, lng: 77 },
    'mumbai': { lat: 19, lng: 72 },
    'delhi': { lat: 28, lng: 77 },
    'usa': { lat: 37, lng: -95 },
    'san francisco': { lat: 37, lng: -122 },
    'new york': { lat: 40, lng: -74 },
    'remote': { lat: 0, lng: 0 },
    'london': { lat: 51, lng: 0 },
    'germany': { lat: 51, lng: 10 },
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;

    const resize = () => {
      const box = containerRef.current.getBoundingClientRect();
      canvas.width = box.width * window.devicePixelRatio;
      canvas.height = box.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    // Lat/Lng to 3D Cartesian
    const latLngToVector = (lat, lng, radius) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      return {
        x: -radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.cos(phi),
        z: radius * Math.sin(phi) * Math.sin(theta)
      };
    };

    const project = (x, y, z) => {
      const focalLength = 500;
      const scale = focalLength / (focalLength + z);
      return {
        x: x * scale + canvas.width / (2 * window.devicePixelRatio),
        y: y * scale + canvas.height / (2 * window.devicePixelRatio),
        scale
      };
    };

    // Create globe points (grid)
    const points = [];
    for (let lat = -90; lat <= 90; lat += 10) {
        for (let lng = -180; lng <= 180; lng += 15) {
            points.push(latLngToVector(lat, lng, 160));
        }
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (!mouse.current.active) {
        rotation.current.y += 0.003;
      }

      const sinX = Math.sin(rotation.current.x);
      const cosX = Math.cos(rotation.current.x);
      const sinY = Math.sin(rotation.current.y);
      const cosY = Math.cos(rotation.current.y);

      // Render Globe Grid
      ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
      points.forEach(p => {
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.z * cosY + p.x * sinY;
        let y1 = p.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.y * sinX;

        if (z2 > -50) { // Only draw front half mostly
          const proj = project(x1, y1, z2);
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, 0.8 * proj.scale, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Render Job Markers
      jobs.forEach((job, i) => {
        const locStr = (job.location || '').toLowerCase();
        const coords = Object.keys(LOCATIONS).find(k => locStr.includes(k)) 
          ? LOCATIONS[Object.keys(LOCATIONS).find(k => locStr.includes(k))]
          : { lat: 20 + (i * 5) % 40, lng: 70 + (i * 10) % 60 }; // Fallback randomish
        
        const pos = latLngToVector(coords.lat, coords.lng, 165);
        let x1 = pos.x * cosY - pos.z * sinY;
        let z1 = pos.z * cosY + pos.x * sinY;
        let y1 = pos.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + pos.y * sinX;

        if (z2 > -50) {
          const proj = project(x1, y1, z2);
          const pulse = (Math.sin(Date.now() / 200 + i) + 1) / 2;
          
          // Outer Glow
          const grad = ctx.createRadialGradient(proj.x, proj.y, 0, proj.x, proj.y, 15 * proj.scale);
          grad.addColorStop(0, `rgba(45, 212, 191, ${0.4 * pulse})`);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, 15 * proj.scale, 0, Math.PI * 2);
          ctx.fill();

          // Core
          ctx.fillStyle = job.matchScore >= 80 ? '#2dd4bf' : '#f59e0b';
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, 3 * proj.scale, 0, Math.PI * 2);
          ctx.fill();
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
  }, [jobs]);

  const handleMouseDown = (e) => {
    mouse.current.active = true;
    mouse.current.lastX = e.clientX;
    mouse.current.lastY = e.clientY;
  };

  const handleMouseMove = (e) => {
    if (!mouse.current.active) return;
    const dx = e.clientX - mouse.current.lastX;
    const dy = e.clientY - mouse.current.lastY;
    rotation.current.y += dx * 0.005;
    rotation.current.x += dy * 0.005;
    mouse.current.lastX = e.clientX;
    mouse.current.lastY = e.clientY;
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[400px] cursor-grab active:cursor-grabbing bg-dark-bg/20 rounded-[3rem] border border-white/5 overflow-hidden group"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={() => mouse.current.active = false}
      onMouseLeave={() => mouse.current.active = false}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         <div className="w-[320px] h-[320px] rounded-full border border-brand-500/10 animate-pulse-slow"></div>
      </div>

      <div className="absolute top-8 left-10 pointer-events-none">
         <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-1">Global Market</p>
         <h3 className="text-xl font-black text-white">Live Opportunity Globe</h3>
      </div>

      <div className="absolute bottom-8 left-10 flex items-center gap-6 pointer-events-none">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-500 shadow-neon-glow"></div>
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">High Match</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Potential</span>
         </div>
      </div>
    </div>
  );
}
