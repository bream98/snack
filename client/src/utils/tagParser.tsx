import React from 'react';
import styled from 'styled-components';

const MemberTagBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background-color: ${({ theme }) => theme.colors.primary}20;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 13px;
  margin: 0 2px;
`;

const ChannelTagBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background-color: ${({ theme }) => theme.colors.secondary}20;
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 13px;
  margin: 0 2px;
`;

/**
 * Format string tag helpers
 */
export const formatMemberTag = (name: string, id: string) => `@${name}=${id}@`;
export const formatChannelTag = (name: string) => `@${name}`;

/**
 * Parses raw text containing member tags (@Name=id@) and channel tags (@channel / #name)
 * and turns them into styled React components.
 */
export function renderFormattedText(rawText: string): React.ReactNode {
  if (!rawText) return null;

  // Regex matching member tag (@Name=id@) and channel tag (@channel / #name)
  const tagRegex = /(@[^=@]+=[^@]+@|@channel|@[a-zA-Z0-9_-]+|#[a-zA-Z0-9_-]+)/g;
  const parts = rawText.split(tagRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // 1. Match Member Tag: @Name=id@
    const memberMatch = part.match(/^@([^=@]+)=([^@]+)@$/);
    if (memberMatch) {
      const name = memberMatch[1];
      const id = memberMatch[2];
      return (
        <MemberTagBadge key={index} title={`User ID: ${id}`}>
          @{name}
        </MemberTagBadge>
      );
    }

    // 2. Match Channel Tag: @channel or #name
    if (part === '@channel' || part.startsWith('#') || (part.startsWith('@') && !part.includes('='))) {
      return <ChannelTagBadge key={index}>{part}</ChannelTagBadge>;
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}
