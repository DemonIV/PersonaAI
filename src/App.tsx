import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Camera, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  RefreshCcw, 
  Download,
  Undo,
  Redo,
  Sun,
  Moon,
  Zap,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { cn } from './lib/utils';
import { HEADSHOT_STYLES, HeadshotStyle, Customization } from './types.ts';
import { generateHeadshot } from './services/geminiService.ts';

// --- Components ---

const Header = () => (
  <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 border-b border-white/5 bg-black/40 backdrop-blur-md">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 gold-gradient rounded-full shadow-[0_0_15px_rgba(212,175,55,0.3)]"></div>
      <span className="text-xl tracking-[0.2em] font-light uppercase">Persona <span className="font-bold text-gold">AI</span></span>
    </div>
    <nav className="hidden md:flex gap-8 text-[10px] uppercase tracking-[0.3em] font-medium text-white/50">
      <a href="#" className="hover:text-gold transition-colors">Gallery</a>
      <a href="#" className="text-gold border-b border-gold pb-1">Studio</a>
      <a href="#" className="hover:text-gold transition-colors">Journal</a>
    </nav>
    <div className="flex items-center gap-4">
      <div className="hidden sm:flex flex-col items-end mr-2">
        <span className="text-[9px] uppercase tracking-widest text-white/40">Studio Member</span>
        <span className="text-[10px] font-mono text-gold/80 tracking-tighter">Premium Access</span>
      </div>
      <div className="w-9 h-9 rounded-full border border-gold/30 bg-zinc-900 flex items-center justify-center text-[10px] font-bold text-gold">AS</div>
    </div>
  </header>
);

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = ['Identity', 'Curation', 'Refinement', 'Evolution'];
  return (
    <div className="flex items-center justify-center gap-6 mb-16">
      {steps.map((step, idx) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center gap-3">
            <div 
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-700 relative",
                idx + 1 === currentStep 
                  ? "gold-gradient text-black scale-110 shadow-[0_0_25px_rgba(212,175,55,0.4)]" 
                  : idx + 1 < currentStep 
                    ? "bg-gold/20 text-gold border border-gold/30" 
                    : "bg-white/5 text-white/20 border border-white/5"
              )}
            >
              {idx + 1 === currentStep && (
                <motion.div 
                  layoutId="indicator-glow"
                  className="absolute inset-[-4px] border border-gold/30 rounded-full animate-pulse" 
                />
              )}
              {idx + 1 < currentStep ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
            </div>
            <span 
              className={cn(
                "text-[9px] uppercase tracking-[0.25em] font-bold transition-all duration-500",
                idx + 1 === currentStep ? "text-gold" : "text-white/20"
              )}
            >
              {step}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={cn("h-[1px] w-12 mb-6 transition-all duration-700", idx + 1 < currentStep ? "bg-gold/30" : "bg-white/5")} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [step, setStep] = useState(1);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<HeadshotStyle | null>(null);
  const [customization, setCustomization] = useState<Customization>({
    lighting: 'soft',
    background: 'blurred',
    sharpness: 50,
    skinSmoothing: 30,
    clarity: 40
  });
  const [history, setHistory] = useState<Customization[]>([]);
  const [future, setFuture] = useState<Customization[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const pushToHistory = (newCustomization: Customization) => {
    setHistory(prev => [...prev, { ...customization }]);
    setFuture([]);
    setCustomization(newCustomization);
  };

  const undo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setFuture(prev => [{ ...customization }, ...prev]);
    setHistory(prev => prev.slice(0, -1));
    setCustomization(previous);
  };

  const redo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory(prev => [...prev, { ...customization }]);
    setFuture(prev => prev.slice(1));
    setCustomization(next);
  };
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Asset size exceeds the 10MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserImage(event.target?.result as string);
        setStep(2);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const onGenerate = async () => {
    if (!userImage || !selectedStyle) return;
    
    setIsGenerating(true);
    setStep(4);
    setError(null);

    try {
      const result = await generateHeadshot(
        userImage, 
        userImage.split(';')[0].split(':')[1],
        selectedStyle,
        customization
      );
      setResultImage(result);
    } catch (err: any) {
      setError(err.message || "An unforeseen error occurred during the rendering process.");
      setStep(3);
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setStep(1);
    setUserImage(null);
    setSelectedStyle(null);
    setResultImage(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E0E0E0] font-sans selection:bg-gold selection:text-black">
      <Header />

      {/* Ambient Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gold/5 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-gold/5 blur-[160px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20" />
      </div>

      <main className="relative pt-40 pb-20 px-6 max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col items-center text-center space-y-12"
            >
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-block px-4 py-1.5 border border-gold/20 rounded-full bg-gold/5"
                >
                  <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-gold">AI-Driven Editorial Grade</span>
                </motion.div>
                <motion.h1 
                  className="font-serif text-6xl sm:text-8xl tracking-tight leading-[0.9] italic"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", damping: 20 }}
                >
                  Redefine Your <br /> 
                  <span className="gold-text-gradient font-bold not-italic">Visual Legacy.</span>
                </motion.h1>
                <motion.p 
                  className="text-white/40 max-w-2xl mx-auto text-lg font-light leading-relaxed tracking-wide"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Sophisticated AI-powered portraits for those who demand excellence. Elevate your presence from a mere image to a professional masterpiece.
                </motion.p>
              </div>

              <motion.div 
                className="w-full max-w-xl group relative"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
              >
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative h-[30rem] border border-white/10 rounded-3xl flex flex-col items-center justify-center p-12 transition-all duration-700 hover:border-gold/30 hover:bg-white/[0.02] cursor-pointer overflow-hidden accent-border group shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  <div className="relative flex flex-col items-center gap-6 text-center">
                    <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 transition-all duration-700 group-hover:scale-110 group-hover:bg-gold/10 group-hover:border-gold/40">
                      <Upload className="w-10 h-10 text-gold/60" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-serif italic tracking-wide">Import Source Material</h3>
                      <p className="text-xs uppercase tracking-widest text-white/30 font-bold">Standard Formats Up to 10MB</p>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  
                  {/* Luxury corner markers */}
                  <div className="absolute top-8 left-8 w-6 h-[1px] bg-gold/40" />
                  <div className="absolute top-8 left-8 w-[1px] h-6 bg-gold/40" />
                  <div className="absolute top-8 right-8 w-6 h-[1px] bg-gold/40" />
                  <div className="absolute top-8 right-8 w-[1px] h-6 bg-gold/40" />
                  <div className="absolute bottom-8 left-8 w-6 h-[1px] bg-gold/40" />
                  <div className="absolute bottom-8 left-8 w-[1px] h-6 bg-gold/40" />
                  <div className="absolute bottom-8 right-8 w-6 h-[1px] bg-gold/40" />
                  <div className="absolute bottom-8 right-8 w-[1px] h-6 bg-gold/40" />
                </div>
              </motion.div>
            </motion.div>
          )}

          {step > 1 && (
            <motion.div 
              key="studio-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <StepIndicator currentStep={step} />

              {step === 2 && (
                <div className="space-y-12">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
                    <div>
                      <h2 className="text-4xl font-serif italic mb-3">Curate Your Aura</h2>
                      <p className="text-white/40 font-light tracking-wide max-w-lg">Establish the foundational aesthetic for your professional narrative.</p>
                    </div>
                    <button 
                      onClick={() => setStep(1)}
                      className="flex items-center gap-2 px-6 py-3 border border-white/10 rounded-full hover:bg-white/5 transition-all text-[10px] uppercase tracking-[0.2em] font-bold"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back to Identity
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {HEADSHOT_STYLES.map((style) => (
                      <motion.div
                        key={style.id}
                        whileHover={{ y: -8 }}
                        onClick={() => {
                          setSelectedStyle(style);
                          setStep(3);
                        }}
                        className={cn(
                          "group relative h-[32rem] rounded-[2rem] overflow-hidden cursor-pointer border transition-all duration-700",
                          selectedStyle?.id === style.id 
                            ? "active-gold-border shadow-[0_0_40px_rgba(212,175,55,0.15)]" 
                            : "border-white/5 hover:border-gold/30 bg-zinc-900"
                        )}
                      >
                        <img 
                          src={style.previewUrl} 
                          alt={style.name} 
                          className={cn(
                            "absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-110",
                            selectedStyle?.id === style.id ? "opacity-100" : "opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-60"
                          )}
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-10 space-y-3 transform transition-transform duration-700 group-hover:translate-y-[-10px]">
                          <div className="w-8 h-[1px] bg-gold/60 mb-2" />
                          <h3 className="text-3xl font-serif italic tracking-wide group-hover:text-gold transition-colors">{style.name}</h3>
                          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/40 leading-relaxed">{style.description}</p>
                        </div>
                        {selectedStyle?.id === style.id && (
                          <div className="absolute top-8 right-8 w-10 h-10 gold-gradient rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircle2 className="text-black w-6 h-6" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-12">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
                    <div>
                      <h2 className="text-4xl font-serif italic mb-3">Refinement Matrix</h2>
                      <p className="text-white/40 font-light tracking-wide">Orchestrate the environmental nuances for an unparalleled result.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex bg-white/5 rounded-full p-1 border border-white/10 mr-2">
                        <button 
                          onClick={undo}
                          disabled={history.length === 0}
                          className="p-2.5 rounded-full hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed group"
                          title="Undo"
                        >
                          <Undo className="w-3.5 h-3.5 group-hover:text-gold transition-colors" />
                        </button>
                        <button 
                          onClick={redo}
                          disabled={future.length === 0}
                          className="p-2.5 rounded-full hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed group"
                          title="Redo"
                        >
                          <Redo className="w-3.5 h-3.5 group-hover:text-gold transition-colors" />
                        </button>
                      </div>
                      <button 
                        onClick={() => setStep(2)}
                        className="flex items-center gap-2 px-6 py-3 border border-white/10 rounded-full hover:bg-white/5 transition-all text-[10px] uppercase tracking-[0.2em] font-bold"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Curation
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-4 space-y-12">
                      {/* Lighting */}
                      <div className="space-y-8">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40">Atmospheric Density</label>
                          <span className="text-[9px] font-mono text-gold/80 uppercase tracking-widest">Dynamic Range</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { id: 'soft', icon: Sun, label: 'Ethereal' },
                            { id: 'dramatic', icon: Zap, label: 'Noir' },
                            { id: 'warm', icon: Moon, label: 'Luminous' },
                            { id: 'cool', icon: Sparkles, label: 'Arctic' }
                          ].map((l) => (
                            <button
                              key={l.id}
                              onClick={() => pushToHistory({ ...customization, lighting: l.id as any })}
                              className={cn(
                                "flex flex-col items-center gap-4 p-6 rounded-3xl border transition-all duration-500 group relative overflow-hidden",
                                customization.lighting === l.id 
                                  ? "gold-gradient text-black border-gold shadow-lg" 
                                  : "bg-white/5 border-white/10 hover:border-gold/40 text-white/60 hover:text-white"
                              )}
                            >
                              <l.icon className={cn("w-6 h-6 mb-1", customization.lighting === l.id ? "text-black" : "text-white/40 group-hover:text-gold")} />
                              <span className="text-[10px] uppercase tracking-widest font-bold">{l.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Background */}
                      <div className="space-y-8">
                        <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40">Spatial Perspective</label>
                        <div className="space-y-3">
                          {[
                            { id: 'blurred', label: 'Cinematic Depth Mapping' },
                            { id: 'solid', label: 'Matte Studio Canvas' },
                            { id: 'library', label: 'Executive Heritage' },
                            { id: 'nature', label: 'Natural Horizon' }
                          ].map((b) => (
                            <button
                              key={b.id}
                              onClick={() => pushToHistory({ ...customization, background: b.id as any })}
                              className={cn(
                                "group w-full flex items-center justify-between px-8 py-5 rounded-[1.5rem] border transition-all duration-500",
                                customization.background === b.id 
                                  ? "bg-white text-black border-white" 
                                  : "bg-zinc-900 border-white/10 hover:border-gold/40 text-white/60 hover:text-white"
                              )}
                            >
                              <span className="text-[11px] font-bold uppercase tracking-widest">{b.label}</span>
                              {customization.background === b.id ? (
                                <div className="w-1.5 h-1.5 rounded-full bg-black shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
                              ) : (
                                <div className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-gold/40 transition-colors" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Retouching Controls */}
                      <div className="space-y-8 border-t border-white/5 pt-8">
                        <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40">Digital Retouching</label>
                        <div className="space-y-6">
                          {[
                            { id: 'sharpness', label: 'Edge Clarity', value: customization.sharpness },
                            { id: 'skinSmoothing', label: 'Skin Texture', value: customization.skinSmoothing },
                            { id: 'clarity', label: 'Mid-tone Depth', value: customization.clarity }
                          ].map((s) => (
                            <div key={s.id} className="space-y-3">
                              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                                <span className="text-white/60">{s.label}</span>
                                <span className="text-gold font-mono">{s.value}%</span>
                              </div>
                              <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={s.value} 
                                onChange={(e) => pushToHistory({ ...customization, [s.id]: parseInt(e.target.value) })}
                                className="w-full h-[2px] bg-white/10 accent-gold cursor-pointer appearance-none rounded-full"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <button 
                        onClick={onGenerate}
                        disabled={isGenerating}
                        className="w-full py-6 gold-gradient text-black rounded-full font-black tracking-[0.3em] text-xs uppercase hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group shadow-[0_15px_60px_-15px_rgba(212,175,55,0.4)]"
                      >
                        {isGenerating ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            Synthesize Image
                            <Sparkles className="w-5 h-5 transition-transform group-hover:rotate-12" />
                          </>
                        )}
                      </button>
                    </div>

                    <div className="lg:col-span-8">
                       <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/10 bg-zinc-900 p-8 shadow-2xl">
                          <img 
                            src={userImage!} 
                            alt="Original Asset" 
                            className="w-full h-full object-cover rounded-[2rem] opacity-30 grayscale blur-[2px]" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 flex items-center justify-center p-12">
                            <div className="w-full h-full border border-gold/20 rounded-[2.5rem] flex flex-col items-center justify-center text-center glass relative">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 bg-[#0A0A0A] border border-gold/30 rounded-full py-1">
                                  <span className="text-[9px] uppercase tracking-[0.3em] font-black text-gold">Aura Simulation</span>
                                </div>
                                <div className="space-y-6 flex flex-col items-center">
                                  <div className="w-20 h-20 rounded-full border border-gold/40 flex items-center justify-center">
                                    <Sparkles className="w-8 h-8 text-gold animate-pulse" />
                                  </div>
                                  <div>
                                    <h4 className="font-serif italic text-3xl mb-1">{selectedStyle?.name}</h4>
                                    <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold">Selected Schema</p>
                                  </div>
                                </div>
                            </div>
                          </div>
                          
                          {/* Design accents */}
                          <div className="absolute top-4 left-1/2 -ml-px w-[1px] h-4 bg-gold/30" />
                          <div className="absolute bottom-4 left-1/2 -ml-px w-[1px] h-4 bg-gold/30" />
                          <div className="absolute left-4 top-1/2 -mt-px w-4 h-[1px] bg-gold/30" />
                          <div className="absolute right-4 top-1/2 -mt-px w-4 h-[1px] bg-gold/30" />
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="max-w-4xl mx-auto space-y-16 text-center">
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-block px-5 py-2 border border-gold/30 rounded-full bg-gold/5"
                    >
                      <span className="text-[10px] uppercase tracking-[0.5em] font-black text-gold">Evolution Complete</span>
                    </motion.div>
                    <h2 className="text-5xl font-serif italic mb-2 tracking-tight">
                      {isGenerating ? "Synthesizing Master Portrait..." : "The New Standard of Presence"}
                    </h2>
                    {!isGenerating && <p className="text-white/40 font-light tracking-[0.2em] uppercase text-[10px] font-bold">Processed at 4K Resolution / Neural Rendering Engine v4.0</p>}
                    {!isGenerating && resultImage && (
                      <div className="flex justify-center mt-4">
                        <button 
                          onMouseDown={() => setShowOriginal(true)}
                          onMouseUp={() => setShowOriginal(false)}
                          onMouseLeave={() => setShowOriginal(false)}
                          className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-gold/10 hover:border-gold/30 transition-all select-none"
                        >
                          Hold to View Original
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="relative aspect-square max-w-2xl mx-auto rounded-[3.5rem] overflow-hidden bg-zinc-900 border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] accent-border p-2">
                    <AnimatePresence mode="wait">
                      {isGenerating ? (
                        <motion.div 
                          key="generating-final"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 flex flex-col items-center justify-center p-20 text-center"
                        >
                          <div className="relative w-48 h-48 mb-12">
                             <motion.div 
                               animate={{ rotate: 360 }}
                               transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                               className="absolute inset-0 border-[0.5px] border-dashed border-gold/40 rounded-full"
                             />
                             <motion.div 
                               animate={{ rotate: -360 }}
                               transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                               className="absolute inset-4 border-[0.5px] border-gold/10 rounded-full"
                             />
                             <div className="absolute inset-0 flex items-center justify-center">
                               <Camera className="w-16 h-16 text-gold/30" />
                             </div>
                             <div className="absolute top-0 left-1/2 -ml-2 w-4 h-4 bg-gold rounded-full blur-[4px] animate-pulse" />
                          </div>
                          <div className="space-y-4">
                             <p className="text-xs uppercase tracking-[0.6em] font-black text-gold">Refining Photorealistic Maps</p>
                             <div className="flex gap-1 justify-center">
                                {[1, 2, 3].map(i => (
                                  <motion.div 
                                    key={i}
                                    animate={{ height: [8, 16, 8] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                    className="w-1 bg-gold/40 rounded-full"
                                  />
                                ))}
                             </div>
                             <p className="text-[10px] text-white/30 italic max-w-xs mx-auto">Calculating light transport and skin texture variance for consistent professional grade...</p>
                          </div>
                        </motion.div>
                      ) : resultImage ? (
                        <motion.div
                          key="result-final"
                          initial={{ opacity: 0, filter: 'blur(20px)', scale: 1.1 }}
                          animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full w-full rounded-[3rem] overflow-hidden relative"
                        >
                          <img 
                            src={showOriginal ? userImage! : resultImage} 
                            alt="Master Portrait" 
                            className="w-full h-full object-cover transition-opacity duration-300" 
                            referrerPolicy="no-referrer"
                          />
                          {showOriginal && (
                            <div className="absolute top-8 left-8 px-4 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                              <span className="text-[10px] uppercase tracking-widest font-bold">Original Asset</span>
                            </div>
                          )}
                          <div className="absolute inset-0 border border-white/10 rounded-[3rem] pointer-events-none" />
                        </motion.div>
                      ) : error ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-12 text-center text-red-400">
                          <div className="w-20 h-20 rounded-full bg-red-400/10 flex items-center justify-center border border-red-400/20">
                            <XCircle className="w-10 h-10" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-3xl font-serif italic text-white">System Interruption</h3>
                            <p className="text-xs tracking-widest uppercase opacity-70 font-bold">{error}</p>
                          </div>
                          <button 
                            onClick={() => setStep(3)}
                            className="mt-4 px-10 py-4 border border-white/20 rounded-full text-white hover:bg-white/5 transition-all font-black uppercase tracking-[0.3em] text-[10px]"
                          >
                            Re-initialize Sequence
                          </button>
                        </div>
                      ) : null}
                    </AnimatePresence>
                  </div>

                  {!isGenerating && (resultImage || error) && (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                      {resultImage && (
                        <a 
                          href={resultImage} 
                          download="personashot-evolution-final.png"
                          className="group w-full sm:w-auto px-12 py-6 gold-gradient text-black rounded-full font-black tracking-[0.3em] text-[10px] uppercase hover:scale-[1.05] transition-all flex items-center justify-center gap-3 shadow-[0_20px_50px_-15px_rgba(212,175,55,0.5)]"
                        >
                          <Download className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                          Acquire Portrait
                        </a>
                      )}
                      <button 
                        onClick={reset}
                        className="w-full sm:w-auto px-12 py-6 border border-white/10 rounded-full font-black tracking-[0.3em] text-[10px] uppercase hover:bg-white/5 transition-all flex items-center justify-center gap-3 text-white/60 hover:text-white"
                      >
                        <RefreshCcw className="w-4 h-4" />
                        New Evolution
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Luxury Status Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-8 flex justify-between items-end pointer-events-none text-white/20 hidden sm:flex">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_8px_#D4AF37] animate-pulse" />
            <p className="text-[9px] uppercase tracking-[0.4em] font-black text-white/40">Server Latency</p>
          </div>
          <p className="text-[10px] font-mono select-none pl-3.5">v2.5_Flash_Ais_Optimized</p>
        </div>
        <div className="text-right space-y-2">
          <p className="text-[9px] uppercase tracking-[0.4em] font-black text-white/40">Encryption Status</p>
          <div className="flex items-center justify-end gap-2">
             <span className="text-[10px] font-mono select-none uppercase tracking-tighter text-gold/60">Secure Studio Mode</span>
             <Sparkles className="w-3 h-3 text-gold/30" />
          </div>
        </div>
      </footer>
    </div>
  );
}

