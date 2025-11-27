import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button, Spinner } from '@nextui-org/react';
import { ArrowLeft, Settings, PictureInPicture, Download } from 'lucide-react'; // Added Download Icon
import useAxios from '../hooks/useAxios';
import { ANIME, KWIK } from '../config/config';
import { DownloadLinks, DirectLink } from 'fetch/requests';
import toast from 'react-hot-toast';

interface VideoSource {
    quality: string;
    url: string;
    originalUrl: string; // Keep the original Kwik URL for downloading logic
}

const Player = () => {
    const { session, episode } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const videoRef = useRef<HTMLVideoElement>(null);
    
    const meta = location.state || {};

    const { request } = useAxios();
    const [sources, setSources] = useState<VideoSource[]>([]);
    const [currentSrc, setCurrentSrc] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [statusText, setStatusText] = useState('Initializing...');

    useEffect(() => {
        const initPlayer = async () => {
            if (!session || !episode) return;
            setLoading(true);

            try {
                setStatusText('Fetching sources...');
                const linkData = await request<DownloadLinks>({
                    server: ANIME,
                    endpoint: `/?method=episode&session=${session}&ep=${episode}`,
                    method: 'GET'
                });

                if (!linkData || linkData.length === 0) {
                    toast.error("No links found for this episode.");
                    setLoading(false);
                    return;
                }

                setStatusText('Bypassing protections...');
                const resolvedSources: VideoSource[] = [];

                const bypassPromises = linkData.map(async (item) => {
                    const bypass = await request<DirectLink>({
                        server: KWIK,
                        endpoint: `/?url=${encodeURIComponent(item.link)}`,
                        method: 'GET'
                    });

                    if (bypass && bypass.success) {
                        const proxyUrl = `${ANIME}/proxy?proxyUrl=${encodeURIComponent(bypass.url)}&modify`;
                        return {
                            quality: item.name,
                            url: proxyUrl,
                            originalUrl: bypass.url // Store real direct link for download
                        };
                    }
                    return null;
                });

                const results = await Promise.all(bypassPromises);
                
                results.forEach(res => {
                    if (res) resolvedSources.push(res);
                });

                if (resolvedSources.length > 0) {
                    // Sort by resolution (1080p first)
                    resolvedSources.sort((a, b) => b.quality.localeCompare(a.quality));
                    setSources(resolvedSources);
                    setCurrentSrc(resolvedSources[0].url);
                } else {
                    toast.error("Failed to resolve video streams.");
                }

            } catch (e) {
                toast.error("Error loading player.");
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        initPlayer();
    }, [session, episode]);

    const handleQualityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newUrl = e.target.value;
        if (!newUrl || !videoRef.current) return;

        const currentTime = videoRef.current.currentTime;
        const isPaused = videoRef.current.paused;

        setCurrentSrc(newUrl);

        setTimeout(() => {
            if (videoRef.current) {
                videoRef.current.currentTime = currentTime;
                if (!isPaused) videoRef.current.play();
            }
        }, 100);
    };

    const togglePiP = async () => {
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else if (videoRef.current) {
                await videoRef.current.requestPictureInPicture();
            }
        } catch (error) {
            console.error(error);
            toast.error("PiP mode not supported.");
        }
    };

    const downloadCurrent = () => {
        const currentSource = sources.find(s => s.url === currentSrc);
        if (!currentSource) return;

        // Use the specific naming convention
        const safeTitle = (meta.seriesTitle || 'Anime').replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
        const epNum = meta.episodeNumber || 'Episode';
        const fileName = `${safeTitle}_${epNum}_animepahe-26e.pages.dev_.mp4`;

        // Trigger Proxy Download
        const proxyDownloadUrl = `${ANIME}/proxy?proxyUrl=${encodeURIComponent(currentSource.originalUrl)}&modify&download&filename=${encodeURIComponent(fileName)}`;
        
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = proxyDownloadUrl;
        document.body.appendChild(iframe);
        
        setTimeout(() => document.body.removeChild(iframe), 60000);
        toast.success(`Downloading: ${currentSource.quality}`);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 pb-20">
            <div className="w-full max-w-5xl glass-panel p-4 rounded-2xl relative">
                
                {/* Header */}
                <div className="flex items-center gap-4 mb-4 border-b border-white/10 pb-4">
                    <Button 
                        isIconOnly 
                        variant="light" 
                        className="text-white hover:bg-white/10" 
                        onPress={() => navigate(-1)}
                    >
                        <ArrowLeft />
                    </Button>
                    <div>
                        <h2 className="text-xl font-bold text-white text-shadow line-clamp-1">
                            {meta.seriesTitle || 'Anime Player'}
                        </h2>
                        <p className="text-white/60 text-sm">Episode {meta.episodeNumber || '...'}</p>
                    </div>
                </div>

                {/* Player Container */}
                <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
                    {loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/80 backdrop-blur-sm">
                            <Spinner size="lg" color="white" />
                            <p className="text-white mt-4 animate-pulse font-mono text-sm">{statusText}</p>
                        </div>
                    )}

                    {!loading && currentSrc && (
                        <video
                            ref={videoRef}
                            src={currentSrc}
                            controls
                            autoPlay
                            className="w-full h-full object-contain"
                            poster={meta.snapshot ? `${ANIME}/proxy?modify&proxyUrl=${meta.snapshot}` : undefined}
                        >
                            Your browser does not support the video tag.
                        </video>
                    )}
                </div>

                {/* Controls Bar */}
                {!loading && sources.length > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
                        
                        {/* Download Button (Left side on Desktop, Top on mobile flow) */}
                        <Button
                            onPress={downloadCurrent}
                            className="w-full sm:w-auto bg-success/20 hover:bg-success/30 text-success-300 border border-success/20 font-semibold"
                            startContent={<Download size={18} />}
                        >
                            Download ({sources.find(s => s.url === currentSrc)?.quality.split(' ')[0] || 'MP4'})
                        </Button>

                        <div className="flex w-full sm:w-auto gap-3">
                            {/* PiP Button */}
                            <Button
                                isIconOnly
                                onPress={togglePiP}
                                className="bg-white/10 hover:bg-white/20 text-white border border-white/10"
                            >
                                <PictureInPicture size={20} />
                            </Button>

                            {/* Quality Selector */}
                            <div className="flex flex-1 items-center gap-2 bg-white/10 hover:bg-white/15 rounded-xl px-3 border border-white/10 transition-colors">
                                <Settings size={16} className="text-white/70" />
                                <select 
                                    className="bg-transparent text-white text-sm outline-none cursor-pointer py-2 w-full sm:w-auto min-w-[150px]"
                                    onChange={handleQualityChange}
                                    value={currentSrc}
                                >
                                    {sources.map((src) => (
                                        <option key={src.url} value={src.url} className="text-black">
                                            {src.quality}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Player;
