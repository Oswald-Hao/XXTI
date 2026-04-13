import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import DrawingCanvas from './components/DrawingCanvas';
import { analyzeDrawings, PersonalityResult, DrawingTask } from './services/geminiService';
import { Sparkles, ArrowRight, Loader2, Share2, RefreshCcw } from 'lucide-react';

type AppState = 'home' | 'drawing' | 'loading' | 'result';

const PROMPT_POOL = [
  "闭着眼睛画一只猫",
  "画出你银行卡余额的具象化形态",
  "用非人类的形态画你的老板/老师",
  "画一个你认为能打败奥特曼的武器",
  "画一下你当前的精神状态",
  "画一个长着大长腿的汉堡",
  "画一个用来证明你不是机器人的涂鸦",
  "画出你周一早上的表情",
  "画一个能在宇宙中生存的土豆",
  "随便画几条线，假装它是一件价值百万的艺术品",
  "画一只正在加班的狗",
  "画出你脑子里的水",
  "画一个你最讨厌的蔬菜成精的样子",
  "画一只没有脖子的长颈鹿",
  "画出'穷'字长什么样",
  "画一个正在跳广场舞的外星人",
  "画你理想中的退休生活（用抽象派）",
  "画一只长着人类肌肉手臂的蚊子",
  "画出你熬夜时的黑眼圈实体化",
  "画一个能帮你写代码/写作业的法宝",
  "画一个长着翅膀的马桶",
  "画出你听到“明天调休”时的表情",
  "画一只正在思考人生的咸鱼",
  "画出你的钱包被掏空的过程",
  "画一个能自动回复“收到”的机器人",
  "画一只因为太胖飞不起来的鸽子",
  "画出你被催婚/催进度时的防御形态",
  "画一个长着八条腿的苹果",
  "画出你每天早起时的怨气",
  "画一只正在蹦迪的树懒"
];

const TOTAL_STEPS = 3;

