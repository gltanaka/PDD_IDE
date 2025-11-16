import React, { useMemo, useState } from 'react';
import { mockPrompts } from '../data/mockPrompts';
import { mockPrd } from '../data/mockPrd';
import { CommandType, MockPrompt } from '../types';
import DevUnitModal from './DevUnitModal';
import { ChevronDownIcon, ChevronUpIcon, SparklesIcon, SplitIcon, ConflictIcon, LightBulbIcon } from './Icon';
import Tooltip from './Tooltip';

const NODE_WIDTH = 200;
const NODE_HEIGHT = 60;
const HORIZONTAL_SPACING = 30; // Gap between nodes in the same row
const VERTICAL_SPACING = 100; // Gap between layers (rows)
const PRD_HEADER_HEIGHT = 72;
const PRD_CONTENT_HEIGHT = 350;
const PRD_MARGIN_BOTTOM = 60;

export interface PositionedNode extends MockPrompt {
  label: string;
  path: string;
  x: number;
  y: number;
}

interface DependencyViewerProps {
  onRegenerate: () => void;
  onSetupCommandForPrompt: (command: CommandType, promptPath: string) => void;
  onSetupCommand: (command: CommandType) => void;
  onProposeChange: () => void;
  onReportBug: (promptPath: string) => void;
}

