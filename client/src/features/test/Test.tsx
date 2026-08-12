import {useEffect} from "react";


export const Test = () => {

    useEffect(() => {
        const ws = new WebSocket('ws://localhost/ws?client_id=user-123');

        ws.onopen = () => {
            console.log('Connected to Proxy!');
            ws.send('Hello World from Client!');
        };

        ws.onmessage = (event) => {
            console.log('Received:', event.data);
        };

        return () => {
            ws.close();
        }
    }, [])


    return (
    <div>Test</div>
    )
}