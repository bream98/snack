import { useParams } from 'react-router-dom';

export function ChannelMessagePage() {
  const { channelId } = useParams<{ channelId: string }>();

  return <div data-channel-id={channelId} />;
}
