import {useEffect, useRef, useState} from "react";
import styled from "styled-components";
import {Button, Input} from "../../design-system";


export const Test = () => {
    const [message, setMessage] = useState('');
    const wsRef = useRef<WebSocket | null>(null);
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        if (wsRef.current) return;

        const ws = new WebSocket('ws://localhost/ws');
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('Connected to Proxy!');
            ws.send('Welcome Server');
        };

        ws.onmessage = (event) => {
            messages.push(event.data);
            setMessages([...messages]);
        };

        return () => {
            ws.close();
            wsRef.current = null;
        }
    }, [])

    const send = () => {
        wsRef.current?.send(message);
        setMessage('');
    }

    return (
    <div>
        <Container>
            <h1>Send Message to WS</h1>

            <ListMessages>
                {messages.map((msg, index) => (
                    <p key={index}>{msg}</p>
                ))}
            </ListMessages>

            <SendMessageInput>
                <Input
                    autoFocus
                    type="text"
                    placeholder="Enter message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && send()}
                />
                <Button onClick={send}>Send</Button>
            </SendMessageInput>
        </Container>
    </div>
    )
}

const Container = styled.div`
    padding: 10px;
    height: 100vh;
    overflow-y: auto;
`

const ListMessages = styled.div`
    p {
        margin: 10px 0;
        padding: 10px;
        font-size: 18px;
        &:hover {
            background-color: #f0f0f0;
        }
    }
`

const SendMessageInput = styled.div`
    display: flex;
    gap: 10px;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10px;
    background-color: #fff;
`