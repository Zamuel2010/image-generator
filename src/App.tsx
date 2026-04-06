import { useState } from 'react';
import { Image as ImageIcon, Loader2, Download, Sparkles, AlertCircle } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#F27D26]/30">
      <header className="border-b border-white/10 bg-[#0a0a0a] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#F27D26]" />
            <span className="font-bold tracking-tight">Lumina Studio (100% Free)</span>
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
      // Using Pollinations.ai - a completely free, no-API-key required image generation service
      const seed = Math.floor(Math.random() * 10000000);
      const encodedPrompt = encodeURIComponent(prompt);
      const width = 1024;
      const height = 1024;
      
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&width=${width}&height=${height}&nologo=true`;

      // Pre-load the image to show the loading spinner until it's fully downloaded
      const img = new Image();
      img.crossOrigin = "Anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("Failed to load generated image. Please try again."));
        img.src = imageUrl;
      });

      setResultUrl(imageUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!resultUrl) return;
    try {
      // Fetch the image as a blob to force a download rather than opening in a new tab
      const response = await fetch(resultUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `lumina-image-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed, opening in new tab instead", err);
      window.open(resultUrl, '_blank');
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
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <p className="leading-relaxed">{error}</p>
              </div>
            )}
            
            <div className="mt-4 text-xs text-gray-500 text-center">
              Powered by Pollinations.ai. No API key required.
            </div>
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
                crossOrigin="anonymous"
              />
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={handleDownload}
                  className="bg-black/50 hover:bg-black/80 backdrop-blur-md text-white p-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors border border-white/10 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
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