export default function App() {
  const [appState, setAppState] = useState<AppState>('home');
  const [result, setResult] = useState<PersonalityResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [testPrompts, setTestPrompts] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [drawings, setDrawings] = useState<DrawingTask[]>([]);

  const startTest = () => {
    // Randomly select 3 prompts
    const shuffled = [...PROMPT_POOL].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, TOTAL_STEPS);
    setTestPrompts(selected);
    setCurrentStep(0);
    setDrawings([]);
    setError(null);
    setAppState('drawing');
  };

  const handleNextDrawing = async (base64Image: string) => {
    const newDrawings = [
      ...drawings, 
      { prompt: testPrompts[currentStep], image: base64Image }
    ];
    
    if (currentStep < TOTAL_STEPS - 1) {
      setDrawings(newDrawings);
      setCurrentStep(currentStep + 1);
    } else {
      // Finished all steps
      setAppState('loading');
      setError(null);
      try {
        const res = await analyzeDrawings(newDrawings);
        setResult(res);
        setAppState('result');
      } catch (err) {
        console.error(err);
        setError('分析失败，可能是你的画作太狂野了，AI无法理解。请再试一次！');
        setAppState('drawing');
      }
    }
  };

  const resetApp = () => {
    setResult(null);
    setError(null);
    setAppState('home');
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] font-sans text-black selection:bg-[#00FF00] selection:text-black overflow-x-hidden">
      {/* Marquee Header */}
      <div className="w-full bg-black text-white py-2 border-b-4 border-black overflow-hidden whitespace-nowrap flex">
        <motion.div 
          className="flex gap-8 font-black uppercase tracking-widest text-sm md:text-base"
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        >
          <span>DRAW TO TEST • TEST YOUR VIBE • NO BORING QUESTIONS • </span>
          <span>DRAW TO TEST • TEST YOUR VIBE • NO BORING QUESTIONS • </span>
          <span>DRAW TO TEST • TEST YOUR VIBE • NO BORING QUESTIONS • </span>
          <span>DRAW TO TEST • TEST YOUR VIBE • NO BORING QUESTIONS • </span>
        </motion.div>
      </div>

      <main className="container mx-auto px-4 py-8 md:py-16 max-w-5xl min-h-[calc(100vh-48px)] flex flex-col items-center justify-center">
        
        <AnimatePresence mode="wait">
          
          {/* HOME STATE */}
          {appState === 'home' && (
            <motion.div 
              key="home"
              initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 1.2, opacity: 0, filter: 'blur(10px)' }}
              className="flex flex-col items-center text-center w-full"
            >
              <div className="relative inline-block mb-8">
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase leading-[0.85] tracking-tighter transform -skew-x-6">
                  沙雕人格<br/>
                  <span className="text-[#FF00FF] drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">鉴定器</span>
                </h1>
                <div className="absolute -top-8 -right-8 bg-[#FFFF00] border-4 border-black rounded-full w-24 h-24 flex items-center justify-center font-black text-xl rotate-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  AI驱动
                </div>
              </div>

              <p className="text-xl md:text-2xl font-bold max-w-2xl mb-12 border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
                拒绝无聊的答题测试！<br/>
                完成 {TOTAL_STEPS} 个离谱的绘画任务，让AI看透你那不为人知的狂野灵魂。
              </p>

              <button 
                onClick={startTest}
                className="group relative px-12 py-6 bg-[#00FF00] border-4 border-black font-black text-3xl uppercase flex items-center gap-4 transition-transform hover:-translate-y-2 hover:bg-[#FFFF00] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]"
              >
                开始作法 <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" strokeWidth={4} />
              </button>
            </motion.div>
          )}

          {/* DRAWING STATE */}
          {appState === 'drawing' && (
            <motion.div 
              key={`drawing-${currentStep}`}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="w-full flex flex-col items-center"
            >
              {error && (
                <div className="mb-4 p-4 bg-red-500 text-white font-bold border-4 border-black w-full max-w-2xl text-center">
                  {error}
                </div>
              )}
              <DrawingCanvas 
                promptText={testPrompts[currentStep]}
                stepIndex={currentStep}
                totalSteps={TOTAL_STEPS}
                onNext={handleNextDrawing} 
              />
            </motion.div>
          )}

          {/* LOADING STATE */}
          {appState === 'loading' && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center"
            >
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="mb-8"
              >
                <Loader2 className="w-24 h-24 text-black" strokeWidth={3} />
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-widest animate-pulse">
                AI正在凝视你的灵魂...
              </h2>
              <p className="mt-4 text-xl font-bold text-gray-600">正在综合分析你的 {TOTAL_STEPS} 幅旷世神作</p>
            </motion.div>
          )}

          {/* RESULT STATE */}
          {appState === 'result' && result && (
            <motion.div 
              key="result"
              initial={{ scale: 0.5, opacity: 0, rotate: 10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12 }}
              className="w-full max-w-3xl flex flex-col items-center"
            >
              <div className="w-full bg-white border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute -top-20 -right-20 text-[200px] opacity-10 select-none pointer-events-none">
                  {result.emoji}
                </div>

                <div className="relative z-10">
                  <div className="inline-block bg-black text-white font-black px-4 py-1 text-sm md:text-base uppercase tracking-widest mb-6 transform -skew-x-12">
                    鉴定结果
                  </div>
                  
                  <h2 className="text-5xl md:text-7xl font-black leading-tight mb-4 break-words">
                    {result.title}
                  </h2>
                  
                  <div className="text-2xl md:text-3xl font-bold text-[#FF00FF] mb-8 italic">
                    "{result.catchphrase}"
                  </div>

                  <div className="flex flex-wrap gap-3 mb-8">
                    {result.traits.map((trait, idx) => (
                      <span 
                        key={idx} 
                        className="px-4 py-2 bg-[#FFFF00] border-4 border-black font-bold text-lg transform rotate-1 hover:-rotate-2 transition-transform"
                      >
                        #{trait}
                      </span>
                    ))}
                  </div>

                  <div className="bg-[#E4E3E0] border-4 border-black p-6 font-bold text-lg md:text-xl leading-relaxed">
                    <div className="flex items-center gap-2 mb-2 font-black uppercase text-sm">
                      <Sparkles size={16} /> AI 锐评
                    </div>
                    {result.analysis}
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 mt-12 w-full justify-center">
                <button 
                  onClick={resetApp}
                  className="px-8 py-4 bg-white border-4 border-black font-black text-xl uppercase flex items-center justify-center gap-2 transition-transform hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                >
                  <RefreshCcw size={24} /> 再测一次
                </button>
                <button 
                  onClick={() => {
                    alert('截图分享给你的怨种朋友们吧！');
                  }}
                  className="px-8 py-4 bg-[#00FF00] border-4 border-black font-black text-xl uppercase flex items-center justify-center gap-2 transition-transform hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Share2 size={24} /> 炫耀一下
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
