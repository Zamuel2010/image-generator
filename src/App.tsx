import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Image as ImageIcon, Loader2, Download, Sparkles, AlertCircle } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#F27D26]/30">
      <header className="border-b border-white/10 bg-[#0a0a0a] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#F27D26]" />
            <span className="font-bold tracking-tight">Lumina Studio (Free)</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <ImageGenerator />
      </main>
    </div>
  );
}

function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setResultUrl(null);

    try {
      // Check for the API key. In AI Studio, this is injected automatically.
      // On Vercel, it must be set in the project's Environment Variables.
      const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error("API key not found. If you deployed this to Vercel, you must add your GEMINI_API_KEY to the Vercel Environment Variables and redeploy.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
      });

      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          setResultUrl(`data:image/png;base64,${base64EncodeString}`);
          foundImage = true;
          break;
        }
      }
      
      if (!foundImage) {
        throw new Error("No image was returned in the response.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-[#151619] rounded-xl p-6 border border-white/5">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#F27D26]" />
            Image Settings
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A neon hologram of a cat driving at top speed..."
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#F27D26] focus:ring-1 focus:ring-[#F27D26] transition-all resize-none h-32"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-[#F27D26] hover:bg-[#d96b1f] disabled:bg-[#F27D26]/50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mt-6"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Image
                </>
              )}
            </button>
            
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-400 text-sm mt-4">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-8">
        <div className="bg-[#151619] rounded-xl border border-white/5 overflow-hidden min-h-[600px] flex items-center justify-center relative">
          {isGenerating ? (
            <div className="flex flex-col items-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#F27D26] mb-4" />
              <p className="text-sm font-medium animate-pulse">Crafting your image...</p>
            </div>
          ) : resultUrl ? (
            <div className="relative w-full h-full flex items-center justify-center p-4 group">
              <img 
                src={resultUrl} 
                alt="Generated result" 
                className="max-w-full max-h-[700px] object-contain rounded-lg shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <a 
                  href={resultUrl} 
                  download="lumina-image.png"
                  className="bg-black/50 hover:bg-black/80 backdrop-blur-md text-white p-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors border border-white/10"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm">Your generated image will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
