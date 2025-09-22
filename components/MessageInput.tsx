'use client';

import { useState, useRef, useEffect } from 'react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
}

export default function MessageInput({ onSendMessage, onTyping }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [images, setImages] = useState<{ name: string; file: File; preview: string }[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Upload images to S3 first (if any), then send URLs
    if (images.length > 0) {
      for (const img of images) {
        try {
          const signed = await signUpload(img.file.name, img.file.type);
          await fetch(signed.uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': img.file.type },
            body: img.file,
          });
          const publicBase = process.env.NEXT_PUBLIC_S3_PUBLIC_BASE || '';
          const url = publicBase
            ? `${publicBase.replace(/\/$/, '')}/${signed.key}`
            : `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${signed.key}`;
          onSendMessage(url);
        } catch (err) {
          console.error('Upload failed', err);
        }
      }
      setImages([]);
    }
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      handleStopTyping();
    }
    setShowEmoji(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Handle typing indicators
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 1000);
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      onTyping(false);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const addEmoji = (emoji: string) => {
    setMessage((m) => m + emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const onPickImages = async (files: FileList | null) => {
    if (!files) return;
    const picked: { name: string; file: File; preview: string }[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      const base64 = await toBase64(file);
      picked.push({ name: file.name, file, preview: base64 as string });
    }
    if (picked.length) setImages((prev) => [...prev, ...picked]);
  };

  const toBase64 = (file: File) =>
    new Promise<string | ArrayBuffer | null>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await onPickImages(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-white border-t border-gray-200 p-3">
      <form onSubmit={handleSubmit} className="flex items-center gap-2" onDrop={onDrop} onDragOver={onDragOver}>
        {/* Emoji & Attach buttons */}
        <div className="flex items-center gap-1 self-end pb-[2px]">
          <button
            type="button"
            onClick={() => setShowEmoji((s) => !s)}
            className="rounded-lg p-2 hover:bg-gray-100 text-gray-600"
            aria-label="Add emoji"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg p-2 hover:bg-gray-100 text-gray-600"
            aria-label="Attach image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828L18 9.828a4 4 0 10-5.657-5.657L6.343 10.172" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => onPickImages(e.target.files)}
          />
        </div>
        <div className="flex-1">
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="w-full resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent align-middle"
            rows={1}
            style={{
              minHeight: '40px',
              maxHeight: '120px',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 120) + 'px';
            }}
          />
          {/* Image previews */}
          {images.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border">
                  <img src={img.preview} alt={img.name} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 bg-white rounded-full shadow p-1"
                    onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                    aria-label="Remove image"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* Emoji picker */}
          {showEmoji && (
            <div className="mt-2 p-2 rounded-lg border bg-white shadow w-full max-w-[320px]">
              <div className="grid grid-cols-8 gap-1 text-xl">
                {['😀','😄','😁','😂','😊','😍','😘','😎','🤩','😇','🙂','😉','🙃','😋','😜','🤪','🤗','🤔','😴','😐','😑','😶','😭','😤','😡','👍','👎','🙏','👏','💯','🔥','✨','🎉','❤️','🫶','💙','💚','💛','🧡','💜','🤍','🤎'].map(e => (
                  <button key={e} type="button" className="hover:bg-gray-100 rounded" onClick={() => addEmoji(e)}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={!message.trim() && images.length === 0}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors self-end"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}

async function signUpload(name: string, type: string): Promise<{ key: string; uploadUrl: string }> {
  const res = await fetch('/api/uploads/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, type }),
  });
  if (!res.ok) throw new Error('Failed to sign upload');
  return res.json();
}
