import { useState, useRef, useEffect } from 'react';
import { EMOJI_CATEGORIES, type EmojiCategory } from '@/constants/emojis';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export const EmojiPicker = ({ onSelect, onClose }: EmojiPickerProps) => {
  const [activeCategory, setActiveCategory] = useState<EmojiCategory>('Smileys');
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-full right-0 mb-2 bg-ivory border border-stone rounded-xl shadow-lg w-72 overflow-hidden"
    >
      {/* Category tabs */}
      <div className="flex border-b border-stone overflow-x-auto scrollbar-thin">
        {(Object.keys(EMOJI_CATEGORIES) as EmojiCategory[]).map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === category
                ? 'text-navy border-b-2 border-navy bg-cream'
                : 'text-graphite hover:text-charcoal hover:bg-parchment'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div className="p-2 max-h-48 overflow-y-auto scrollbar-thin">
        <div className="grid grid-cols-8 gap-1">
          {EMOJI_CATEGORIES[activeCategory].map((emoji, index) => (
            <button
              key={index}
              onClick={() => {
                onSelect(emoji);
                onClose();
              }}
              className="w-8 h-8 flex items-center justify-center text-xl hover:bg-parchment rounded transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

