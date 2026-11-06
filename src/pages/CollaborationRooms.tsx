import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, FileText, PenTool, Users, Plus, Hash, Sparkles, Search, MoreVertical } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MOCK_ROOMS = [];


export default function CollaborationRooms() {
  const [activeRoom, setActiveRoom] = useState(MOCK_ROOMS[0]);
  const [activeTab, setActiveTab] = useState('chat');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!activeRoom) {
    return (
      <div className="flex-1 flex items-center justify-center h-[calc(100vh-4rem)] text-gray-500 bg-white dark:bg-[#0a0a0a]">
        No active rooms available.
      </div>
    );
  }

  const handleSendMessage = () => {
    if (!message.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: 'You', text: message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setMessage('');
  };

  const handleAIAssist = async () => {
    setIsGenerating(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Based on this chat history: ${messages.map(m => m.text).join(' ')}. Suggest a next step or action item for the team.`
      });
      setMessages([...messages, { id: Date.now(), sender: 'AI Assistant', text: response.text || '', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } catch (error) {
      console.error('AI Error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-white dark:bg-[#0a0a0a]">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-gray-50 dark:bg-[#141414]">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 dark:text-white">Rooms</h2>
          <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="p-2">
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search rooms..." 
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:border-[#ff4e00]"
            />
          </div>
          <div className="space-y-1">
            {MOCK_ROOMS.map(room => (
              <button
                key={room.id}
                onClick={() => setActiveRoom(room)}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                  activeRoom.id === room.id 
                    ? 'bg-[#ff4e00]/10 text-[#ff4e00] font-medium' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 opacity-50" />
                  <span className="truncate">{room.name}</span>
                </div>
                {room.unread > 0 && (
                  <span className="bg-[#ff4e00] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {room.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-14 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 bg-white dark:bg-[#141414] shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Hash className="w-5 h-5 text-gray-400" />
              {activeRoom.name}
            </h2>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Users className="w-3 h-3" /> {activeRoom.members}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141414] shrink-0">
            <TabsList className="bg-transparent h-auto p-0 flex gap-6">
              <TabsTrigger value="chat" className="pb-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:text-[#ff4e00] data-[state=active]:border-b-2 data-[state=active]:border-[#ff4e00] data-[state=active]:shadow-none text-gray-500 hover:text-gray-900 dark:hover:text-gray-300">
                <MessageSquare className="w-4 h-4 mr-2" /> Chat
              </TabsTrigger>
              <TabsTrigger value="docs" className="pb-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:text-[#ff4e00] data-[state=active]:border-b-2 data-[state=active]:border-[#ff4e00] data-[state=active]:shadow-none text-gray-500 hover:text-gray-900 dark:hover:text-gray-300">
                <FileText className="w-4 h-4 mr-2" /> Docs
              </TabsTrigger>
              <TabsTrigger value="board" className="pb-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:text-[#ff4e00] data-[state=active]:border-b-2 data-[state=active]:border-[#ff4e00] data-[state=active]:shadow-none text-gray-500 hover:text-gray-900 dark:hover:text-gray-300">
                <PenTool className="w-4 h-4 mr-2" /> Whiteboard
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden relative bg-gray-50 dark:bg-[#0a0a0a]">
            <TabsContent value="chat" className="m-0 h-full flex flex-col absolute inset-0">
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className={`text-xs font-bold ${msg.sender === 'AI Assistant' ? 'text-purple-500' : 'text-gray-900 dark:text-white'}`}>
                        {msg.sender}
                      </span>
                      <span className="text-[10px] text-gray-500">{msg.time}</span>
                    </div>
                    <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${
                      msg.sender === 'You' 
                        ? 'bg-[#ff4e00] text-white rounded-tr-none' 
                        : msg.sender === 'AI Assistant'
                        ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 rounded-tl-none'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-white dark:bg-[#141414] border-t border-gray-200 dark:border-gray-800 shrink-0">
                <div className="flex gap-2">
                  <button 
                    onClick={handleAIAssist}
                    disabled={isGenerating}
                    className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 transition-colors disabled:opacity-50"
                    title="AI Assist"
                  >
                    <Sparkles className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={`Message #${activeRoom.name}...`}
                    className="flex-1 bg-gray-100 dark:bg-gray-900 border-none rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4e00]/50"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-[#ff4e00] hover:bg-[#ff6a00] text-white rounded-xl font-medium text-sm transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="docs" className="m-0 h-full p-6 absolute inset-0 overflow-y-auto">
              <div className="max-w-3xl mx-auto bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-gray-800 p-8 min-h-full shadow-sm">
                <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-4">Project Outline</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">Collaborative document for {activeRoom.name}</p>
                
                <div className="prose dark:prose-invert max-w-none">
                  <h3>1. Introduction</h3>
                  <p>This document serves as the primary workspace for our team. We will outline our objectives, methodology, and expected outcomes here.</p>
                  
                  <h3>2. Objectives</h3>
                  <ul>
                    <li>Define the core problem statement.</li>
                    <li>Identify key stakeholders.</li>
                    <li>Develop a prototype solution.</li>
                  </ul>
                  
                  {/* Placeholder for rich text editor */}
                  <div className="mt-8 p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-center text-gray-500">
                    Rich text editor placeholder (e.g., TipTap or Quill)
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="board" className="m-0 h-full absolute inset-0 bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
              {/* Placeholder for Whiteboard */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <PenTool className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-500 font-medium">Interactive Whiteboard</p>
                  <p className="text-sm text-gray-400 mt-1">Draw, add sticky notes, and collaborate visually.</p>
                </div>
              </div>
              
              {/* Floating Toolbar */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-full shadow-lg p-2 flex gap-2">
                <button className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors">
                  <div className="w-4 h-4 border-2 border-gray-600 dark:border-gray-400 rounded-sm" />
                </button>
                <button className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors">
                  <div className="w-4 h-4 border-2 border-gray-600 dark:border-gray-400 rounded-full" />
                </button>
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 my-auto mx-1" />
                <button className="w-10 h-10 rounded-full bg-[#ff4e00]/10 text-[#ff4e00] flex items-center justify-center transition-colors">
                  <PenTool className="w-5 h-5" />
                </button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
