import styled, { css } from 'styled-components';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import { MainboardRouter } from '../../features/mainboard/MainboardRouter';
import { BranchPanel } from '../../features/chat/BranchPanel';
import { UserProfileSection } from '../../features/profile/UserProfileSection';
import { useNavigationStore } from '../../store/useNavigationStore';
import { useChatStore } from '../../store/useChatStore';

const DashboardGrid = styled.div<{ $isSidebarOpen: boolean; $hasSubContent: boolean; $branchWidth: number }>`
  display: grid;
  grid-template-rows: 52px 1fr;
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
  gap: ${({ $isSidebarOpen }) => ($isSidebarOpen ? '0.375rem' : '0rem 0.375rem')};
  width: 100vw;
  height: 100vh;
  padding: 0.375rem;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? theme.colors.background
      : 'linear-gradient(135deg, #cbd5e1 0%, #e2e8f0 40%, #e0e7ff 100%)'};
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
  height: 52px;
`;

const SidebarArea = styled.div<{ $isSidebarOpen: boolean }>`
  grid-area: sidebar;
  height: 100%;
  overflow: hidden;
  display: ${({ $isSidebarOpen }) => ($isSidebarOpen ? 'block' : 'none')};
`;

const MainboardArea = styled.div<{ $isSidebarOpen: boolean }>`
  grid-area: mainboard;
  height: 100%;
  overflow: hidden;

  @media (max-width: 768px) {
    display: ${({ $isSidebarOpen }) => ($isSidebarOpen ? 'none' : 'block')};
  }
`;

const SubContentArea = styled.div`
  grid-area: subcontent;
  height: 100%;
  overflow: hidden;

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
