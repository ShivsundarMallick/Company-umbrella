import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { X, ChevronDown, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';

interface MultiSelectProps {
  label?: string;
  error?: string;
  hint?: string;
  suggestions: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  allowCustom?: boolean;
  maxItems?: number;
}

export default function MultiSelect({
  label,
  error,
  hint,
  suggestions,
  value,
  onChange,
  placeholder = 'Type to add...',
  allowCustom = true,
  maxItems,
}: MultiSelectProps) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Filter suggestions: exclude already selected, filter by input
    const filtered = suggestions.filter(
      (s) =>
        !value.some((v) => v.toLowerCase() === s.toLowerCase()) &&
        s.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredSuggestions(filtered);
  }, [inputValue, suggestions, value]);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addItem = (item: string) => {
    const trimmed = item.trim();
    if (!trimmed) return;
    if (maxItems && value.length >= maxItems) return;
    if (value.some((v) => v.toLowerCase() === trimmed.toLowerCase())) return;

    onChange([...value, trimmed]);
    setInputValue('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const removeItem = (item: string) => {
    onChange(value.filter((v) => v !== item));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim() && allowCustom) {
        addItem(inputValue);
      } else if (filteredSuggestions.length > 0) {
        addItem(filteredSuggestions[0]);
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeItem(value[value.length - 1]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  const showNewOption =
    allowCustom &&
    inputValue.trim() &&
    !suggestions.some((s) => s.toLowerCase() === inputValue.toLowerCase()) &&
    !value.some((v) => v.toLowerCase() === inputValue.toLowerCase());

  const canAddMore = !maxItems || value.length < maxItems;

  return (
    <div className="w-full relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      {/* Selected items container */}
      <div
        className={cn(
          'min-h-10 w-full rounded-md border bg-white px-2 py-1.5',
          'focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent',
          error ? 'border-red-500 focus-within:ring-red-500' : 'border-gray-300'
        )}
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex flex-wrap gap-1.5 items-center">
          {/* Selected tags */}
          {value.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 text-primary-700 text-sm rounded-md"
            >
              {item}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeItem(item);
                }}
                className="hover:bg-primary-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {/* Input field */}
          {canAddMore && (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={value.length === 0 ? placeholder : ''}
              className="flex-1 min-w-[120px] outline-none text-sm py-1 bg-transparent"
            />
          )}

          {/* Dropdown arrow */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', isOpen && 'rotate-180')} />
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && canAddMore && (filteredSuggestions.length > 0 || showNewOption) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {showNewOption && (
            <button
              type="button"
              onClick={() => addItem(inputValue)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-primary-50 text-primary-600 border-b border-gray-100 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create "{inputValue.trim()}"
            </button>
          )}
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addItem(suggestion)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {maxItems && (
        <p className="mt-1 text-xs text-gray-400">
          {value.length}/{maxItems} selected
        </p>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
    </div>
  );
}
