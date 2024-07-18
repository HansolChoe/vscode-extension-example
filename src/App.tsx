import * as React from 'react';

declare const acquireVsCodeApi: () => {
    postMessage: (message: any) => void;
};

const vscode = acquireVsCodeApi();

interface ChatMessage {
    type: 'user' | 'assistant' | 'system';
    content: string;
}

const App: React.FC = () => {
    const [inputValue, setInputValue] = React.useState('');
    const [chatHistory, setChatHistory] = React.useState<ChatMessage[]>([
        { type: 'system', content: 'You are a friendly assistant.' }
    ]);

    React.useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            if (message.type === 'response') {
                const newAssistantMessage: ChatMessage = { type: 'assistant', content: message.value };
                setChatHistory(prev => [...prev, newAssistantMessage]);
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    const handleSubmit = () => {
        if (inputValue.trim()) {
            const newUserMessage: ChatMessage = { type: 'user', content: inputValue };
            setChatHistory(prev => [...prev, newUserMessage]);
            vscode.postMessage({ type: 'showMessage', value: inputValue });
            setInputValue('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <div style={{ flex: 1, overflow: 'auto', padding: '10px' }}>
                {chatHistory.filter(message => message.type !== 'system').map((message, index) => (
                    <div key={index} style={{ marginBottom: '10px', textAlign: message.type === 'user' ? 'right' : 'left' }}>
                        <span style={{ 
                            background: message.type === 'user' ? '#DCF8C6' : (message.type === 'assistant' ? '#E0E0E0' : '#F0F0F0'),
                            padding: '5px 10px', 
                            borderRadius: '10px',
                            display: 'inline-block'
                        }}>
                            {message.content}
                        </span>
                    </div>
                ))}
            </div>
            <div style={{ padding: '10px', borderTop: '1px solid #ccc' }}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    style={{ width: '100%' }}
                />
            </div>
        </div>
    );
};

export default App;