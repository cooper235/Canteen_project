'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { API_URL } from '@/lib/config'

interface Message {
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

export function useChatbot() {
    const { data: session } = useSession()
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [conversationId, setConversationId] = useState<string | null>(null)

    const sendMessage = async (message: string) => {
        if (!message.trim() || isLoading) return

        const userMessage: Message = {
            role: 'user',
            content: message.trim(),
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`${API_URL}/chatbot`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message.trim(),
                    userId: session?.user?.id,
                    conversationId: conversationId
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to get response')
            }

            if (data.conversationId) {
                setConversationId(data.conversationId)
            }

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.reply,
                timestamp: new Date()
            }

            setMessages(prev => [...prev, assistantMessage])
        } catch (err: any) {
            console.error('Chat error:', err)
            setError(err.message || 'Something went wrong')

            const errorMessage: Message = {
                role: 'assistant',
                content: "I'm sorry, I'm having trouble right now. Please try again! 🙏",
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    const clearChat = () => {
        setMessages([])
        setConversationId(null)
        setError(null)
    }

    return {
        messages,
        input,
        setInput,
        sendMessage,
        clearChat,
        isLoading,
        error
    }
}
