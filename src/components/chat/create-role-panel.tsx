'use client';

import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { AIRole, AVAILABLE_ICONS, TAG_COLORS, addCustomRole, removeCustomRole } from '@/lib/ai-roles';

interface CreateRoleProps {
  roles: AIRole[];
  onClose: () => void;
  onCreated: (roles: AIRole[]) => void;
}

export function CreateRolePanel({ roles, onClose, onCreated }: CreateRoleProps) {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🤖');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [showIcons, setShowIcons] = useState(false);

  const [allTags, setAllTags] = useState(['NSFW', 'Unfiltered', 'SFW', 'Creative', 'RP', 'Custom']);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addTag = () => {
    const t = customTag.trim();
    if (t && !allTags.includes(t)) {
      setAllTags((prev) => [...prev, t]);
      toggleTag(t);
      setCustomTag('');
    }
  };

  const handleCreate = () => {
    if (!name.trim() || !prompt.trim()) return;

    const colors = ['#D0BCFF', '#A8C7FA', '#CCC2DC', '#B8C0FF', '#F2B8B5', '#80CBC4', '#FF6B6B', '#FF9F43', '#FFA3D7'];
    const newRole: AIRole = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      icon: selectedIcon,
      color: colors[Math.floor(Math.random() * colors.length)],
      systemPrompt: prompt.trim(),
      tags: selectedTags.length > 0 ? selectedTags : ['Custom'],
      isCustom: true,
    };

    addCustomRole(newRole);
    onCreated([...roles, newRole]);
    onClose();
  };

  const handleDelete = (role: AIRole) => {
    removeCustomRole(role.id);
    onCreated(roles.filter((r) => r.id !== role.id));
  };

  return (
    <div className="flex flex-col h-full" style={{ background: '#1E1E1E' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4"
        style={{ height: 64, borderBottom: '1px solid #2B2B2B' }}
      >
        <span className="text-base font-medium" style={{ color: '#E6E1E5' }}>
          Roles
        </span>
        <button className="md-icon-btn" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Existing Custom Roles */}
        {roles.filter((r) => r.isCustom).length > 0 && (
          <div>
            <p className="text-xs font-medium uppercase mb-2" style={{ color: '#938F99', letterSpacing: '0.5px' }}>
              Custom Roles
            </p>
            <div className="space-y-2">
              {roles
                .filter((r) => r.isCustom)
                .map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-2xl"
                    style={{ background: '#2B2B2B' }}
                  >
                    <span className="text-lg">{role.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#E6E1E5' }}>
                        {role.name}
                      </p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {role.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                            style={{
                              background: `${TAG_COLORS[tag] || '#49454F'}20`,
                              color: TAG_COLORS[tag] || '#938F99',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      className="md-icon-btn"
                      style={{ width: 32, height: 32 }}
                      onClick={() => handleDelete(role)}
                      aria-label="Delete role"
                    >
                      <Trash2 size={14} style={{ color: '#F2B8B5' }} />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Create New Role Form */}
        <div>
          <p className="text-xs font-medium uppercase mb-3" style={{ color: '#938F99', letterSpacing: '0.5px' }}>
            Tạo Role Mới
          </p>

          {/* Icon Picker */}
          <div className="mb-4">
            <p className="text-xs mb-2" style={{ color: '#CAC4D0' }}>Chọn Icon</p>
            <button
              onClick={() => setShowIcons(!showIcons)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors"
              style={{ background: '#2B2B2B' }}
            >
              <span className="text-xl">{selectedIcon}</span>
              <span className="text-xs" style={{ color: '#938F99' }}>Đổi icon</span>
            </button>
            {showIcons && (
              <div
                className="grid grid-cols-8 gap-1 p-2 rounded-xl mt-2"
                style={{ background: '#2B2B2B' }}
              >
                {AVAILABLE_ICONS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => {
                      setSelectedIcon(icon);
                      setShowIcons(false);
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors text-lg"
                    style={{
                      background: icon === selectedIcon ? '#333333' : 'transparent',
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Name */}
          <div className="mb-4">
            <p className="text-xs mb-2" style={{ color: '#CAC4D0' }}>Tên Role</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Storyteller..."
              className="md-input-field"
              style={{ padding: '12px 16px', height: 44, borderRadius: 14 }}
            />
          </div>

          {/* Tags */}
          <div className="mb-4">
            <p className="text-xs mb-2" style={{ color: '#CAC4D0' }}>Tags</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: selectedTags.includes(tag)
                      ? `${TAG_COLORS[tag] || '#D0BCFF'}30`
                      : '#2B2B2B',
                    color: selectedTags.includes(tag)
                      ? TAG_COLORS[tag] || '#D0BCFF'
                      : '#938F99',
                    border: selectedTags.includes(tag)
                      ? `1px solid ${TAG_COLORS[tag] || '#D0BCFF'}40`
                      : '1px solid transparent',
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Tag mới..."
                className="md-input-field"
                style={{ padding: '8px 12px', height: 36, borderRadius: 18, fontSize: 12 }}
              />
              <button
                onClick={addTag}
                className="md-icon-btn"
                style={{ width: 36, height: 36, background: '#2B2B2B', marginBottom: 0 }}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* System Prompt */}
          <div className="mb-4">
            <p className="text-xs mb-2" style={{ color: '#CAC4D0' }}>System Prompt</p>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Hãy nhập system prompt cho role này. Bạn hoàn toàn tự do trong việc định nghĩa cách AI hành xử..."
              rows={4}
              className="md-input-field"
              style={{ padding: '12px 16px', height: 'auto', borderRadius: 14, minHeight: 100 }}
            />
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreate}
            disabled={!name.trim() || !prompt.trim()}
            className="md-filled-btn md-filled-primary w-full"
            style={{ height: 48, borderRadius: 24, opacity: name.trim() && prompt.trim() ? 1 : 0.4 }}
          >
            <Plus size={18} style={{ marginRight: 8 }} />
            Tạo Role
          </button>
        </div>
      </div>
    </div>
  );
}
