import styled, { css } from 'styled-components';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import { MainboardRouter } from '../../features/mainboard/MainboardRouter';
import { BranchPanel } from '../../features/chat/BranchPanel';
import { UserProfileSection } from '../../features/profile/UserProfileSection';
import { useNavigationStore } from '../../store/useNavigationStore';
import { useChatStore } from '../../store/useChatStore';

/* Color-Defined Borderless Layout (Zero borders, boundaries defined by color tone contrast) */
const DashboardGrid = styled.div<{ $isSidebarOpen: boolean; $hasSubContent: boolean; $branchWidth: number }>`
  display: grid;
  grid-template-rows: 56px 1fr;
  grid-template-columns: ${({ $isSidebarOpen, $hasSubContent, $branchWidth }) => {
    if (!$isSidebarOpen) {
      return $hasSubContent ? `0px 1fr ${$branchWidth}px` : '0px 1fr';
    }
    return $hasSubContent ? `240px 1fr ${$branchWidth}px` : '240px 1fr';
  }};
  grid-template-areas: ${({ $isSidebarOpen, $hasSubContent }) => {
    if (!$isSidebarOpen) {
      return $hasSubContent
        ? `'topbar topbar topbar' '. mainboard subcontent'`
        : `'topbar topbar' '. mainboard'`;
    }
    return $hasSubContent
      ? `'topbar topbar topbar' 'sidebar mainboard subcontent'`
      : `'topbar topbar' 'sidebar mainboard'`;
  }};
  gap: 0;
  width: 100vw;
  height: 100vh;
  min-height: 480px;
  padding: 0;
  background-color: ${({ theme }) => theme.colors.background};
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-areas:
      'topbar'
      'mainboard';

    ${({ $isSidebarOpen }) =>
      $isSidebarOpen &&
      css`
        grid-template-areas:
          'topbar'
          'sidebar';
      `}
  }
`;

const TopbarArea = styled.div`
  grid-area: topbar;
  height: 56px;
  min-height: 56px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 0;
`;

const SidebarArea = styled.div<{ $isSidebarOpen: boolean }>`
  grid-area: sidebar;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  display: ${({ $isSidebarOpen }) => ($isSidebarOpen ? 'block' : 'none')};
  background-color: ${({ theme }) =>
    theme.mode === 'dark' ? theme.colors.surface : theme.colors.background};
  border-radius: 0;
`;

const MainboardArea = styled.div<{ $isSidebarOpen: boolean }>`
  grid-area: mainboard;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 0;

  @media (max-width: 768px) {
    display: ${({ $isSidebarOpen }) => ($isSidebarOpen ? 'none' : 'block')};
  }
`;

const SubContentArea = styled.div`
  grid-area: subcontent;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background-color: ${({ theme }) =>
    theme.mode === 'dark' ? theme.colors.surface : theme.colors.background};
  border-radius: 0;

  @media (max-width: 1024px) {
    display: none;
  }
`;

export function DashboardLayout() {
  const { isSidebarOpen } = useNavigationStore();
  const {
    messages,
    activeSubContent,
    branchWidth,
    closeSubContent,
    sendBranchReply,
    toggleReaction,
    editMessage,
    recallMessage,
  } = useChatStore();

  // Handle Branch data resolution if activeSubContent is branch
  let activeBranchParentMsg = null;
  let activeTargetId = '';

  if (activeSubContent?.type === 'branch' && activeSubContent.data?.messageId) {
    const targetMsgId = activeSubContent.data.messageId;
    for (const [targetId, msgList] of Object.entries(messages)) {
      const found = msgList.find((m) => m.id === targetMsgId);
      if (found) {
        activeBranchParentMsg = found;
        activeTargetId = targetId;
        break;
      }
    }
  }

  const hasSubContent = !!(
    (activeSubContent?.type === 'branch' && activeBranchParentMsg) ||
    (activeSubContent?.type === 'userProfile' && activeSubContent.data?.user)
  );

  return (
    <DashboardGrid
      $isSidebarOpen={isSidebarOpen}
      $hasSubContent={hasSubContent}
      $branchWidth={branchWidth}
    >
      <TopbarArea>
        <Topbar />
      </TopbarArea>
      <SidebarArea $isSidebarOpen={isSidebarOpen}>
        <Sidebar />
      </SidebarArea>
      <MainboardArea $isSidebarOpen={isSidebarOpen}>
        <MainboardRouter />
      </MainboardArea>

      {/* 📌 SUBCONTENT AREA */}
      {hasSubContent && (
        <SubContentArea>
          {activeSubContent?.type === 'branch' && activeBranchParentMsg && (
            <BranchPanel
              parentMessage={activeBranchParentMsg}
              onClose={closeSubContent}
              onSendReply={(replyText) =>
                sendBranchReply(activeTargetId, activeBranchParentMsg!.id, replyText)
              }
              onAddReaction={(msgId, emoji) => toggleReaction(activeTargetId, msgId, emoji)}
              onEditMessage={(msgId, newText) => editMessage(activeTargetId, msgId, newText)}
              onRecallMessage={(msgId) => recallMessage(activeTargetId, msgId)}
            />
          )}

          {activeSubContent?.type === 'userProfile' && activeSubContent.data?.user && (
            <UserProfileSection
              user={activeSubContent.data.user}
              onClose={closeSubContent}
            />
          )}
        </SubContentArea>
      )}
    </DashboardGrid>
  );
}
