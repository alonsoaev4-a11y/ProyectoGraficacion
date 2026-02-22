// TagInput — chips/tags editables con Enter
// El usuario escribe un valor y presiona Enter para añadirlo como chip

import { useState, KeyboardEvent, useRef } from 'react';

interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
    disabled?: boolean;
}

export const TagInput = ({ tags, onChange, placeholder = 'Escribe y presiona Enter', disabled }: TagInputProps) => {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const agregarTag = () => {
        const valor = inputValue.trim();
        if (valor && !tags.includes(valor)) {
            onChange([...tags, valor]);
        }
        setInputValue('');
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            agregarTag();
        }
        // Eliminar el último tag con Backspace si el input está vacío
        if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
            onChange(tags.slice(0, -1));
        }
    };

    const eliminarTag = (tag: string) => {
        onChange(tags.filter(t => t !== tag));
    };

    return (
        <div
            className="meta-tag-input-container"
            onClick={() => inputRef.current?.focus()}
        >
            {tags.map(tag => (
                <span key={tag} className="meta-tag">
                    {tag}
                    {!disabled && (
                        <button
                            type="button"
                            className="meta-tag-remove"
                            onClick={(e) => { e.stopPropagation(); eliminarTag(tag); }}
                            aria-label={`Eliminar ${tag}`}
                        >
                            ×
                        </button>
                    )}
                </span>
            ))}
            {!disabled && (
                <input
                    ref={inputRef}
                    type="text"
                    className="meta-tag-text-input"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={agregarTag}
                    placeholder={tags.length === 0 ? placeholder : ''}
                />
            )}
        </div>
    );
};
