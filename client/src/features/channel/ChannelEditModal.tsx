import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Users, UserPlus, LogOut, X, Search, Plus, Trash2 } from 'lucide-react';
import { useChannelChatStore } from '../../store/useChannelChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import type { UserDB } from '../../store/useDirectChatStore';
import { apiClient } from '../../services/apiClient';
import { toast } from '../../components/common/Toast';
import { Button, Input, Text } from '../../design-system';

interface ChannelEditModalProps {
  channelId: number;
  channelName: string;
  isOpen: boolean;
  onClose: () => void;
}

type ModalTab = 'members' | 'add_member' | 'leave';

export function ChannelEditModal({
  channelId,
  channelName,
  isOpen,
  onClose,
}: ChannelEditModalProps) {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const {
    membersByChannel,
    fetchChannelMembers,
    addChannelMember,
    removeChannelMember,
    isLoadingMembers,
  } = useChannelChatStore();

  const [activeTab, setActiveTab] = useState<ModalTab>('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserDB[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingUserId, setAddingUserId] = useState<number | null>(null);

  const members = membersByChannel[channelId] || [];

  useEffect(() => {
    if (isOpen && channelId) {
      fetchChannelMembers(channelId).catch(console.error);
    }
  }, [isOpen, channelId]);

  if (!isOpen) return null;

  /* Tim kiem user qua API GET /user/search?search=... */
  const handleSearchUsers = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await apiClient<UserDB[]>(
        `/user/search?search=${encodeURIComponent(searchQuery.trim())}`
      );
      setSearchResults(results || []);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tìm kiếm người dùng');
    } finally {
      setIsSearching(false);
    }
  };

  /* Them thanh vien vao channel */
  const handleAddMember = async (targetUser: UserDB) => {
    setAddingUserId(targetUser.ID);
    try {
      await addChannelMember(channelId, targetUser.ID);
      toast.success(`Đã thêm ${targetUser.display_name} vào kênh`);
      setSearchResults((prev) => prev.filter((u) => u.ID !== targetUser.ID));
    } catch (err: any) {
      toast.error(err.message || 'Không thể thêm thành viên');
    } finally {
      setAddingUserId(null);
    }
  };

  /* Xoa thanh vien khoi channel */
  const handleRemoveMember = async (targetUser: UserDB) => {
    if (!window.confirm(`Xóa ${targetUser.display_name} khỏi kênh?`)) return;
    try {
      await removeChannelMember(channelId, targetUser.ID);
      toast.success(`Đã xóa ${targetUser.display_name} khỏi kênh`);
    } catch (err: any) {
      toast.error(err.message || 'Không thể xóa thành viên');
    }
  };

  /* Roi khoi channel */
  const handleLeaveChannel = async () => {
    if (!currentUser) return;
    const currentId = Number((currentUser as any).id || (currentUser as any).ID);
    if (!currentId) return;

    if (!window.confirm(`Bạn có chắc chắn muốn rời kênh #${channelName}?`)) return;

    try {
      await removeChannelMember(channelId, currentId);
      toast.info(`Bạn đã rời kênh #${channelName}`);
      onClose();
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Không thể rời kênh');
    }
  };

  return (
    <Overlay onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <ModalHeader>
          <div>
            <ModalTitle># {channelName}</ModalTitle>
            <Text size="xs" colorVariant="secondary">
              Quản lý thông tin và thành viên kênh
            </Text>
          </div>
          <CloseButton onClick={onClose}>
            <X size={18} />
          </CloseButton>
        </ModalHeader>

        {/* 3 Main Action Buttons / Navigation Tabs */}
        <ActionBar>
          <TabButton
            $active={activeTab === 'members'}
            onClick={() => setActiveTab('members')}
          >
            <Users size={16} />
            <span>Channel member ({members.length})</span>
          </TabButton>

          <TabButton
            $active={activeTab === 'add_member'}
            onClick={() => setActiveTab('add_member')}
          >
            <UserPlus size={16} />
            <span>Add member</span>
          </TabButton>

          <TabButton
            $active={activeTab === 'leave'}
            $danger
            onClick={() => setActiveTab('leave')}
          >
            <LogOut size={16} />
            <span>Leave channel</span>
          </TabButton>
        </ActionBar>

        {/* Tab Content */}
        <ModalBody>
          {/* TAB 1: CHANNEL MEMBERS */}
          {activeTab === 'members' && (
            <SectionContainer>
              {isLoadingMembers ? (
                <Text size="sm" colorVariant="secondary">
                  Đang tải danh sách thành viên...
                </Text>
              ) : members.length === 0 ? (
                <Text size="sm" colorVariant="secondary">
                  Chưa có thành viên nào trong kênh.
                </Text>
              ) : (
                <UserList>
                  {members.map((member) => {
                    const currentId = Number((currentUser as any)?.id || (currentUser as any)?.ID);
                    return (
                      <UserRow key={member.ID}>
                        <UserInfo>
                          <Avatar>{member.display_name.charAt(0).toUpperCase()}</Avatar>
                          <div>
                            <Text size="sm" weight="bold">
                              {member.display_name}
                            </Text>
                            <Text size="xs" colorVariant="secondary">
                              {member.phone}
                            </Text>
                          </div>
                        </UserInfo>

                        {/* Nút xóa thành viên (nếu không phải là chính mình) */}
                        {currentId !== member.ID && (
                          <IconButton
                            title="Xóa khỏi kênh"
                            onClick={() => handleRemoveMember(member)}
                          >
                            <Trash2 size={16} color="#d93025" />
                          </IconButton>
                        )}
                      </UserRow>
                    );
                  })}
                </UserList>
              )}
            </SectionContainer>
          )}

          {/* TAB 2: ADD MEMBER */}
          {activeTab === 'add_member' && (
            <SectionContainer>
              <SearchForm onSubmit={handleSearchUsers}>
                <Input
                  type="text"
                  placeholder="Nhập sđt hoặc tên để tìm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 1 }}
                />
                <Button type="submit" disabled={isSearching}>
                  <Search size={16} />
                  <span>Tìm</span>
                </Button>
              </SearchForm>

              {isSearching ? (
                <Text size="sm" colorVariant="secondary">
                  Đang tìm kiếm...
                </Text>
              ) : (
                <UserList>
                  {searchResults.map((userItem) => {
                    const isAlreadyMember = members.some((m) => m.ID === userItem.ID);

                    return (
                      <UserRow key={userItem.ID}>
                        <UserInfo>
                          <Avatar>{userItem.display_name.charAt(0).toUpperCase()}</Avatar>
                          <div>
                            <Text size="sm" weight="bold">
                              {userItem.display_name}
                            </Text>
                            <Text size="xs" colorVariant="secondary">
                              {userItem.phone}
                            </Text>
                          </div>
                        </UserInfo>

                        {isAlreadyMember ? (
                          <Text size="xs" colorVariant="secondary">
                            Đã là thành viên
                          </Text>
                        ) : (
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={addingUserId === userItem.ID}
                            onClick={() => handleAddMember(userItem)}
                          >
                            <Plus size={14} />
                            <span>{addingUserId === userItem.ID ? 'Đang thêm...' : 'Thêm'}</span>
                          </Button>
                        )}
                      </UserRow>
                    );
                  })}
                </UserList>
              )}
            </SectionContainer>
          )}

          {/* TAB 3: LEAVE CHANNEL */}
          {activeTab === 'leave' && (
            <LeaveWarningBox>
              <Text size="sm" weight="semibold">
                Bạn có chắc chắn muốn rời khỏi kênh #{channelName}?
              </Text>
              <Text size="xs" colorVariant="secondary" style={{ marginTop: '4px' }}>
                Sau khi rời kênh, bạn sẽ không xem được các tin nhắn trong kênh này trừ khi được mời lại.
              </Text>

              <ConfirmLeaveButton onClick={handleLeaveChannel}>
                <LogOut size={16} />
                <span>Xác nhận rời kênh</span>
              </ConfirmLeaveButton>
            </LeaveWarningBox>
          )}
        </ModalBody>
      </ModalCard>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const ModalCard = styled.div`
  width: 100%;
  max-width: 480px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalFade 0.2s ease-out;

  @keyframes modalFade {
    from {
      opacity: 0;
      transform: scale(0.96);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const ActionBar = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background-color: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  overflow-x: auto;
`;

const TabButton = styled.button<{ $active?: boolean; $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 6px 12px;
  border-radius: 100px;
  border: none;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;

  background-color: ${({ $active, $danger, theme }) => {
    if (!$active) return 'transparent';
    return $danger ? `${theme.colors.danger}15` : theme.colors.primary;
  }};

  color: ${({ $active, $danger, theme }) => {
    if (!$active) return theme.colors.textSecondary;
    return $danger ? theme.colors.danger : '#ffffff';
  }};

  &:hover {
    background-color: ${({ $active, $danger, theme }) => {
      if ($active) return undefined;
      return $danger ? `${theme.colors.danger}15` : `${theme.colors.primary}15`;
    }};
  }
`;

const ModalBody = styled.div`
  padding: 1.25rem;
  min-height: 240px;
  max-height: 380px;
  overflow-y: auto;
`;

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 0.5rem;
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const UserRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;

  &:hover {
    background-color: rgba(217, 48, 37, 0.1);
  }
`;

const LeaveWarningBox = styled.div`
  padding: 1.25rem;
  border-radius: 8px;
  background-color: ${({ theme }) => `${theme.colors.danger}10`};
  border: 1px solid ${({ theme }) => `${theme.colors.danger}30`};
`;

const ConfirmLeaveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  margin-top: 1rem;
  padding: 0.625rem 1rem;
  border-radius: 100px;
  border: none;
  background-color: ${({ theme }) => theme.colors.danger};
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;
