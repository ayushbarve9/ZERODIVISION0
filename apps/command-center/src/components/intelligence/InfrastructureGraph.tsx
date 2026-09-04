import React from 'react';
import ReactFlow, { Background, Controls, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes: Node[] = [
  { id: '1', position: { x: 250, y: 20 }, data: { label: 'Water Pipe Leak' }, style: { background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px' } },
  { id: '2', position: { x: 100, y: 120 }, data: { label: 'Sub-surface Erosion' }, style: { background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px' } },
  { id: '3', position: { x: 400, y: 120 }, data: { label: 'Low Water Pressure' }, style: { background: '#1e293b', color: '#fff', border: '1px solid #475569', borderRadius: '8px', padding: '10px' } },
  { id: '4', position: { x: 250, y: 220 }, data: { label: 'Road Potholes' }, style: { background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#ef4444' } },
  { id: 'e1-3', source: '1', target: '3', style: { stroke: '#94a3b8' } },
  { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#f59e0b' } },
];

export const InfrastructureGraph = () => {
  return (
    <div style={{ height: '350px', width: '100%', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <ReactFlow nodes={initialNodes} edges={initialEdges} fitView>
        <Background color="#334155" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
};
