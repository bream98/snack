import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { ChevronDownIcon } from 'lucide-react';
import { useChannelChatStore } from '../../store/useChannelChatStore';
import { ChannelEditModal } from '../channel/ChannelEditModal';
import MessageInput from "../../components/message/MessageInput.tsx";

export function ChannelMessagePage() {
  const { channelId } = useParams<{ channelId: string }>();
  const { channels } = useChannelChatStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const channel = useMemo(() => {
    return channels.find((ch) => ch.channel.ID === Number(channelId));
  }, [channels, channelId]);

  if (!channel) {
    return <NotFoundContainer>Channel not found</NotFoundContainer>;
  }

  return (
    <PageContainer>
      {/* Header Bar */}
      <HeaderBar>
        <ChannelTitleBtn onClick={() => setIsModalOpen(true)}>
          <ChannelTitle># {channel.channel.name}</ChannelTitle>
          <ChevronDownIcon size={18} />
        </ChannelTitleBtn>
      </HeaderBar>

      {/* Main Messages Body */}
      <MessageBody>
        {/* User can build messages list here */}
      </MessageBody>

      {/* Channel Edit Modal */}
      <ChannelEditModal
        channelId={channel.channel.ID}
        channelName={channel.channel.name}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

        <MessageInput message="" setMessage={() => {}} send={() => {}} />
    </PageContainer>
  );
}

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const HeaderBar = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ChannelTitleBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.radii.pill};
  color: ${({ theme }) => theme.colors.text};

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

const ChannelTitle = styled.h1`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
`;

const MessageBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
`;

const NotFoundContainer = styled.div`
  padding: 2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
