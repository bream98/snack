import styled from "styled-components";
import {useChatStore} from "../../store/useChatStore.ts";
import {useEffect} from "react";
import {useAuthStore} from "../../store/useAuthStore.ts";
import {NavLink} from "react-router-dom";

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
    const directChannels = useChatStore(state => state.directChannels)
    const fetchDirectChannels = useChatStore(state => state.fetchDirectChannels)
    const {user} = useAuthStore()

    useEffect(() => {
        fetchDirectChannels().catch(console.error)
    }, [])

    return (
    <SidebarSection>
        <div>
            <h3>Direct Message</h3>
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
    )
}

const DirectChannel = styled.div`
    padding: 0.75rem 1rem;
    font-size: 1rem;
    &:hover {
        background: lightsteelblue;
    }
`