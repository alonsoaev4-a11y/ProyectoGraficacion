// ListaDinamica — lista de strings con botón "+" para añadir y "×" para eliminar
// Usada en: temas clave de entrevista, aspectos de observación, etc.

import { useState, KeyboardEvent } from 'react';
import { Plus, X } from 'lucide-react';

interface ListaDinamicaProps {
    items: string[];
    onChange: (items: string[]) => void;
    placeholder?: string;
    disabled?: boolean;
}

export const ListaDinamica = ({ items, onChange, placeholder = 'Escribe un tema...', disabled }: ListaDinamicaProps) => {
    const [inputValue, setInputValue] = useState('');

    const agregar = () => {
        const valor = inputValue.trim();
        if (valor && !items.includes(valor)) {
            onChange([...items, valor]);
            setInputValue('');
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            agregar();
        }
    };

    const eliminar = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
    };

    return (
        <div>
            {/* Lista de ítems existentes */}
            <div style={{ marginBottom: items.length > 0 ? '10px' : '0' }}>
                {items.map((item, index) => (
                    <div key={index} className="meta-lista-item">
                        <span>· {item}</span>
                        {!disabled && (
                            <button
                                type="button"
                                onClick={() => eliminar(index)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#b0b0c0',
                                    padding: '2px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    transition: 'color 0.15s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.color = '#d4183d')}
                                onMouseLeave={e => (e.currentTarget.style.color = '#b0b0c0')}
                                aria-label="Eliminar"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Input para añadir nuevo ítem */}
            {!disabled && (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="text"
                        className="cyber-input"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                    />
                    <button
                        type="button"
                        onClick={agregar}
                        className="cyber-btn-secondary"
                        style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                    >
                        <Plus size={14} />
                        Añadir
                    </button>
                </div>
            )}
        </div>
    );
};
