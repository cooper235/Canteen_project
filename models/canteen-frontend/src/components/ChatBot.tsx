'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Trash2, Sparkles } from 'lucide-react'
import { useChatbot } from '@/hooks/useChatbot'

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const { messages, input, setInput, sendMessage, clearChat, isLoading } = useChatbot()

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (input.trim() && !isLoading) {
            sendMessage(input)
        }
    }

    const handleClearChat = () => {
        if (confirm('Are you sure you want to clear this conversation?')) {
            clearChat()
        }
    }

    return (
        <>
            {/* Floating Chat Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-full p-4 shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <div className="relative">
                        <MessageCircle className="w-6 h-6" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                    </div>
                )}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 left-6 z-50 w-[380px] h-[600px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    <div>
                                        <h3 className="font-bold text-lg">CanteenBot</h3>
                                        <p className="text-xs text-amber-100">AI Canteen Assistant</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClearChat}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                    title="Clear conversation"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
                            {messages.length === 0 && (
                                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                                    <Sparkles className="w-12 h-12 mx-auto mb-3 text-amber-500" />
                                    <p className="font-medium mb-2">Hi! I'm CanteenBot 👋</p>
                                    <p className="text-sm">
                                        Ask me about dishes, canteens, or get personalized recommendations!
                                    </p>
                                    <div className="mt-4 space-y-2">
                                        <button
                                            onClick={() => sendMessage("What vegetarian dishes are available?")}
                                            className="block w-full text-left px-3 py-2 text-sm bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            🌱 What vegetarian dishes are available?
                                        </button>
                                        <button
                                            onClick={() => sendMessage("Show me the cheapest lunch options")}
                                            className="block w-full text-left px-3 py-2 text-sm bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            💰 Show me the cheapest lunch options
                                        </button>
                                        <button
                                            onClick={() => sendMessage("What do you recommend?")}
                                            className="block w-full text-left px-3 py-2 text-sm bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            ⭐ What do you recommend?
                                        </button>
                                    </div>
                                </div>
                            )}

                            {messages.map((message, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                            ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white'
                                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-md'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                        <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-amber-100' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {message.timestamp.toLocaleTimeString('en-IN', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-md">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                            <div className="flex items-center gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask me anything..."
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="p-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:shadow-lg hover:shadow-amber-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
