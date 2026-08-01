import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../common/Card/Card';
import { Send, Sparkles, Bot, User, Loader2, Trash2 } from 'lucide-react';
import { useAI } from '../../../context/AIContext';
import Button from '../../common/Button/Button';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const PRESET_PROMPTS = [
  "Придумай акцию для кофейни",
  "Как подключить Kaspi магазин?",
  "Напиши пост про акцию 2+1",
  "Скидка на повторный визит"
];

const AIChat = () => {
  const { messages, isTyping, sendMessage, clearHistory } = useAI();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    // Add a slight delay to allow markdown to render properly before scrolling
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isTyping) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  const handlePresetClick = (prompt) => {
    if (!isTyping) {
      sendMessage(prompt);
    }
  };

  return (
    <Card className="flex flex-col h-[600px] shadow-sm border-gray-200">
      <CardHeader className="bg-[var(--color-brand-blue)] text-white rounded-t-xl py-3 px-4 flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center text-base font-semibold">
          <Sparkles className="h-5 w-5 mr-2" />
          Serpin AI Assistant
        </CardTitle>
        <button 
          onClick={clearHistory}
          disabled={isTyping}
          className="text-blue-200 hover:text-white transition-colors disabled:opacity-50"
          title="Очистить историю чата"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-gray-50/50">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={twMerge(clsx(
                "flex gap-3 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              ))}
            >
              <div className={twMerge(clsx(
                "w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center",
                msg.role === 'user' ? "bg-gray-200 text-gray-700" : "bg-[var(--color-brand-blue)] text-white"
              ))}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              
              <div className={twMerge(clsx(
                "p-3 rounded-2xl text-sm leading-relaxed prose prose-sm max-w-none",
                msg.role === 'user' 
                  ? "bg-[var(--color-brand-blue)] text-white rounded-tr-none prose-invert" 
                  : "bg-white border border-gray-100 shadow-sm text-gray-800 rounded-tl-none prose-headings:mb-2 prose-p:mb-2 prose-p:last:mb-0"
              ))}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div 
              key="typing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex gap-3 max-w-[85%]"
            >
              <div className="w-8 h-8 flex-shrink-0 rounded-full bg-[var(--color-brand-blue)] text-white flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-none bg-white border border-gray-100 shadow-sm flex items-center">
                <Loader2 className="h-4 w-4 animate-spin text-[var(--color-brand-blue)]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="p-3 border-t border-gray-100 bg-white">
        <div className="flex flex-wrap gap-2 mb-3">
          <AnimatePresence>
            {!isTyping && PRESET_PROMPTS.map((prompt, idx) => (
              <motion.button 
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handlePresetClick(prompt)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-all duration-150 active:scale-95 whitespace-nowrap"
              >
                {prompt}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
        <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Спросите меня о чем угодно..."
            className="flex-1 bg-gray-100 border-none outline-none rounded-full py-2.5 pl-4 pr-12 text-sm focus:ring-2 focus:ring-[var(--color-brand-blue)] focus:bg-white transition-all duration-200"
            disabled={isTyping}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="absolute right-1 top-1 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-brand-blue)] text-white hover:bg-[var(--color-brand-blue-hover)] disabled:opacity-50 transition-all duration-150 active:scale-90"
          >
            <Send className="h-4 w-4 ml-0.5" />
          </button>
        </form>
      </div>
    </Card>
  );
};

export default AIChat;
