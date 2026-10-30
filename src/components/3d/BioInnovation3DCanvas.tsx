import React, { useEffect, useRef, useState } from 'react';
import { Activity, ShieldCheck, Zap, Sparkles } from 'lucide-react';

interface Node3D {
  x: number;
  y: number;
  z: number;
  radius: number;
  color: string;
  label: string;
  subLabel: string;
  orbitRadius: number;
  orbitSpeed: number;
  angle: number;
  tilt: number;
}

export const BioInnovation3DCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeNode, setActiveNode] = useState<string>('Central Health Gateway');
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 480);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || 600;
      height = canvas.height = canvas.parentElement?.clientHeight || 480;
    };
    window.addEventListener('resize', handleResize);

    // Camera perspective settings
    const fov = 420;
    let cameraAngleY = 0;
    let cameraAngleX = 0.2;
    let targetCameraAngleY = 0;
    let targetCameraAngleX = 0.2;

    // Define 3D Healthcare Nodes orbiting in space
    const nodes: Node3D[] = [
      {
        x: 0,
        y: 0,
        z: 0,
        radius: 12,
        color: '#0d9488', // Teal
        label: 'NABH Hospitals',
        subLabel: 'Emergency & Bed Grid',
        orbitRadius: 150,
        orbitSpeed: 0.008,
        angle: 0,
        tilt: 0.35,
      },
      {
        x: 0,
        y: 0,
        z: 0,
        radius: 10,
        color: '#0284c7', // Healthcare Blue
        label: 'Specialist Doctors',
        subLabel: 'OPD & Telehealth',
        orbitRadius: 190,
        orbitSpeed: -0.006,
        angle: Math.PI * 0.4,
        tilt: -0.25,
      },
      {
        x: 0,
        y: 0,
        z: 0,
        radius: 10,
        color: '#059669', // Mint Green
        label: 'Smart Pharmacies',
        subLabel: 'QR Barcodes & Stock',
        orbitRadius: 230,
        orbitSpeed: 0.005,
        angle: Math.PI * 0.8,
        tilt: 0.45,
      },
      {
        x: 0,
        y: 0,
        z: 0,
        radius: 9,
        color: '#8b5cf6', // Bio Purple
        label: 'Diagnostic Labs',
        subLabel: 'Pathology Reports',
        orbitRadius: 130,
        orbitSpeed: -0.01,
        angle: Math.PI * 1.2,
        tilt: -0.4,
      },
      {
        x: 0,
        y: 0,
        z: 0,
        radius: 11,
        color: '#f59e0b', // Amber / Gold
        label: 'ABHA Citizens',
        subLabel: 'Health Records & Vitals',
        orbitRadius: 210,
        orbitSpeed: 0.007,
        angle: Math.PI * 1.6,
        tilt: 0.2,
      },
    ];

    // Background floating bio-particles
    const particles = Array.from({ length: 65 }, () => ({
      x: (Math.random() - 0.5) * 550,
      y: (Math.random() - 0.5) * 450,
      z: (Math.random() - 0.5) * 400,
      size: Math.random() * 2 + 0.8,
      opacity: Math.random() * 0.5 + 0.2,
      speed: Math.random() * 0.003 + 0.001,
    }));

    let pulse = 0;

    const render = () => {
      pulse += 0.03;
      ctx.clearRect(0, 0, width, height);

      // Smooth camera interpolation based on cursor
      cameraAngleY += (targetCameraAngleY - cameraAngleY) * 0.05;
      cameraAngleX += (targetCameraAngleX - cameraAngleX) * 0.05;

      const cosY = Math.cos(cameraAngleY);
      const sinY = Math.sin(cameraAngleY);
      const cosX = Math.cos(cameraAngleX);
      const sinX = Math.sin(cameraAngleX);

      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Draw glowing ambient background radial gradient
      const bgGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, width * 0.45);
      bgGrad.addColorStop(0, 'rgba(20, 184, 166, 0.12)');
      bgGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.04)');
      bgGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Render background ambient 3D stars/bio-particles
      particles.forEach((p) => {
        // Rotate particle in 3D
        const px1 = p.x * cosY - p.z * sinY;
        const pz1 = p.z * cosY + p.x * sinY;
        const py1 = p.y * cosX - pz1 * sinX;
        const pz2 = pz1 * cosX + p.y * sinX + 350;

        if (pz2 > 20) {
          const scale = fov / pz2;
          const sx = centerX + px1 * scale;
          const sy = centerY + py1 * scale;

          ctx.beginPath();
          ctx.arc(sx, sy, p.size * scale * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(13, 148, 136, ${p.opacity * Math.min(1, scale)})`;
          ctx.fill();
        }
      });

      // 3. Central Core Projection (Bharat HealthConnect Hub)
      const coreZ = 350;
      const coreScale = fov / coreZ;
      const corePulse = Math.sin(pulse) * 4;

      // Multi-layer glowing core rings
      ctx.beginPath();
      ctx.arc(centerX, centerY, (34 + corePulse) * coreScale, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(20, 184, 166, 0.15)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, (24 + corePulse * 0.5) * coreScale, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(13, 148, 136, 0.4)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, 16 * coreScale, 0, Math.PI * 2);
      ctx.fillStyle = '#0f766e';
      ctx.fill();

      // Core Highlight
      ctx.beginPath();
      ctx.arc(centerX - 4 * coreScale, centerY - 4 * coreScale, 6 * coreScale, 0, Math.PI * 2);
      ctx.fillStyle = '#99f6e4';
      ctx.fill();

      // 4. Update and Project 3D Nodes
      const projectedNodes: Array<Node3D & { sx: number; sy: number; scale: number; pz: number }> = [];

      nodes.forEach((node) => {
        node.angle += node.orbitSpeed;

        // Calculate 3D coordinates based on orbit and tilt
        const rawX = Math.cos(node.angle) * node.orbitRadius;
        const rawZ = Math.sin(node.angle) * node.orbitRadius;
        const rawY = Math.sin(node.angle) * Math.sin(node.tilt) * node.orbitRadius;

        // Apply 3D Camera Rotation Matrix
        const x1 = rawX * cosY - rawZ * sinY;
        const z1 = rawZ * cosY + rawX * sinY;
        const y1 = rawY * cosX - z1 * sinX;
        const z2 = z1 * cosX + rawY * sinX + 350;

        if (z2 > 20) {
          const scale = fov / z2;
          const sx = centerX + x1 * scale;
          const sy = centerY + y1 * scale;
          projectedNodes.push({ ...node, sx, sy, scale, pz: z2 });
        }
      });

      // Sort by depth (painter's algorithm)
      projectedNodes.sort((a, b) => b.pz - a.pz);

      // Draw connection vectors and 3D orbital path hints
      projectedNodes.forEach((node) => {
        // Line from central hub to orbiting node
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(node.sx, node.sy);
        const lineGrad = ctx.createLinearGradient(centerX, centerY, node.sx, node.sy);
        lineGrad.addColorStop(0, 'rgba(20, 184, 166, 0.4)');
        lineGrad.addColorStop(1, `${node.color}55`);
        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = Math.max(1, 1.8 * node.scale);
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Node Glow Halo
        ctx.beginPath();
        ctx.arc(node.sx, node.sy, (node.radius + 6) * node.scale, 0, Math.PI * 2);
        ctx.fillStyle = `${node.color}25`;
        ctx.fill();

        // Node Body
        ctx.beginPath();
        ctx.arc(node.sx, node.sy, node.radius * node.scale, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        // 3D Specular Highlight on Node
        ctx.beginPath();
        ctx.arc(node.sx - 2 * node.scale, node.sy - 2 * node.scale, (node.radius * 0.35) * node.scale, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.fill();

        // 3D Text Label
        if (node.scale > 0.8) {
          ctx.font = `600 ${Math.max(11, Math.round(12 * node.scale))}px Inter, sans-serif`;
          ctx.fillStyle = '#0f172a';
          ctx.textAlign = 'center';
          ctx.fillText(node.label, node.sx, node.sy + (node.radius + 15) * node.scale);

          ctx.font = `400 ${Math.max(9, Math.round(10 * node.scale))}px Inter, sans-serif`;
          ctx.fillStyle = '#64748b';
          ctx.fillText(node.subLabel, node.sx, node.sy + (node.radius + 27) * node.scale);
        }
      });

      // Core Text Label
      ctx.font = '700 13px Inter, sans-serif';
      ctx.fillStyle = '#0f766e';
      ctx.textAlign = 'center';
      ctx.fillText('Bharat HealthConnect', centerX, centerY - 32 * coreScale);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Mouse interactive camera tilt
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      targetCameraAngleY = x * 0.6;
      targetCameraAngleX = 0.2 + y * 0.3;
      setMouseOffset({ x, y });
    };

    const handleMouseLeave = () => {
      targetCameraAngleY = 0;
      targetCameraAngleX = 0.2;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[420px] rounded-3xl overflow-hidden bg-gradient-to-br from-teal-900/5 via-slate-900/5 to-sky-900/10 border border-teal-500/20 shadow-3d-card flex items-center justify-center select-none ${className}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D Spatial Hologram Badges */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-teal-100 shadow-sm animate-float-3d">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
        <span className="text-xs font-bold text-slate-800 tracking-wide">3D Telemetry Grid Active</span>
      </div>

      <div className="absolute bottom-4 right-4 z-20 pointer-events-none flex items-center gap-2 bg-white/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200/80 shadow-3d-card">
        <ShieldCheck className="w-4 h-4 text-teal-600" />
        <div className="text-left">
          <p className="text-[10px] uppercase font-bold text-slate-400">Security Core</p>
          <p className="text-xs font-bold text-slate-800">FHIR HL7 • ABHA Gateway</p>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-20 pointer-events-none hidden sm:flex items-center gap-2 bg-white/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200/80 shadow-3d-card">
        <Activity className="w-4 h-4 text-sky-600" />
        <div className="text-left">
          <p className="text-[10px] uppercase font-bold text-slate-400">Real-Time Sync</p>
          <p className="text-xs font-bold text-slate-800">6 Portals Interconnected</p>
        </div>
      </div>

      {/* Interaction Hint */}
      <div className="absolute top-4 right-4 z-20 pointer-events-none text-right">
        <span className="text-[11px] font-medium text-teal-800 bg-teal-50/90 border border-teal-200/80 px-2.5 py-1 rounded-full shadow-sm">
          Move cursor to rotate 3D Mesh
        </span>
      </div>
    </div>
  );
};
