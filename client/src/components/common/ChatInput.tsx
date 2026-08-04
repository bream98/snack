import { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Card, Text, Button, Input } from '../../design-system';
import { useChatStore } from '../../store/useChatStore';
import { formatMemberTag, formatChannelTag } from '../../utils/tagParser';

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
`;

const SuggestionBox = styled(Card)`
  position: absolute;
  bottom: 45px;
  left: 0;
  width: 300px;
  max-height: 240px;
  overflow-y: auto;
  z-index: 9999;
  padding: 0.375rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

interface SuggestionItemProps {
  $isSelected?: boolean;
}

const SuggestionItem = styled.button<SuggestionItemProps>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.4rem 0.6rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
  text-align: left;
  border: none;
  background-color: ${({ $isSelected, theme }) =>
    $isSelected ? `${theme.colors.primary}20` : 'transparent'};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary}20;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export interface ChatInputProps {
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  buttonText?: string;
}

export function ChatInput({
  placeholder = 'Nhập tin nhắn... (Gõ @ để gắn thẻ thành viên/kênh)',
  value,
  onChange,
  onSubmit,
  buttonText = 'Gửi',
}: ChatInputProps) {
  const { members, channels } = useChatStore();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Combine members and channels into unified suggestion items
  const memberItems = members
    .filter((m) => m.display_name.toLowerCase().includes(filterQuery))
    .map((m) => ({
      type: 'member' as const,
      id: m.id,
      name: m.display_name,
      tagText: formatMemberTag(m.display_name, m.id),
    }));

  const channelItems = [
    { type: 'channel' as const, id: 'channel-all', name: 'channel', tagText: formatChannelTag('channel') },
    ...channels
      .filter((c) => c.name.toLowerCase().includes(filterQuery))
      .map((c) => ({ type: 'channel' as const, id: c.id, name: c.name, tagText: formatChannelTag(c.name) })),
  ];

  const allSuggestions = [...memberItems, ...channelItems];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);

    const cursorIndex = e.target.selectionStart || val.length;
    const textBeforeCursor = val.slice(0, cursorIndex);
    const lastAtPos = textBeforeCursor.lastIndexOf('@');

    if (lastAtPos !== -1 && lastAtPos >= textBeforeCursor.length - 15) {
      const query = textBeforeCursor.slice(lastAtPos + 1);
      setFilterQuery(query.toLowerCase());
      setShowSuggestions(true);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
    }
  };

  const insertTag = useCallback(
    (tagText: string) => {
      const cursorIndex = inputRef.current?.selectionStart || value.length;
      const textBeforeCursor = value.slice(0, cursorIndex);
      const textAfterCursor = value.slice(cursorIndex);
      const lastAtPos = textBeforeCursor.lastIndexOf('@');

      const prefix = value.slice(0, lastAtPos);
      const newValue = `${prefix}${tagText} ${textAfterCursor}`;
      onChange(newValue);
      setShowSuggestions(false);

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const newCursorPos = prefix.length + tagText.length + 1;
          inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 10);
    },
    [value, onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || allSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % allSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allSuggestions.length) % allSuggestions.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      const selected = allSuggestions[selectedIndex];
      if (selected) {
        insertTag(selected.tagText);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <InputContainer>
      <form onSubmit={onSubmit} style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Input
            ref={inputRef}
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />

          {showSuggestions && allSuggestions.length > 0 && (
            <SuggestionBox glass>
              {memberItems.length > 0 && (
                <>
                  <Text size="xs" weight="bold" colorVariant="secondary" style={{ padding: '2px 6px' }}>
                    THÀNH VIÊN (@Tên=id@)
                  </Text>
                  {memberItems.map((item, idx) => (
                    <SuggestionItem
                      key={item.id}
                      type="button"
                      $isSelected={idx === selectedIndex}
                      onClick={() => insertTag(item.tagText)}
                    >
                      <span>👤</span>
                      <span><strong>{item.name}</strong> (id: {item.id})</span>
                    </SuggestionItem>
                  ))}
                </>
              )}

              {channelItems.length > 0 && (
                <>
                  <Text size="xs" weight="bold" colorVariant="secondary" style={{ padding: '6px 6px 2px 6px' }}>
                    KÊNH CHÁT (@channel)
                  </Text>
                  {channelItems.map((item, idx) => {
                    const globalIdx = memberItems.length + idx;
                    return (
                      <SuggestionItem
                        key={item.id}
                        type="button"
                        $isSelected={globalIdx === selectedIndex}
                        onClick={() => insertTag(item.tagText)}
                      >
                        <span>📢</span>
                        <span>@{item.name}</span>
                      </SuggestionItem>
                    );
                  })}
                </>
              )}
            </SuggestionBox>
          )}
        </div>

        <Button variant="primary" type="submit">
          {buttonText}
        </Button>
      </form>
    </InputContainer>
  );
}
