import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Network, ArrowLeft, ZoomIn, ZoomOut, Maximize, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock data for the graph
const MOCK_NODES = [];


const MOCK_LINKS = [];


export default function KnowledgeGraph() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Simple physics simulation for the graph (mocking d3-force)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    // Initialize node positions randomly
    const nodes = MOCK_NODES.map(node => ({
      ...node,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0
    }));

    const links = MOCK_LINKS.map(link => ({
      ...link,
      sourceNode: nodes.find(n => n.id === link.source),
      targetNode: nodes.find(n => n.id === link.target)
    }));

    let animationFrameId: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw links
      ctx.lineWidth = 1;
      links.forEach(link => {
        if (!link.sourceNode || !link.targetNode) return;
        
        ctx.beginPath();
        ctx.moveTo(link.sourceNode.x, link.sourceNode.y);
        ctx.lineTo(link.targetNode.x, link.targetNode.y);
        
        // Highlight links connected to hovered node
        if (hoveredNode && (link.source === hoveredNode.id || link.target === hoveredNode.id)) {
          ctx.strokeStyle = 'rgba(201, 166, 70, 0.8)'; // Gold
          ctx.lineWidth = 2;
        } else {
          ctx.strokeStyle = 'rgba(156, 163, 175, 0.2)'; // Gray
        }
        
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, 2 * Math.PI);
        
        // Colors based on group
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        ctx.fillStyle = colors[(node.group - 1) % colors.length];
        
        // Highlight hovered or searched node
        const isSearched = searchQuery && node.label.toLowerCase().includes(searchQuery.toLowerCase());
        if ((hoveredNode && hoveredNode.id === node.id) || isSearched) {
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = 15;
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#fff';
          ctx.stroke();
        } else {
          ctx.shadowBlur = 0;
        }
        
        ctx.fill();

        // Draw labels
        ctx.fillStyle = '#1f2937'; // Dark gray
        ctx.font = `${node.size > 25 ? 'bold 14px' : '12px'} Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Only show labels for larger nodes or if hovered/searched
        if (node.size > 25 || (hoveredNode && hoveredNode.id === node.id) || isSearched) {
          // Add a subtle white background for text readability
          const textWidth = ctx.measureText(node.label).width;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fillRect(node.x - textWidth/2 - 4, node.y + node.size + 4, textWidth + 8, 16);
          
          ctx.fillStyle = '#1f2937';
          ctx.fillText(node.label, node.x, node.y + node.size + 12);
        }
      });

      // Simple physics step
      nodes.forEach(node => {
        // Pull towards center
        node.vx += (width / 2 - node.x) * 0.001;
        node.vy += (height / 2 - node.y) * 0.001;

        // Repel from other nodes
        nodes.forEach(other => {
          if (node === other) return;
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            node.vx += dx * 0.005;
            node.vy += dy * 0.005;
          }
        });

        // Pull towards connected nodes
        links.forEach(link => {
          if (link.sourceNode === node && link.targetNode) {
            const dx = link.targetNode.x - node.x;
            const dy = link.targetNode.y - node.y;
            node.vx += dx * 0.002;
            node.vy += dy * 0.002;
          } else if (link.targetNode === node && link.sourceNode) {
            const dx = link.sourceNode.x - node.x;
            const dy = link.sourceNode.y - node.y;
            node.vx += dx * 0.002;
            node.vy += dy * 0.002;
          }
        });

        // Apply velocity and friction
        node.x += node.vx;
        node.y += node.vy;
        node.vx *= 0.9;
        node.vy *= 0.9;
        
        // Keep within bounds
        node.x = Math.max(node.size, Math.min(width - node.size, node.x));
        node.y = Math.max(node.size, Math.min(height - node.size, node.y));
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    // Handle mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const hovered = nodes.find(node => {
        const dx = node.x - x;
        const dy = node.y - y;
        return Math.sqrt(dx * dx + dy * dy) < node.size;
      });
      
      setHoveredNode(hovered || null);
      if (hovered) {
        canvas.style.cursor = 'pointer';
      } else {
        canvas.style.cursor = 'default';
      }
    };

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [searchQuery]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-[#f8f9fa]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 shadow-sm z-10">
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={() => navigate('/knowledge')}
            className="p-1.5 sm:p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-serif font-bold text-gray-900 flex items-center gap-2">
              <Network className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              Knowledge Graph Explorer
            </h1>
            <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">Visualizing connections across the Golden Minds curriculum</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics..."
              className="pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 bg-gray-100 border-transparent rounded-lg text-xs sm:text-sm focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all w-full md:w-64"
            />
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1 shrink-0">
            <button className="p-1 sm:p-1.5 text-gray-500 hover:bg-white hover:shadow-sm rounded-md transition-all"><ZoomIn className="w-3 h-3 sm:w-4 sm:h-4" /></button>
            <button className="p-1 sm:p-1.5 text-gray-500 hover:bg-white hover:shadow-sm rounded-md transition-all"><ZoomOut className="w-3 h-3 sm:w-4 sm:h-4" /></button>
            <button className="p-1 sm:p-1.5 text-gray-500 hover:bg-white hover:shadow-sm rounded-md transition-all"><Maximize className="w-3 h-3 sm:w-4 sm:h-4" /></button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-gray-200 p-4 md:p-6 flex flex-col shadow-sm z-10 max-h-[30vh] md:max-h-none overflow-y-auto">
          <h2 className="font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
            <Filter className="w-4 h-4" /> Graph Filters
          </h2>
          
          <div className="space-y-4 sm:space-y-6 flex-1 overflow-y-auto pr-2">
            <div>
              <h3 className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">Domains</h3>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-2 sm:gap-3">
                {[
                  { label: 'Public Policy', color: 'bg-blue-500' },
                  { label: 'Technology', color: 'bg-emerald-500' },
                  { label: 'Healthcare', color: 'bg-amber-500' },
                  { label: 'Education', color: 'bg-red-500' },
                  { label: 'Economy', color: 'bg-purple-500' },
                ].map(domain => (
                  <label key={domain.label} className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                    <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${domain.color}`}></div>
                    <span className="text-xs sm:text-sm text-gray-700 group-hover:text-gray-900 truncate">{domain.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="pt-4 sm:pt-6 border-t border-gray-100">
              <h3 className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">Node Info</h3>
              {hoveredNode ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-purple-50 rounded-xl p-3 sm:p-4 border border-purple-100"
                >
                  <h4 className="font-bold text-sm sm:text-base text-purple-900 mb-1">{hoveredNode.label}</h4>
                  <p className="text-[10px] sm:text-xs text-purple-700 mb-2 sm:mb-3">Domain: {['Policy', 'Tech', 'Health', 'Edu', 'Econ'][hoveredNode.group - 1]}</p>
                  <div className="text-[10px] sm:text-xs text-purple-800 font-medium">
                    {MOCK_LINKS.filter(l => l.source === hoveredNode.id || l.target === hoveredNode.id).length} Connections
                  </div>
                  <button className="mt-3 sm:mt-4 w-full py-1.5 sm:py-2 bg-white text-purple-700 text-[10px] sm:text-xs font-bold rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors">
                    View Related Resources
                  </button>
                </motion.div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center border border-gray-100 border-dashed">
                  <p className="text-xs sm:text-sm text-gray-500">Hover over a node to see details</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative bg-white min-h-[50vh] md:min-h-0">
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full"
          />
          
          {/* Legend */}
          <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-white/90 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-gray-200 shadow-lg pointer-events-none">
            <h4 className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 sm:mb-2">Legend</h4>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-blue-500"></div>
                <span className="text-[10px] sm:text-xs text-gray-600">Core Topic</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-400"></div>
                <span className="text-[10px] sm:text-xs text-gray-600">Sub-topic</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 sm:w-6 h-0.5 bg-gray-300"></div>
                <span className="text-[10px] sm:text-xs text-gray-600">Connection</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
