import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useChannelChatStore } from '../../store/useChannelChatStore';
import { Button, Input } from '../../design-system';

export function NewChannelPage() {
  const [channelName, setChannelName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createChannel, error, clearError } = useChannelChatStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim()) return;

    setIsSubmitting(true);
    clearError();

    const newChannel = await createChannel(channelName.trim());
    setIsSubmitting(false);

    if (newChannel && newChannel.ID) {
      navigate(`/channel_message/${newChannel.ID}`);
    }
  };

  return (
    <Container>
      <Card>
        <Header>
          <Title>Tạo kênh mới</Title>
          <Subtitle>Tạo một kênh thảo luận mới cho nhóm của bạn</Subtitle>
        </Header>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="channelName">Tên kênh</Label>
            <Input
              id="channelName"
              type="text"
              placeholder="ví dụ: general, random, engineering"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              disabled={isSubmitting}
              autoFocus
              required
            />
          </FormGroup>

          <ButtonGroup>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting || !channelName.trim()}>
              {isSubmitting ? 'Đang tạo...' : 'Tạo kênh'}
            </Button>
          </ButtonGroup>
        </Form>
      </Card>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Card = styled.div`
  width: 100%;
  max-width: 480px;
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const Header = styled.div`
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const ErrorMessage = styled.div`
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #dc2626;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: ${({ theme }) => theme.radii.md};
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
`;
