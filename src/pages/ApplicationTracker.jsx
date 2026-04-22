import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getApplications, updateApplicationStage, deleteApplication, STAGES } from '../services/applicationService';
import AppLayout from '../components/AppLayout';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { DndContext, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// Sub-component for Draggable Cards
function DraggableCard({ app, isOverlay, onDelete, onMove }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: app.id,
    data: { app }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    cursor: 'grab',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className={`bg-dark-card border p-5 rounded-2xl shadow-xl transition-all group ${
        isOverlay ? 'border-brand-500 scale-105 shadow-2xl z-50 cursor-grabbing' : 'border-white/5 hover:border-brand-500/30'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-white font-bold leading-tight group-hover:text-brand-400 transition-colors uppercase tracking-tight text-sm select-none pointer-events-none">{app.jobTitle}</h4>
        
        {/* Actions - wrap in div to stop drag event propagation when clicking buttons */}
        <div onPointerDown={(e) => e.stopPropagation()} className="relative z-10">
          <button onClick={() => onDelete(app.id)} className="text-gray-600 hover:text-red-400 transition-colors p-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      <p className="text-xs font-black text-brand-400 uppercase tracking-widest mb-4 opacity-80 select-none">@{app.company}</p>
      
      <div className="flex items-center justify-between pt-4 border-t border-white/5 select-none">
        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{new Date(app.updatedAt).toLocaleDateString()}</span>
        {app.link && (
          <a onPointerDown={e => e.stopPropagation()} href={app.link} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:underline relative z-10">Link ↗</a>
        )}
      </div>
    </div>
  );
}

// Sub-component for Droppable Columns
function DroppableColumn({ stage, apps, onDelete, onMove }) {
  const { isOver, setNodeRef } = useDroppable({
    id: stage.id,
  });

  return (
    <div className="flex flex-col min-h-[600px]">
      <div className={`p-4 rounded-2xl border mb-6 flex justify-between items-center transition-all ${
        isOver ? 'border-brand-500 bg-brand-500/10 scale-[1.02]' : `border-white/5 ${stage.color}`
      }`}>
         <span className="font-black uppercase tracking-widest text-[10px]">{stage.title}</span>
         <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold">
           {apps.length}
         </span>
      </div>

      <div ref={setNodeRef} className={`space-y-4 flex-1 p-2 rounded-2xl transition-all ${isOver ? 'bg-white/5' : ''}`}>
        {apps.map(app => (
          <DraggableCard key={app.id} app={app} onDelete={onDelete} onMove={onMove} />
        ))}
        
        {apps.length === 0 && !isOver && (
          <div className="border border-dashed border-white/5 rounded-2xl p-10 text-center pointer-events-none">
             <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">Drop here</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApplicationTracker() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const data = await getApplications(user.uid);
        setApps(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const handleMove = async (appId, newStage) => {
    setApps(prev => prev.map(a => a.id === appId ? { ...a, stage: newStage } : a));
    try {
      await updateApplicationStage(appId, newStage);
      showToast('Application moved ✓', 'success');
    } catch (err) {
      console.error('Failed to update stage:', err);
      showToast('Failed to move application', 'error');
    }
  };

  const handleDelete = async (appId) => {
    if(!window.confirm("Are you sure you want to delete this application?")) return;
    setApps(prev => prev.filter(a => a.id !== appId));
    await deleteApplication(appId);
    showToast('Application removed', 'info');
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    setActiveId(null);
    const { active, over } = event;
    
    if (over && active.data.current?.app?.stage !== over.id) {
       handleMove(active.id, over.id);
    }
  };

  const activeApp = apps.find(a => a.id === activeId);

  return (
    <AppLayout>
        <header className="mb-12">
           <h1 className="text-4xl font-black text-white tracking-tight mb-2">Application Tracker</h1>
           <p className="text-gray-500 font-medium mb-4">Manage your job search pipeline in one place.</p>
           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-brand-500/10 border border-brand-500/20 text-brand-400">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>
              Drag & Drop Enabled
           </div>
        </header>

        {loading ? (
          <div className="grid md:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <LoadingSkeleton key={i} type="card" />)}
          </div>
        ) : (
          <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 h-full items-start">
              {STAGES.map(stage => (
                <DroppableColumn 
                  key={stage.id} 
                  stage={stage} 
                  apps={apps.filter(a => a.stage === stage.id)}
                  onDelete={handleDelete}
                  onMove={handleMove}
                />
              ))}
            </div>
            
            <DragOverlay>
              {activeId && activeApp ? <DraggableCard app={activeApp} isOverlay /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </AppLayout>
  );
}
