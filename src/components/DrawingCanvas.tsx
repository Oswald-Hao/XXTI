import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Pen, RotateCcw } from 'lucide-react';

interface DrawingCanvasProps {
  promptText: string;
  stepIndex: number;
  totalSteps: number;
  onNext: (base64Image: string) => void;
}

export default function DrawingCanvas({ promptText, stepIndex, totalSteps, onNext }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEraser, setIsEraser] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Set canvas size to match container
    const resizeCanvas = () => {
      const { width, height } = container.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      
      // Fill with white background
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      e.preventDefault(); // Prevent scrolling while drawing
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.strokeStyle = isEraser ? '#ffffff' : '#000000';
    ctx.lineWidth = isEraser ? 20 : 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleComplete = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const base64 = canvas.toDataURL('image/png');
    onNext(base64);
  };

  const isLastStep = stepIndex === totalSteps - 1;

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      
      <div className="w-full bg-white border-4 border-black p-4 mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
        <div className="flex justify-between items-center mb-2">
          <span className="bg-black text-white px-3 py-1 font-black text-sm uppercase tracking-widest">
            任务 {stepIndex + 1} / {totalSteps}
          </span>
        </div>
        <h3 className="text-2xl md:text-3xl font-black">{promptText}</h3>
      </div>

      <div className="flex justify-between w-full mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setIsEraser(false)}
            className={`p-3 border-4 border-black font-bold uppercase flex items-center gap-2 transition-transform hover:-translate-y-1 ${!isEraser ? 'bg-[#00FF00] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white'}`}
          >
            <Pen size={20} /> 画笔
          </button>
          <button
            onClick={() => setIsEraser(true)}
            className={`p-3 border-4 border-black font-bold uppercase flex items-center gap-2 transition-transform hover:-translate-y-1 ${isEraser ? 'bg-[#FF00FF] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white'}`}
          >
            <Eraser size={20} /> 橡皮
          </button>
        </div>
        <button
          onClick={clearCanvas}
          className="p-3 border-4 border-black font-bold uppercase bg-white flex items-center gap-2 transition-transform hover:-translate-y-1 hover:bg-gray-100"
        >
          <RotateCcw size={20} /> 清空
        </button>
      </div>

      <div 
        ref={containerRef}
        className="w-full aspect-square md:aspect-[4/3] border-8 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden cursor-crosshair"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute top-0 left-0 w-full h-full touch-none"
        />
        {!hasDrawn && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <span className="font-black text-3xl md:text-5xl tracking-widest text-black/30 px-8 text-center">
              在此处作法
            </span>
          </div>
        )}
      </div>

      <button
        onClick={handleComplete}
        disabled={!hasDrawn}
        className={`mt-8 w-full py-4 border-4 border-black font-black text-2xl uppercase transition-all
          ${hasDrawn 
            ? 'bg-[#FFFF00] hover:bg-[#FF00FF] hover:text-white hover:-translate-y-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] cursor-pointer' 
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        {isLastStep ? '注入灵魂，开始分析！' : '画好了，下一题！'}
      </button>
    </div>
  );
}
