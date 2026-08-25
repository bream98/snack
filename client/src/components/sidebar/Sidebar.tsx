import styled from "styled-components";
import { useDirectChatStore } from "../../store/useDirectChatStore.ts";
import { useChannelChatStore } from "../../store/useChannelChatStore.ts";
import { useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore.ts";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "../../design-system";

const SidebarSection = styled.aside`
  grid-area: sidebar;
  background-color: ${({ theme }) =>
    theme.mode === 'dark' ? theme.colors.surface : theme.colors.background};
  border-right: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 768px) {
    display: none;
  }
`;

export default function Sidebar() {
  const directChannels = useDirectChatStore((state) => state.directChannels);
  const fetchDirectChannels = useDirectChatStore((state) => state.fetchDirectChannels);

  const channels = useChannelChatStore((state) => state.channels);
  const fetchChannels = useChannelChatStore((state) => state.fetchChannels);

  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDirectChannels().catch(console.error);
    fetchChannels().catch(console.error);
  }, []);

  return (
    <SidebarSection>
      <Box>
        <Button onClick={() => navigate('/channels/new')}>New</Button>
      </Box>

      <div>
        <Title>Channels</Title>
        {channels.map((item) => {
          const ch = item.channel;
          return (
            <NavLink
              key={ch.ID}
              to={`/channel_message/${ch.ID}`}
              style={({ isActive }) => ({
                textDecoration: 'none',
                display: 'block',
                fontWeight: isActive ? 'bold' : 'normal',
              })}
            >
              <ChannelItem># {ch.name}</ChannelItem>
            </NavLink>
          );
        })}
      </div>

      <div>
        <Title>Direct Message</Title>
        {directChannels.map((item) => {
          const ch = item.channel;
          const peerUser = user?.ID !== ch.user_id_1 ? ch.user_1 : ch.user_2;
          const peerId = user?.ID !== ch.user_id_1 ? ch.user_id_1 : ch.user_id_2;
          return (
            <NavLink
              key={ch.ID}
              to={`/direct-message/${peerId}?channelId=${ch.ID}`}
              style={({ isActive }) => ({
                textDecoration: 'none',
                display: 'block',
                fontWeight: isActive ? 'bold' : 'normal',
              })}
            >
              <DirectChannel>
                {peerUser?.display_name || `User #${peerId}`}
              </DirectChannel>
            </NavLink>
          );
        })}
      </div>
    </SidebarSection>
  );
}

const ChannelItem = styled.div`
  padding: 0.75rem 1rem;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
  &:hover {
    background: ${({ theme }) => theme.colors.borderGlass || 'lightsteelblue'};
  }
`;

const DirectChannel = styled.div`
  padding: 0.75rem 1rem;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
  &:hover {
    background: ${({ theme }) => theme.colors.borderGlass || 'lightsteelblue'};
  }
`;

const Title = styled.div`
  padding: 1rem;
  font-size: 1.25rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

const Box = styled.div`
  padding: 1rem;
`;