const DependencyViewer: React.FC<DependencyViewerProps> = ({ onRegenerate, onSetupCommandForPrompt, onSetupCommand, onProposeChange, onReportBug }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isPrdVisible, setIsPrdVisible] = useState(false);
  const [isSplitMode, setIsSplitMode] = useState(false);

  const layout = useMemo(() => {
    const nodes = mockPrompts.map(p => ({
      ...p,
      label: p.id.split('/').pop()?.replace('.prompt', '') || p.id,
      path: p.id,
    }));

    const edges = [];
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const childrenMap = new Map<string, string[]>();
    const parentMap = new Map<string, string[]>();

    for (const node of nodes) {
      if (!childrenMap.has(node.id)) childrenMap.set(node.id, []);
      if (!parentMap.has(node.id)) parentMap.set(node.id, []);

      for (const include of node.includes) {
        if (nodeMap.has(include)) {
          edges.push({
            id: `${include}->${node.id}`,
            source: include,
            target: node.id,
          });
          childrenMap.get(include)?.push(node.id);
          parentMap.get(node.id)?.push(include);
        }
      }
    }

    const layers: string[][] = [];
    const layeredNodes = new Set<string>();

    let currentLayerNodes = nodes.filter(n => (parentMap.get(n.id) || []).length === 0).map(n => n.id);
    
    while (currentLayerNodes.length > 0) {
      layers.push(currentLayerNodes);
      currentLayerNodes.forEach(id => layeredNodes.add(id));
      
      const nextLayerNodes = new Set<string>();
      for (const nodeId of currentLayerNodes) {
        const children = childrenMap.get(nodeId) || [];
        for (const childId of children) {
          if (!layeredNodes.has(childId)) {
            const parents = parentMap.get(childId) || [];
            if (parents.every(p => layeredNodes.has(p))) {
              nextLayerNodes.add(childId);
            }
          }
        }
      }
      currentLayerNodes = Array.from(nextLayerNodes);
    }

    const unlayeredNodes = nodes.filter(n => !layeredNodes.has(n.id)).map(n => n.id);
    if (unlayeredNodes.length > 0) {
        layers.push(unlayeredNodes);
    }

    const maxNodesInLayer = Math.max(...layers.map(l => l.length), 0);
    const totalWidth = maxNodesInLayer * (NODE_WIDTH + HORIZONTAL_SPACING) - HORIZONTAL_SPACING;
    const totalHeight = layers.length * (NODE_HEIGHT + VERTICAL_SPACING) - VERTICAL_SPACING;
    
    const positionedNodes: PositionedNode[] = [];
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      const layerWidth = layer.length * (NODE_WIDTH + HORIZONTAL_SPACING) - HORIZONTAL_SPACING;
      const startX = (totalWidth - layerWidth) / 2;
      for (let j = 0; j < layer.length; j++) {
        positionedNodes.push({
          ...nodeMap.get(layer[j])!,
          x: startX + j * (NODE_WIDTH + HORIZONTAL_SPACING),
          y: i * (NODE_HEIGHT + VERTICAL_SPACING),
        });
      }
    }
    
    const positionedNodeMap = new Map(positionedNodes.map(n => [n.id, n]));

    const containerWidth = Math.max(800, totalWidth + 40);
    const containerHeight = Math.max(600, totalHeight + 40);

    return { nodes: positionedNodes, edges, nodeMap: positionedNodeMap, width: containerWidth, height: containerHeight, layers };

  }, []);
  
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return layout.nodes.find(n => n.id === selectedNodeId) || null;
  }, [selectedNodeId, layout.nodes]);

  const prdContainerHeight = isPrdVisible ? PRD_HEADER_HEIGHT + PRD_CONTENT_HEIGHT : PRD_HEADER_HEIGHT;
  const yOffset = prdContainerHeight + PRD_MARGIN_BOTTOM;
  const totalHeight = layout.height + yOffset;

  const firstLayerNodes = layout.layers[0]
    .map(id => layout.nodeMap.get(id)!)
    .filter(Boolean);

  const connectorTarget = useMemo(() => {
    if (firstLayerNodes.length === 0) {
      return { x: layout.width / 2, y: yOffset };
    }
    const firstLayerMinX = Math.min(...firstLayerNodes.map(n => n.x));
    const firstLayerMaxX = Math.max(...firstLayerNodes.map(n => n.x + NODE_WIDTH));
    return {
      x: (firstLayerMinX + firstLayerMaxX) / 2,
      y: yOffset,
    };
  }, [firstLayerNodes, layout.width, yOffset]);

  const handleNodeClick = (node: PositionedNode) => {
    if (isSplitMode) {
      onSetupCommandForPrompt(CommandType.SPLIT, node.path);
      setIsSplitMode(false);
    } else {
      setSelectedNodeId(node.id);
    }
  };


  return (
    <>
      <div className="flex flex-row items-start gap-6">
        <div className="flex-grow bg-gray-800/50 rounded-lg p-6 shadow-lg ring-1 ring-white/10 overflow-auto">
            <div 
              className={`relative ${isSplitMode ? 'cursor-crosshair' : ''}`}
              style={{ width: layout.width, height: totalHeight }}
              aria-label="Prompt dependency graph"
            >
              {/* PRD Viewer */}
              <div
                className="absolute top-0 left-0 w-full bg-gray-700/50 rounded-lg shadow-md ring-1 ring-white/10 transition-all duration-300 ease-in-out z-10"
                style={{ height: prdContainerHeight }}
              >
                <div className="w-full flex justify-between items-center p-4 text-left rounded-t-lg">
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => setIsPrdVisible(!isPrdVisible)}
                  >
                    <h3 className="font-bold text-lg text-white">Product Requirements Doc (PRD)</h3>
                    <p className="text-sm text-gray-400">The high-level requirements driving the architecture.</p>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                    <Tooltip content="Regenerate architecture.json from the PRD">
                      <button
                        onClick={onRegenerate}
                        className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-blue-500 transition-colors"
                      >
                        <SparklesIcon className="w-4 h-4" />
                        <span>Regenerate Architecture</span>
                      </button>
                    </Tooltip>
                    <Tooltip content={isPrdVisible ? "Collapse PRD section" : "Expand PRD section"}>
                      <button 
                        onClick={() => setIsPrdVisible(!isPrdVisible)}
                        className="p-2 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-expanded={isPrdVisible}
                        aria-label={isPrdVisible ? "Collapse PRD section" : "Expand PRD section"}
                      >
                        {isPrdVisible 
                          ? <ChevronUpIcon className="w-6 h-6 text-gray-300" /> 
                          : <ChevronDownIcon className="w-6 h-6 text-gray-300" />}
                      </button>
                    </Tooltip>
                  </div>
                </div>

                <div 
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{ maxHeight: isPrdVisible ? PRD_CONTENT_HEIGHT : 0 }}
                >
                  <pre className="bg-gray-900/50 m-4 mt-0 rounded-b-md p-4 text-sm text-gray-200 whitespace-pre-wrap break-all h-full overflow-auto">
                      <code>{mockPrd}</code>
                  </pre>
                </div>
              </div>

              <svg
                width={layout.width}
                height={totalHeight}
                className="absolute top-0 left-0"
                aria-hidden="true"
              >
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#60a5fa" />
                  </marker>
                  <marker
                    id="arrowhead-prd"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#0ea5e9" />
                  </marker>
                </defs>
                {/* PRD Connector */}
                <path
                  d={`M ${layout.width / 2} ${prdContainerHeight + 10} C ${layout.width / 2} ${prdContainerHeight + 40}, ${connectorTarget.x} ${connectorTarget.y - 40}, ${connectorTarget.x} ${connectorTarget.y}`}
                  stroke="#0ea5e9"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                  fill="none"
                  markerEnd="url(#arrowhead-prd)"
                />
                {layout.edges.map(edge => {
                  const sourceNode = layout.nodeMap.get(edge.source);
                  const targetNode = layout.nodeMap.get(edge.target);
                  if (!sourceNode || !targetNode) return null;

                  const sourceX = sourceNode.x + NODE_WIDTH / 2;
                  const sourceY = sourceNode.y + NODE_HEIGHT + yOffset;
                  const targetX = targetNode.x + NODE_WIDTH / 2;
                  const targetY = targetNode.y + yOffset;
                  
                  const dy = targetY - sourceY;
                  
                  const controlY1 = sourceY + dy / 2;
                  const controlY2 = targetY - dy / 2;
                  
                  return (
                    <path
                      key={edge.id}
                      d={`M ${sourceX} ${sourceY} C ${sourceX} ${controlY1}, ${targetX} ${controlY2}, ${targetX} ${targetY}`}
                      stroke="#60a5fa"
                      strokeWidth="1.5"
                      fill="none"
                      markerEnd="url(#arrowhead)"
                    />
                  )
                })}
              </svg>
              {layout.nodes.map(node => (
                 <Tooltip content={node.path} key={node.id}>
                  <button
                    onClick={() => handleNodeClick(node)}
                    className={`absolute bg-gray-700 rounded-lg p-3 shadow-md ring-1 ring-white/10 flex flex-col justify-center items-center text-center cursor-pointer focus:outline-none focus:ring-2 transition-all duration-200 ${
                      isSplitMode
                        ? 'hover:ring-2 hover:ring-purple-400 focus:ring-purple-500'
                        : 'hover:ring-2 hover:ring-blue-400 focus:ring-blue-500'
                    }`}
                    style={{
                      width: NODE_WIDTH,
                      height: NODE_HEIGHT,
                      transform: `translate(${node.x}px, ${node.y + yOffset}px)`,
                    }}
                    role="figure"
                    aria-label={`Prompt: ${node.label}`}
                  >
                    <p className="font-bold text-sm text-white break-words">{node.label}</p>
                    <p className="text-xs text-gray-400 truncate w-full">{node.path.substring(0, node.path.lastIndexOf('/')) || './'}</p>
                  </button>
                </Tooltip>
              ))}
            </div>
        </div>
        <div className="w-56 flex-shrink-0">
          <div className="bg-gray-800/50 rounded-lg p-4 shadow-lg ring-1 ring-white/10 sticky top-28">
            <h3 className="text-lg font-semibold text-white mb-2">Graph Actions</h3>
            <p className="text-xs text-gray-400 mb-4">Click an action to get started.</p>
            <div className="space-y-2">
               <Tooltip content="Describe a change to find the right prompt to edit">
                <button
                  onClick={onProposeChange}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 bg-teal-600 hover:bg-teal-700 focus:ring-teal-500"
                >
                  <LightBulbIcon className="w-4 h-4" />
                  <span>Propose Change</span>
                </button>
              </Tooltip>
              <Tooltip content={isSplitMode ? 'Exit split mode' : 'Enter split mode to select a prompt to split'}>
                <button
                  onClick={() => setIsSplitMode(prev => !prev)}
                  className={`w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800
                  ${isSplitMode 
                      ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500' 
                      : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                  }`}
                >
                  <SplitIcon className="w-4 h-4" />
                  <span>{isSplitMode ? 'Cancel Split' : 'Split Prompt'}</span>
                </button>
              </Tooltip>
              <Tooltip content="Check for conflicting instructions between prompts">
                <button
                  onClick={() => onSetupCommand(CommandType.CONFLICT)}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500"
                >
                  <ConflictIcon className="w-4 h-4" />
                  <span>Detect Conflicts</span>
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
      {selectedNode && <DevUnitModal node={selectedNode} onClose={() => setSelectedNodeId(null)} onSetupCommandForPrompt={onSetupCommandForPrompt} allPrompts={mockPrompts} onReportBug={onReportBug} />}
    </>
  );
};

export default DependencyViewer;