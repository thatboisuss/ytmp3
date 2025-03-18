import React, { useState } from 'react';
import { Download, Music, Video, History, Sun, Moon, Trash2, Loader2 } from 'lucide-react';

interface VideoMetadata {
  title: string;
  description: string;
  author: string;
  thumbnailUrl: string;
}

interface DownloadHistory {
  url: string;
  format: 'mp3' | 'mp4';
  quality?: string;
  timestamp: Date;
  metadata?: VideoMetadata;
}

function App() {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState<'mp3' | 'mp4'>('mp4');
  const [quality, setQuality] = useState('720p');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [history, setHistory] = useState<DownloadHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  // Extract video ID from YouTube URL
  const getVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Fetch video metadata from YouTube oEmbed API
  const fetchMetadata = async (videoId: string) => {
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      const data = await response.json();
      
      setMetadata({
        title: data.title,
        author: data.author_name,
        description: data.title, // oEmbed doesn't provide description
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      });
    } catch (error) {
      console.error('Error fetching metadata:', error);
      setMetadata(null);
    }
  };

  // Handle URL input change
  const handleUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    
    const videoId = getVideoId(newUrl);
    if (videoId) {
      setIsLoadingMetadata(true);
      await fetchMetadata(videoId);
      setIsLoadingMetadata(false);
    } else {
      setMetadata(null);
    }
  };

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLoading(false);
          setProgress(0);
          setHistory(prev => [{
            url,
            format,
            quality: format === 'mp4' ? quality : undefined,
            timestamp: new Date(),
            metadata: metadata || undefined
          }, ...prev]);
          return 0;
        }
        return prev + 10;
      });
    }, 500);
  };

  const clearHistory = () => setHistory([]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-200`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Download className="w-10 h-10" />
            YouTube Downloader
          </h1>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8 mb-8 transition-colors duration-200`}>
          <form onSubmit={handleDownload} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">YouTube URL</label>
              <input
                type="url"
                value={url}
                onChange={handleUrlChange}
                placeholder="Paste YouTube URL here"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:border-gray-600 transition-colors duration-200"
                required
              />
            </div>

            {isLoadingMetadata && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            )}

            {metadata && (
              <div className="space-y-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img 
                    src={metadata.thumbnailUrl} 
                    alt={metadata.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-xl font-semibold leading-tight">{metadata.title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">By {metadata.author}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">{metadata.description}</p>
              </div>
            )}

            <div className="flex gap-6">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Format</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormat('mp4')}
                    className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ${
                      format === 'mp4'
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Video className="w-4 h-4" /> MP4
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('mp3')}
                    className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ${
                      format === 'mp3'
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Music className="w-4 h-4" /> MP3
                  </button>
                </div>
              </div>

              {format === 'mp4' && (
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Quality</label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:border-gray-600 transition-colors duration-200"
                  >
                    <option value="1080p">1080p</option>
                    <option value="720p">720p</option>
                    <option value="480p">480p</option>
                    <option value="360p">360p</option>
                  </select>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !metadata}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-blue-500 transition-colors duration-200 shadow-lg shadow-blue-500/25"
            >
              <Download className="w-5 h-5" />
              {isLoading ? 'Downloading...' : 'Download'}
            </button>

            {isLoading && (
              <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </form>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8 transition-colors duration-200`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <History className="w-6 h-6" />
              Download History
            </h2>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-red-500 hover:text-red-600 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4" /> Clear History
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No downloads yet
            </p>
          ) : (
            <div className="space-y-3">
              {history.map((item, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  } transition-colors duration-200`}
                >
                  <div className="flex items-center gap-4">
                    {item.metadata?.thumbnailUrl && (
                      <img
                        src={item.metadata.thumbnailUrl}
                        alt={item.metadata.title}
                        className="w-24 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {item.metadata?.title || item.url}
                      </h3>
                      {item.metadata?.author && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          By {item.metadata.author}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {item.format === 'mp3' ? (
                          <Music className="w-4 h-4" />
                        ) : (
                          <Video className="w-4 h-4" />
                        )}
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {item.format.toUpperCase()}
                          {item.quality && ` - ${item.quality}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;