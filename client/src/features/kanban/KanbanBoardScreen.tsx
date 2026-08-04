import { useState } from 'react';
import styled from 'styled-components';
import { useKanbanStore } from '../../store/useKanbanStore';
import type { Task } from '../../store/useKanbanStore';
import { Card, Button, Input, Heading, Text } from '../../design-system';

const BoardContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 1.5rem;
`;

const BoardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ColumnsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(220px, 1fr));
  gap: 1.25rem;
  overflow-x: auto;
  padding-bottom: 1rem;
  flex: 1;
`;

const ColumnContainer = styled(Card)`
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  min-height: 450px;
`;

const ColumnHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
`;

const TaskCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.875rem;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

interface PriorityBadgeProps {
  priority: Task['priority'];
  $priority?: Task['priority'];
}

const PriorityBadge = styled.span.attrs<PriorityBadgeProps>((props) => ({
  $priority: props.$priority ?? props.priority ?? 'medium',
}))<PriorityBadgeProps>`
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  width: fit-content;
  background-color: ${({ $priority = 'medium', theme }) =>
    $priority === 'high'
      ? theme.colors.danger + '20'
      : $priority === 'medium'
      ? theme.colors.warning + '20'
      : theme.colors.primary + '20'};
  color: ${({ $priority = 'medium', theme }) =>
    $priority === 'high'
      ? theme.colors.danger
      : $priority === 'medium'
      ? theme.colors.warning
      : theme.colors.primary};
`;

export function KanbanBoardScreen() {
  const { tasks, addTask, moveTask, deleteTask } = useKanbanStore();
  const [newTitle, setNewTitle] = useState('');

  const columns: { id: Task['status']; title: string; icon: string }[] = [
    { id: 'backlog', title: 'Backlog', icon: '📥' },
    { id: 'todo', title: 'To Do', icon: '📝' },
    { id: 'in_progress', title: 'In Progress', icon: '⚡' },
    { id: 'review', title: 'Review', icon: '🔍' },
    { id: 'done', title: 'Done', icon: '✅' },
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTask({
      title: newTitle,
      description: 'Thẻ công việc mới tạo từ Kanban Board',
      status: 'todo',
      priority: 'medium',
      assignee: 'Nam Luong',
    });
    setNewTitle('');
  };

  return (
    <BoardContainer>
      <BoardHeader>
        <div>
          <Heading size="2xl" weight="extrabold">
            📋 Project Kanban Board
          </Heading>
          <Text size="sm" colorVariant="secondary">
            Triết lý quản lý tiến độ trực quan theo từng cột trạng thái
          </Text>
        </div>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.5rem' }}>
          <Input
            placeholder="Tên công việc mới..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={{ width: '240px' }}
          />
          <Button variant="primary" type="submit">
            + Thêm Thẻ
          </Button>
        </form>
      </BoardHeader>

      <ColumnsGrid>
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          return (
            <ColumnContainer key={col.id}>
              <ColumnHeader>
                <Text weight="bold" size="sm">
                  {col.icon} {col.title} ({colTasks.length})
                </Text>
              </ColumnHeader>

              {colTasks.map((task) => (
                <TaskCard key={task.id} interactive>
                  <PriorityBadge priority={task.priority}>{task.priority}</PriorityBadge>
                  <Text weight="semibold" size="sm">
                    {task.title}
                  </Text>
                  <Text size="xs" colorVariant="secondary">
                    {task.description}
                  </Text>

                  {/* Move Task Action buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <Text size="xs" weight="medium" colorVariant="primary">
                      👤 {task.assignee}
                    </Text>

                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {col.id !== 'done' && (
                        <Button
                          variant="outline"
                          size="sm"
                          style={{ padding: '2px 6px', fontSize: '10px' }}
                          onClick={() => {
                            const nextMap: Record<Task['status'], Task['status']> = {
                              backlog: 'todo',
                              todo: 'in_progress',
                              in_progress: 'review',
                              review: 'done',
                              done: 'done',
                            };
                            moveTask(task.id, nextMap[col.id]);
                          }}
                        >
                          ▶ Next
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        style={{ padding: '2px 6px', fontSize: '10px', color: '#ef4444' }}
                        onClick={() => deleteTask(task.id)}
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                </TaskCard>
              ))}
            </ColumnContainer>
          );
        })}
      </ColumnsGrid>
    </BoardContainer>
  );
}
