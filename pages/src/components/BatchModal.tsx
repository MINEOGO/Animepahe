import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Progress, Textarea } from "@nextui-org/react";
import { useState } from "react";
import useAxios from "../hooks/useAxios";
import { ANIME } from "../config/config";
import { EpisodeResult, DownloadLinks } from "fetch/requests";
import { Copy, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

interface BatchModalProps {
    isOpen: boolean;
    onOpenChange: () => void;
    session: string;
    title: string;
    totalPages: number;
}

const BatchModal = ({ isOpen, onOpenChange, session, title, totalPages }: BatchModalProps) => {
    const { request } = useAxios();
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("");
    const [links, setLinks] = useState<string[]>([]);
    const [isDone, setIsDone] = useState(false);

    const fetchAllLinks = async () => {
        setLoading(true);
        setLinks([]);
        setIsDone(false);
        const collectedLinks: string[] = [];

        try {
            // Loop through all pages
            for (let page = 1; page <= totalPages; page++) {
                setStatus(`Fetching Page ${page}/${totalPages}...`);
                setProgress(((page - 1) / totalPages) * 100);

                // 1. Get Episodes for this page
                const epData = await request<EpisodeResult>({
                    server: ANIME,
                    endpoint: `/?method=series&session=${session}&page=${page}`,
                    method: 'GET'
                });

                if (!epData || !epData.episodes) continue;

                // 2. For each episode in this page, fetch its links (Parallel requests for speed)
                const episodePromises = epData.episodes.map(async (ep) => {
                    const linkData = await request<DownloadLinks>({
                        server: ANIME,
                        endpoint: `/?method=episode&session=${session}&ep=${ep.session}`,
                        method: 'GET'
                    });

                    // Logic: Grab the highest quality link available (usually the last one is 1080p or 720p)
                    if (linkData && Array.isArray(linkData) && linkData.length > 0) {
                        const bestLink = linkData.find(l => l.name.includes("1080")) || linkData[linkData.length - 1];
                        return `${ep.episode}: ${bestLink.link}`;
                    }
                    return null;
                });

                const results = await Promise.all(episodePromises);
                results.forEach(r => { if (r) collectedLinks.push(r); });
            }

            setLinks(collectedLinks);
            setStatus("Complete!");
            setProgress(100);
            setIsDone(true);
            toast.success(`Fetched ${collectedLinks.length} links!`);

        } catch (e) {
            setStatus("Error occurred.");
            toast.error("Batch fetch failed.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        const urlList = links.map(l => l.split(': ')[1]).join('\n');
        navigator.clipboard.writeText(urlList);
        toast.success("Copied all links to clipboard!");
    };

    const openAllTabs = () => {
        if (links.length > 10) {
            if(!confirm(`You are about to open ${links.length} tabs. This might crash your browser. Continue?`)) return;
        }
        links.forEach(l => {
            const url = l.split(': ')[1];
            window.open(url, '_blank');
        });
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" backdrop="blur">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            Bulk Download: {title}
                            <span className="text-tiny text-default-400">{totalPages} Pages of Episodes</span>
                        </ModalHeader>
                        <ModalBody>
                            {!isDone && !loading && (
                                <div className="text-center py-4">
                                    <p>This will iterate through all pages and fetch the Kwik link for every episode.</p>
                                    <p className="text-warning text-sm mt-2">Warning: For long series, this may take a while.</p>
                                </div>
                            )}

                            {(loading || isDone) && (
                                <div className="flex flex-col gap-4">
                                    <Progress 
                                        aria-label="Downloading..." 
                                        size="md" 
                                        value={progress} 
                                        color="success" 
                                        showValueLabel={true} 
                                        className="max-w-md mx-auto" 
                                    />
                                    <p className="text-center text-sm">{status}</p>
                                </div>
                            )}

                            {isDone && (
                                <div className="mt-4">
                                    <Textarea
                                        label="Generated Links (Episode: Link)"
                                        placeholder="Links will appear here..."
                                        value={links.join('\n')}
                                        readOnly
                                        minRows={10}
                                        maxRows={15}
                                        variant="bordered"
                                    />
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            {!loading && !isDone && (
                                <Button color="primary" onPress={fetchAllLinks} className="w-full">
                                    Start Batch Fetch
                                </Button>
                            )}
                            {isDone && (
                                <div className="flex gap-2 w-full">
                                    <Button color="secondary" variant="flat" onPress={copyToClipboard} startContent={<Copy size={18}/>} className="flex-1">
                                        Copy Links (IDM/JDownloader)
                                    </Button>
                                    <Button color="warning" variant="flat" onPress={openAllTabs} startContent={<ExternalLink size={18}/>} className="flex-1">
                                        Open All Tabs
                                    </Button>
                                </div>
                            )}
                            <Button color="danger" variant="light" onPress={onClose}>
                                Close
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default BatchModal;
