import React, { useRef, useEffect, useState, useCallback } from 'react';
import { StrokeCommand, StrokePoint } from '../../types/game';
import { CanvasToolbar } from './CanvasToolbar';

interface DrawingCanvasProps {
  isDrawer: boolean;
  strokeHistory: StrokeCommand[];
  onEmitStroke: (stroke: StrokeCommand) => void;
  onEmitClear: () => void;
  onEmitUndo: () => void;
  incomingStroke: StrokeCommand | null;
  drawerName?: string;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  isDrawer,
  strokeHistory,
  onEmitStroke,
  onEmitClear,
  onEmitUndo,
  incomingStroke,
  drawerName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState<string>('#000000');
  const [brushSize, setBrushSize] = useState<number>(8);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  const currentPointsRef = useRef<StrokePoint[]>([]);

  // Helper to draw a single stroke with bezier curve smoothing
  const drawStroke = (
    ctx: CanvasRenderingContext2D,
    stroke: StrokeCommand,
    width: number,
    height: number
  ) => {
    if (!stroke.points || stroke.points.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    // 1:1 mapping with CSS pixels
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = stroke.tool === 'eraser' ? '#ffffff' : stroke.color;
    
    // Scale line width proportionally while ensuring readability on small mobile screens
    const scaledSize = Math.max(2, (stroke.size * Math.max(width, 450)) / 750);
    ctx.lineWidth = scaledSize;

    const points = stroke.points;
    if (points.length === 1) {
      // Single point / dot
      const pt = points[0];
      ctx.beginPath();
      ctx.arc(pt.x * width, pt.y * height, scaledSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = stroke.tool === 'eraser' ? '#ffffff' : stroke.color;
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(points[0].x * width, points[0].y * height);

      for (let i = 1; i < points.length - 1; i++) {
        const xc = ((points[i].x + points[i + 1].x) / 2) * width;
        const yc = ((points[i].y + points[i + 1].y) / 2) * height;
        ctx.quadraticCurveTo(points[i].x * width, points[i].y * height, xc, yc);
      }

      // Last point
      const last = points[points.length - 1];
      ctx.lineTo(last.x * width, last.y * height);
      ctx.stroke();
    }

    ctx.restore();
  };

  // Redraw the entire canvas from history
  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Reset transform to 1:1 CSS coordinates
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Fill canvas background pure white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Draw all strokes in history
    strokeHistory.forEach((stroke) => {
      drawStroke(ctx, stroke, width, height);
    });
  }, [strokeHistory]);

  // Resize canvas to match container dimensions while preserving crisp aspect ratio
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeObserver = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      const targetWidth = Math.floor(rect.width);
      const targetHeight = Math.floor(rect.height || Math.max(220, rect.width * 0.72));

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(targetWidth * dpr);
      canvas.height = Math.round(targetHeight * dpr);
      canvas.style.width = `${targetWidth}px`;
      canvas.style.height = `${targetHeight}px`;

      redrawAll();
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [redrawAll]);

  // Re-render when strokeHistory changes
  useEffect(() => {
    redrawAll();
  }, [strokeHistory, redrawAll]);

  // Handle incoming live stroke from socket
  useEffect(() => {
    if (!incomingStroke || isDrawer) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    drawStroke(ctx, incomingStroke, rect.width, rect.height);
  }, [incomingStroke, isDrawer]);

  // Normalized coordinates helper - exactly relative to canvas bounding box
  const getNormalizedPoint = (clientX: number, clientY: number): StrokePoint | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    
    const x = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    const y = Math.min(Math.max((clientY - rect.top) / rect.height, 0), 1);
    return { x, y };
  };

  // Start Drawing (Mouse or Touch)
  const handleStart = (clientX: number, clientY: number) => {
    if (!isDrawer) return;
    const point = getNormalizedPoint(clientX, clientY);
    if (!point) return;

    setIsDrawing(true);
    currentPointsRef.current = [point];

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const tempStroke: StrokeCommand = {
      id: Math.random().toString(36).substring(2, 9),
      tool,
      color,
      size: brushSize,
      points: [point],
    };
    drawStroke(ctx, tempStroke, rect.width, rect.height);
  };

  // Move Drawing
  const handleMove = (clientX: number, clientY: number) => {
    if (!isDrawer || !isDrawing) return;
    const point = getNormalizedPoint(clientX, clientY);
    if (!point) return;

    currentPointsRef.current.push(point);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const dpr = window.devicePixelRatio || 1;

    // Draw incremental segment
    const points = currentPointsRef.current;
    if (points.length >= 2) {
      const p1 = points[points.length - 2];
      const p2 = points[points.length - 1];

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
      const scaledSize = Math.max(2, (brushSize * Math.max(width, 450)) / 750);
      ctx.lineWidth = scaledSize;
      ctx.beginPath();
      ctx.moveTo(p1.x * width, p1.y * height);
      ctx.lineTo(p2.x * width, p2.y * height);
      ctx.stroke();
      ctx.restore();
    }
  };

  // End Drawing
  const handleEnd = () => {
    if (!isDrawer || !isDrawing) return;
    setIsDrawing(false);

    if (currentPointsRef.current.length > 0) {
      const stroke: StrokeCommand = {
        id: Math.random().toString(36).substring(2, 9),
        tool,
        color,
        size: brushSize,
        points: [...currentPointsRef.current],
      };
      onEmitStroke(stroke);
    }
    currentPointsRef.current = [];
  };

  return (
    <div className="drawing-canvas-wrapper">
      {/* Drawer Toolbar */}
      {isDrawer && (
        <CanvasToolbar
          tool={tool}
          color={color}
          brushSize={brushSize}
          onToolChange={setTool}
          onColorChange={setColor}
          onSizeChange={setBrushSize}
          onUndo={onEmitUndo}
          onClear={onEmitClear}
        />
      )}

      {/* Guesser notice when not drawer */}
      {!isDrawer && (
        <div
          style={{
            padding: '8px 16px',
            background: 'var(--bg-surface)',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <span>
            ✏️ <strong style={{ color: 'var(--accent-yellow)' }}>{drawerName || 'Drawer'}</strong> is drawing...
          </span>
          <span style={{ fontSize: '0.85rem' }}>Guess the word in the chat box!</span>
        </div>
      )}

      {/* Canvas Area */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          position: 'relative',
          background: '#ffffff',
          cursor: isDrawer ? 'crosshair' : 'default',
          touchAction: 'none',
        }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
          onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={(e) => {
            if (e.cancelable) e.preventDefault();
            if (e.touches[0]) handleStart(e.touches[0].clientX, e.touches[0].clientY);
          }}
          onTouchMove={(e) => {
            if (e.cancelable) e.preventDefault();
            if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
          }}
          onTouchEnd={(e) => {
            if (e.cancelable) e.preventDefault();
            handleEnd();
          }}
          onTouchCancel={(e) => {
            if (e.cancelable) e.preventDefault();
            handleEnd();
          }}
          style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }}
        />
      </div>
    </div>
  );
};
