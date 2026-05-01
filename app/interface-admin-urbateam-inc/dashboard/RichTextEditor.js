'use client';

import { useRef, useEffect, useState } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon, Unlink, Type, AlignLeft, AlignCenter, AlignRight, Image as ImageIcon, ChevronDown, Trash2 } from 'lucide-react';

export default function RichTextEditor({ value, onChange, placeholder, onImageUpload }) {
  const editorRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      if (value === '' && editorRef.current.innerHTML === '<br>') return;
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    handleInput();
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const addLink = () => {
    const url = prompt('Entrez l\'URL du lien :');
    if (url) execCommand('createLink', url);
  };

  const handleImageClick = (e) => {
    if (e.target.tagName === 'IMG') {
      if (selectedImage) selectedImage.style.outline = 'none';
      const img = e.target;
      img.style.outline = '3px solid var(--primary-color)';
      img.style.outlineOffset = '2px';
      setSelectedImage(img);
    } else {
      if (selectedImage) selectedImage.style.outline = 'none';
      setSelectedImage(null);
    }
  };

  const insertImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const url = await onImageUpload(file);
      if (url) {
        editorRef.current.focus();
        const img = `<img src="${url}" style="max-width: 100%; height: auto; border-radius: 12px; margin: 1rem 0; display: block; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />`;
        execCommand('insertHTML', img + '<p><br></p>');
      }
    };
    input.click();
  };

  const changeImageSize = (size) => {
    if (selectedImage) {
      selectedImage.style.width = size;
      handleInput();
    }
  };

  if (!isMounted) return null;

  return (
    <div style={{ 
      border: '1px solid #e2e8f0', 
      borderRadius: '12px', 
      overflow: 'hidden',
      backgroundColor: 'white',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
    }}>
      {/* Toolbar */}
      <div style={{ 
        display: 'flex', 
        gap: '0.4rem', 
        padding: '0.6rem', 
        backgroundColor: '#f8fafc', 
        borderBottom: '1px solid #e2e8f0',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '0.2rem', backgroundColor: 'white', padding: '2px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <ToolbarButton onClick={() => execCommand('bold')} icon={<Bold size={16} />} title="Gras" />
          <ToolbarButton onClick={() => execCommand('italic')} icon={<Italic size={16} />} title="Italique" />
          <ToolbarButton onClick={() => execCommand('underline')} icon={<Underline size={16} />} title="Souligné" />
        </div>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0', margin: '0 0.2rem' }} />

        <div style={{ display: 'flex', gap: '0.2rem', backgroundColor: 'white', padding: '2px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <ToolbarButton onClick={() => execCommand('insertUnorderedList')} icon={<List size={16} />} title="Liste à puces" />
          <ToolbarButton onClick={() => execCommand('insertOrderedList')} icon={<ListOrdered size={16} />} title="Liste numérotée" />
        </div>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0', margin: '0 0.2rem' }} />

        <div style={{ display: 'flex', gap: '0.2rem', backgroundColor: 'white', padding: '2px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <ToolbarButton onClick={addLink} icon={<LinkIcon size={16} />} title="Lien" />
          <ToolbarButton onClick={() => execCommand('unlink')} icon={<Unlink size={16} />} title="Supprimer lien" />
        </div>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0', margin: '0 0.2rem' }} />

        <div style={{ display: 'flex', gap: '0.2rem', backgroundColor: 'white', padding: '2px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <ToolbarButton onClick={() => execCommand('justifyLeft')} icon={<AlignLeft size={16} />} title="Gauche" />
          <ToolbarButton onClick={() => execCommand('justifyCenter')} icon={<AlignCenter size={16} />} title="Centre" />
        </div>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0', margin: '0 0.2rem' }} />

        {/* Headlines */}
        <select 
          onChange={(e) => execCommand('formatBlock', e.target.value)}
          style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem', fontWeight: '600', outline: 'none' }}
        >
          <option value="p">Texte normal</option>
          <option value="h2">Titre 2</option>
          <option value="h3">Titre 3</option>
          <option value="h4">Titre 4</option>
        </select>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0', margin: '0 0.2rem' }} />

        {/* Colors */}
        <div style={{ display: 'flex', gap: '0.3rem', padding: '0.2rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <button type="button" onClick={() => execCommand('foreColor', '#79a081')} style={{ width: '20px', height: '20px', backgroundColor: '#79a081', border: 'none', borderRadius: '4px', cursor: 'pointer' }} />
          <button type="button" onClick={() => execCommand('foreColor', '#3c3c3c')} style={{ width: '20px', height: '20px', backgroundColor: '#3c3c3c', border: 'none', borderRadius: '4px', cursor: 'pointer' }} />
          <input type="color" onChange={(e) => execCommand('foreColor', e.target.value)} style={{ width: '20px', height: '20px', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} />
        </div>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0', margin: '0 0.2rem' }} />

        {/* Image Actions */}
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <button 
            type="button" 
            onClick={insertImage}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              padding: '0.4rem 0.8rem', 
              backgroundColor: 'var(--primary-color)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              fontSize: '0.8rem', 
              fontWeight: '600',
              cursor: 'pointer' 
            }}
          >
            <ImageIcon size={14} /> Insérer Image
          </button>

          {selectedImage && (
            <div style={{ display: 'flex', gap: '0.2rem', backgroundColor: '#f1f5f9', padding: '2px', borderRadius: '6px' }}>
              <button type="button" onClick={() => changeImageSize('33%')} style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', border: 'none', background: 'none', cursor: 'pointer' }}>Petit</button>
              <button type="button" onClick={() => changeImageSize('66%')} style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', border: 'none', background: 'none', cursor: 'pointer' }}>Moyen</button>
              <button type="button" onClick={() => changeImageSize('100%')} style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', border: 'none', background: 'none', cursor: 'pointer' }}>Large</button>
              <button type="button" onClick={() => { selectedImage.remove(); setSelectedImage(null); handleInput(); }} style={{ padding: '0.3rem 0.6rem', color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}><Trash2 size={14} /></button>
            </div>
          )}
        </div>
      </div>

      {/* Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onClick={handleImageClick}
        placeholder={placeholder}
        style={{
          minHeight: '400px',
          padding: '2rem',
          outline: 'none',
          fontSize: '1.05rem',
          lineHeight: '1.7',
          color: '#334155',
          backgroundColor: '#fff'
        }}
      />
      
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(placeholder);
          color: #94a3b8;
          cursor: text;
        }
        [contenteditable] h2 { font-size: 1.8rem; margin-top: 2rem; margin-bottom: 1rem; color: var(--secondary-color); font-family: var(--font-righteous); }
        [contenteditable] h3 { font-size: 1.4rem; margin-top: 1.5rem; margin-bottom: 0.8rem; color: var(--secondary-color); font-family: var(--font-righteous); }
        [contenteditable] ul, [contenteditable] ol { padding-left: 1.5rem; margin-bottom: 1.2rem; }
        [contenteditable] li { margin-bottom: 0.5rem; }
        [contenteditable] a { color: var(--primary-color); text-decoration: underline; font-weight: 600; }
        [contenteditable] img { transition: outline 0.2s ease; cursor: pointer; }
      `}</style>
    </div>
  );
}

function ToolbarButton({ onClick, icon, title }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: '6px',
        border: 'none',
        backgroundColor: 'transparent',
        color: '#475569',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      {icon}
    </button>
  );
}
