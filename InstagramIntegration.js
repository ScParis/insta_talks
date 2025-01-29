import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Configuração base do axios
const api = axios.create({
    baseURL: 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json'
    }
});

const InstagramIntegration = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [selectedRecipient, setSelectedRecipient] = useState('');

    useEffect(() => {
        // Inicializa o SDK do Facebook
        window.fbAsyncInit = function() {
            FB.init({
                appId: '3848557175369988',
                cookie: true,
                xfbml: true,
                version: 'v18.0'
            });

            FB.AppEvents.logPageView();

            // Verifica o status do login
            FB.getLoginStatus(function(response) {
                if (response.status === 'connected') {
                    handleAuthResponse(response.authResponse);
                }
            });
        };

        // Carrega o SDK do Facebook
        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s);
            js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }, []);

    const handleAuthResponse = async (authResponse) => {
        try {
            console.log('Auth Response:', authResponse); // Debug
            const response = await api.post('/api/auth/facebook/callback', {
                accessToken: authResponse.accessToken
            });
            
            console.log('Resposta do backend:', response.data);
            setAccessToken(authResponse.accessToken);
            setIsConnected(true);
            fetchMessages(authResponse.accessToken);
        } catch (error) {
            console.error('Erro na autenticação:', error.response?.data || error.message);
            setError(error.response?.data?.error || error.message);
        }
    };

    const handleLogin = () => {
        FB.login(function(response) {
            if (response.authResponse) {
                handleAuthResponse(response.authResponse);
            } else {
                console.log('Login cancelado ou falhou');
                setError('Login cancelado ou falhou');
            }
        }, {
            scope: 'pages_show_list,pages_messaging,instagram_basic,pages_read_engagement'
        });
    };

    const fetchMessages = async (token) => {
        try {
            const response = await api.get('/api/instagram/messages', {
                headers: { Authorization: token }
            });
            setMessages(response.data.data || []);
        } catch (error) {
            console.error('Erro ao buscar mensagens:', error.response?.data || error.message);
            setError('Erro ao buscar mensagens');
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage || !selectedRecipient) {
            setError('Por favor, preencha a mensagem e selecione um destinatário');
            return;
        }

        try {
            await api.post('/api/instagram/send-message', {
                message: newMessage,
                recipient_id: selectedRecipient
            }, {
                headers: { Authorization: accessToken }
            });

            setNewMessage('');
            fetchMessages(accessToken);
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error.response?.data || error.message);
            setError('Erro ao enviar mensagem');
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Integração com Instagram</h1>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            
            {!isConnected ? (
                <button
                    onClick={handleLogin}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Conectar com Facebook/Instagram
                </button>
            ) : (
                <div className="space-y-4">
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        Conectado ao Instagram!
                    </div>

                    <div className="border rounded p-4">
                        <h2 className="text-xl mb-4">Mensagens</h2>
                        <div className="space-y-2">
                            {messages.map((msg, index) => (
                                <div key={index} className="border-b py-2">
                                    <p><strong>De:</strong> {msg.from?.name}</p>
                                    <p>{msg.message}</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(msg.created_time).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 space-y-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Digite sua mensagem"
                                className="w-full border p-2 rounded"
                            />
                            <input
                                type="text"
                                value={selectedRecipient}
                                onChange={(e) => setSelectedRecipient(e.target.value)}
                                placeholder="ID do destinatário"
                                className="w-full border p-2 rounded"
                            />
                            <button
                                onClick={handleSendMessage}
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Enviar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstagramIntegration;
