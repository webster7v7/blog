'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // 防止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSuccess = () => {
    onClose();
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
          />

          {/* 模态框 */}
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 overflow-y-auto pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md my-8 backdrop-blur-md bg-white/95 dark:bg-gray-900/95 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50 p-8 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 关闭按钮 */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110"
                aria-label="关闭"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>

              {/* 标题 */}
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-3">
                  {mode === 'login' ? '欢迎回来' : '加入 Webster'}
                </h2>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  {mode === 'login' ? '登录以继续探索精彩内容' : '创建账号开始你的创作旅程'}
                </p>
              </div>

              {/* 表单 */}
              {mode === 'login' ? (
                <LoginForm
                  onSuccess={handleSuccess}
                  onSwitchToSignUp={() => setMode('signup')}
                />
              ) : (
                <SignUpForm
                  onSuccess={handleSuccess}
                  onSwitchToLogin={() => setMode('login')}
                />
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  // 使用 Portal 渲染到 body，避免被父组件层叠上下文影响
  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}

