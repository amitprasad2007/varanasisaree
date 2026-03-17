import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, User, Bot, Loader2, Sparkles, Terminal, Image as ImageIcon, Paperclip } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    role: 'user' | 'model';
    content: string;
    image?: string;
    generatedImage?: string;
}

const ASPECT_RATIOS = ['1:1', '3:2', '2:3', '4:3', '3:4', '16:9', '9:16'] as const;

const BackendAiAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isImageMode, setIsImageMode] = useState(false);
    const [aspectRatio, setAspectRatio] = useState<string>('1:1');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', content: 'Greeting, Admin! I am the Samar Silk Palace Technical Assistant. How can I help you with the backend service or saree descriptions today?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSend = async () => {
        if ((!input.trim() && !selectedImage) || isLoading) return;

        const userMessage = input.trim();
        const imageToSend = selectedImage;

        setInput('');
        setSelectedImage(null);

        if (isImageMode) {
            // Image generation mode
            setMessages(prev => [...prev, { role: 'user', content: `🎨 Generate Image: ${userMessage}` }]);
            setIsLoading(true);

            try {
                const response = await axios.post('/admin/ai/generate-image', {
                    prompt: userMessage,
                    aspect_ratio: aspectRatio,
                });

                const data = response.data;

                if (data.status === 'success' && data.url) {
                    setMessages(prev => [...prev, {
                        role: 'model',
                        content: data.message || 'Image generated successfully!',
                        generatedImage: data.url,
                    }]);
                } else {
                    setMessages(prev => [...prev, {
                        role: 'model',
                        content: `⚠️ ${data.message || 'Image generation failed. Try a different prompt.'}`,
                    }]);
                }
            } catch (error: any) {
                console.error('Image Generation Error:', error);
                const errorMsg = error.response?.data?.message || error.response?.data?.errors?.prompt?.[0] || 'Failed to generate image. Please try again.';
                setMessages(prev => [...prev, { role: 'model', content: `⚠️ ${errorMsg}` }]);
            } finally {
                setIsLoading(false);
            }
        } else {
            // Normal chat mode
            setMessages(prev => [...prev, { role: 'user', content: userMessage, image: imageToSend || undefined }]);
            setIsLoading(true);

            try {
                const response = await axios.post('/admin/ai/chat', {
                    message: userMessage || "Analyze this image",
                    history: history,
                    image: imageToSend
                });

                const data = response.data;
                setMessages(prev => [...prev, { role: 'model', content: data.response }]);
                setHistory(data.history);
            } catch (error: any) {
                console.error('Backend AI Chat Error:', error);
                setMessages(prev => [...prev, { role: 'model', content: "SYSTEM ERROR: Unable to process request. Check logs for details." }]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4"
                    >
                        <Card className="w-[380px] sm:w-[450px] h-[600px] shadow-2xl border-slate-700 bg-slate-900 text-slate-100 flex flex-col overflow-hidden border">
                            <CardHeader className="bg-slate-800 border-b border-slate-700 p-4 flex flex-row items-center justify-between space-y-0 text-slate-100">
                                <CardTitle className="text-sm font-mono flex items-center gap-2">
                                    <Terminal className="h-4 w-4 text-emerald-400" />
                                    <span>SYSTEM_ASSISTANT_V1.0</span>
                                </CardTitle>
                                <div className="flex items-center gap-1">
                                    {/* Image Generation Mode Toggle */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "h-8 w-8 transition-colors",
                                            isImageMode
                                                ? "text-purple-400 bg-purple-500/20 hover:bg-purple-500/30 hover:text-purple-300"
                                                : "text-slate-400 hover:text-white hover:bg-slate-700"
                                        )}
                                        onClick={() => setIsImageMode(!isImageMode)}
                                        title={isImageMode ? "Switch to Chat mode" : "Switch to Image Generation mode"}
                                    >
                                        <Sparkles className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-700 h-8 w-8" onClick={() => setIsOpen(false)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 p-0 overflow-hidden bg-slate-900">
                                <ScrollArea className="h-full p-4">
                                    <div className="flex flex-col gap-4">
                                        {messages.map((msg, i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "flex items-start gap-2 max-w-[90%]",
                                                    msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-7 h-7 rounded flex items-center justify-center shrink-0 border mt-1",
                                                    msg.role === 'user' ? "bg-blue-600 border-blue-500" : "bg-emerald-600/20 border-emerald-500/30"
                                                )}>
                                                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} className="text-emerald-400" />}
                                                </div>
                                                <div className={cn(
                                                    "p-3 rounded-lg text-xs font-sans shadow-inner selection:bg-emerald-500/30",
                                                    msg.role === 'user'
                                                        ? "bg-slate-800 text-slate-200"
                                                        : "bg-slate-800/50 text-slate-300 border border-slate-700/50"
                                                )}>
                                                    {msg.image && (
                                                        <div className="mb-2 rounded overflow-hidden border border-slate-700">
                                                            <img src={msg.image} alt="User upload" className="max-w-full h-auto max-h-48 object-cover" />
                                                        </div>
                                                    )}
                                                    {msg.generatedImage && (
                                                        <div className="mb-2 rounded overflow-hidden border border-purple-500/50 bg-slate-950 p-1">
                                                            <img
                                                                src={msg.generatedImage}
                                                                alt="AI Generated"
                                                                className="max-w-full h-auto rounded"
                                                            />
                                                            <a
                                                                href={msg.generatedImage}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-[10px] text-purple-400 hover:text-purple-300 mt-1 block text-center"
                                                            >
                                                                Open full size ↗
                                                            </a>
                                                        </div>
                                                    )}
                                                    <div className="prose prose-invert prose-xs max-w-none prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800">
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                            {msg.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {isLoading && (
                                            <div className="flex items-start gap-2 max-w-[90%] mr-auto">
                                                <div className="w-7 h-7 rounded bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-1">
                                                    <Bot size={14} className="text-emerald-400" />
                                                </div>
                                                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 shadow-inner flex items-center gap-2">
                                                    <Loader2 className="h-3 w-3 animate-spin text-emerald-400" />
                                                    <span className="text-[10px] text-slate-500 font-mono">
                                                        {isImageMode ? 'GENERATING_IMAGE...' : 'PROCESSING_QUERY...'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </ScrollArea>
                            </CardContent>

                            <CardFooter className="p-4 border-t border-slate-800 bg-slate-900/50 flex flex-col gap-3">
                                {/* Image mode indicator with aspect ratio selector */}
                                {isImageMode && (
                                    <div className="w-full flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <Sparkles size={12} className="text-purple-400" />
                                            <span className="text-[10px] text-purple-400 font-mono">IMAGE_GEN_MODE</span>
                                        </div>
                                        <select
                                            value={aspectRatio}
                                            onChange={(e) => setAspectRatio(e.target.value)}
                                            className="text-[10px] bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        >
                                            {ASPECT_RATIOS.map(ratio => (
                                                <option key={ratio} value={ratio}>{ratio}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {selectedImage && (
                                    <div className="relative w-20 h-20 rounded border border-emerald-500/50 overflow-hidden bg-slate-950">
                                        <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => setSelectedImage(null)}
                                            className="absolute top-0.5 right-0.5 bg-slate-900/80 p-0.5 rounded-full text-white hover:text-red-400"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                )}
                                <div className="flex w-full items-center space-x-2">
                                    {!isImageMode && (
                                        <>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                ref={fileInputRef}
                                                onChange={handleImageSelect}
                                                className="hidden"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isLoading}
                                                className="h-9 w-9 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 border border-slate-800"
                                            >
                                                <ImageIcon className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                    <Input
                                        placeholder={isImageMode ? "Describe the image to generate..." : "Add saree context or ask a query..."}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                        disabled={isLoading}
                                        className={cn(
                                            "flex-1 bg-slate-950 border-slate-800 text-slate-200 text-xs font-mono h-9",
                                            isImageMode ? "focus-visible:ring-purple-500/50" : "focus-visible:ring-emerald-500/50"
                                        )}
                                    />
                                    <Button
                                        size="icon"
                                        onClick={handleSend}
                                        disabled={isLoading || (!input.trim() && !selectedImage)}
                                        className={cn(
                                            "h-9 w-9 text-white",
                                            isImageMode ? "bg-purple-600 hover:bg-purple-500" : "bg-emerald-600 hover:bg-emerald-500"
                                        )}
                                    >
                                        {isImageMode ? <Sparkles className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "bg-slate-900 text-emerald-400 p-4 rounded-full shadow-2xl flex items-center justify-center relative border border-slate-700 hover:bg-slate-800 transition-colors",
                    isOpen ? "bg-slate-800 border-emerald-500/50" : ""
                )}
            >
                {isOpen ? <X size={24} /> : (
                    <>
                        <Terminal size={24} />
                        <motion.div
                            className="absolute -top-0.5 -right-0.5 bg-emerald-500 w-3 h-3 rounded-full border-2 border-slate-900"
                            animate={{ opacity: [1, 0.4, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        />
                    </>
                )}
            </motion.button>
        </div>
    );
};

export default BackendAiAssistant;
