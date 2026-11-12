'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, FileText, Trash2, Plus, Menu, X } from 'lucide-react'
import ChatSidebar from '@/components/ChatSidebar'
import ChatMessages from '@/components/ChatMessages'
import ChatInput from '@/components/ChatInput'
import Logo from '@/components/Logo'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Chat {
  id: string
  title: string
  messages: Message[]
  reportContext?: string
}

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const currentChat = chats.find(c => c.id === currentChatId)

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('healthlens-chats')
    if (saved) {
      const parsed = JSON.parse(saved)
      setChats(parsed.map((c: any) => ({
        ...c,
        messages: c.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
      })))
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('healthlens-chats', JSON.stringify(chats))
    }
  }, [chats])

  const createNewChat = (reportContext?: string) => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: reportContext ? 'Medical Report Analysis' : 'New Conversation',
      messages: [],
      reportContext,
    }
    setChats(prev => [newChat, ...prev])
    setCurrentChatId(newChat.id)
  }

  const deleteChat = (chatId: string) => {
    setChats(prev => prev.filter(c => c.id !== chatId))
    if (currentChatId === chatId) {
      const remaining = chats.filter(c => c.id !== chatId)
      setCurrentChatId(remaining[0]?.id || null)
    }
  }

  const sendMessage = async () => {
    if (!input.trim()) return
    
    if (!currentChatId) {
      createNewChat()
      return
    }

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setChats(prev => prev.map(chat => 
      chat.id === currentChatId 
        ? { ...chat, messages: [...chat.messages, userMessage] }
        : chat
    ))

    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          history: currentChat?.messages || [],
          reportContext: currentChat?.reportContext,
        }),
      })

      const data = await response.json()

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }

      setChats(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { 
              ...chat, 
              messages: [...chat.messages, assistantMessage],
              title: chat.messages.length === 0 ? input.slice(0, 30) + '...' : chat.title
            }
          : chat
      ))
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <ChatSidebar
        chats={chats}
        currentChatId={currentChatId}
        sidebarOpen={sidebarOpen}
        onNewChat={createNewChat}
        onSelectChat={setCurrentChatId}
        onDeleteChat={deleteChat}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center gap-4">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <Logo size="sm" />
        </div>

        {/* Messages */}
        <ChatMessages
          messages={currentChat?.messages || []}
          isLoading={isLoading}
        />

        {/* Input */}
        <ChatInput
          input={input}
          isLoading={isLoading}
          onInputChange={setInput}
          onSend={sendMessage}
          onNewChat={createNewChat}
        />
      </div>
    </div>
  )
}
