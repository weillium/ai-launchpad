'use client';

import { useState } from 'react';
import { FileText, BarChart3, Brain, Zap, RefreshCw } from 'lucide-react';

interface AnalysisResult {
  wordCount: number;
  characterCount: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  keyInsights: string[];
  readingTime: number;
}

export default function TextAnalyzer() {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeText = async () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    
    // Simulate AI analysis (in a real app, this would call your AI service)
    setTimeout(() => {
      const words = text.trim().split(/\s+/).length;
      const characters = text.length;
      const readingTime = Math.ceil(words / 200); // Average reading speed

      // Simple sentiment analysis simulation
      const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'happy', 'beautiful'];
      const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'disgusting', 'angry', 'sad', 'disappointed'];
      
      const textLower = text.toLowerCase();
      const positiveCount = positiveWords.filter(word => textLower.includes(word)).length;
      const negativeCount = negativeWords.filter(word => textLower.includes(word)).length;
      
      let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
      let sentimentScore = 0;
      
      if (positiveCount > negativeCount) {
        sentiment = 'positive';
        sentimentScore = 0.7;
      } else if (negativeCount > positiveCount) {
        sentiment = 'negative';
        sentimentScore = -0.7;
      }

      // Generate key insights
      const insights = [];
      if (words > 100) insights.push('Long-form content');
      if (words < 50) insights.push('Concise content');
      if (text.includes('?')) insights.push('Contains questions');
      if (text.includes('!')) insights.push('Emphatic tone');
      if (sentiment === 'positive') insights.push('Positive sentiment detected');
      if (sentiment === 'negative') insights.push('Negative sentiment detected');
      if (readingTime > 2) insights.push('Requires focused reading');

      setAnalysis({
        wordCount: words,
        characterCount: characters,
        sentiment,
        sentimentScore,
        keyInsights: insights,
        readingTime
      });
      
      setIsAnalyzing(false);
    }, 1500);
  };

  const resetAnalysis = () => {
    setText('');
    setAnalysis(null);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getSentimentBgColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-500/10 border-green-500/20';
      case 'negative': return 'bg-red-500/10 border-red-500/20';
      default: return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-text">Text Analyzer</h1>
            <p className="text-sm text-text-muted">AI-powered text analysis and insights</p>
          </div>
        </div>
        <button
          onClick={resetAnalysis}
          className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm text-text-muted transition hover:border-accent/50 hover:bg-background/80 hover:text-text"
        >
          <RefreshCw className="h-4 w-4" />
          Reset
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6">
        {/* Input Section */}
        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Enter text to analyze
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your text here for AI analysis..."
              className="w-full h-64 rounded-lg border border-border bg-background px-4 py-3 text-text placeholder-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
            />
          </div>
          
          <button
            onClick={analyzeText}
            disabled={!text.trim() || isAnalyzing}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white transition hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                Analyze Text
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        <div className="flex-1 space-y-4">
          {analysis ? (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-surface/60 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium text-text">Words</span>
                  </div>
                  <div className="text-2xl font-bold text-text">{analysis.wordCount}</div>
                </div>
                
                <div className="rounded-lg border border-border bg-surface/60 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium text-text">Characters</span>
                  </div>
                  <div className="text-2xl font-bold text-text">{analysis.characterCount}</div>
                </div>
                
                <div className="rounded-lg border border-border bg-surface/60 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium text-text">Reading Time</span>
                  </div>
                  <div className="text-2xl font-bold text-text">{analysis.readingTime}m</div>
                </div>
                
                <div className={`rounded-lg border p-4 ${getSentimentBgColor(analysis.sentiment)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className={`h-4 w-4 ${getSentimentColor(analysis.sentiment)}`} />
                    <span className="text-sm font-medium text-text">Sentiment</span>
                  </div>
                  <div className={`text-2xl font-bold capitalize ${getSentimentColor(analysis.sentiment)}`}>
                    {analysis.sentiment}
                  </div>
                  <div className="text-xs text-text-muted mt-1">
                    Score: {analysis.sentimentScore.toFixed(1)}
                  </div>
                </div>
              </div>

              {/* Key Insights */}
              <div className="rounded-lg border border-border bg-surface/60 p-4">
                <h3 className="text-sm font-medium text-text mb-3">Key Insights</h3>
                <div className="space-y-2">
                  {analysis.keyInsights.map((insight, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-text-muted">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent"></div>
                      {insight}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 rounded-lg border border-dashed border-border/60 bg-surface/40">
              <div className="text-center">
                <Brain className="h-12 w-12 text-text-muted mx-auto mb-3" />
                <p className="text-sm text-text-muted">
                  Enter text above to see AI-powered analysis
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
