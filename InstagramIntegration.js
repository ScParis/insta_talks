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
    const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
    const [showConsentDialog, setShowConsentDialog] = useState(false);

    // URLs dos documentos legais
    const privacyPolicyUrl = 'https://scparis.github.io/insta_talks/privacy-policy.html';
    const termsOfServiceUrl = 'https://scparis.github.io/insta_talks/terms.html';

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
            const response = await api.post('/auth/instagram', {
                accessToken: authResponse.accessToken,
                userConsent: hasAcceptedTerms
            });

            if (response.data.success) {
                setAccessToken(authResponse.accessToken);
                setIsConnected(true);
                await fetchMessages(authResponse.accessToken);
            } else {
                setError('Falha ao autenticar com o Instagram');
            }
        } catch (error) {
            console.error('Erro na autenticação:', error);
            setError('Erro ao conectar com o servidor');
        }
    };

    const handleLogin = () => {
        if (!hasAcceptedTerms) {
            setShowConsentDialog(true);
            return;
        }

        FB.login(
            function(response) {
                if (response.authResponse) {
                    handleAuthResponse(response.authResponse);
                } else {
                    setError('Falha na autenticação com o Facebook');
                }
            },
            {
                scope: 'instagram_basic,instagram_manage_messages,pages_show_list,pages_messaging',
                return_scopes: true
            }
        );
    };

    const handleConsent = () => {
        setHasAcceptedTerms(true);
        setShowConsentDialog(false);
        handleLogin();
    };

    const fetchMessages = async (token) => {
        try {
            const response = await api.get('/messages', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(response.data);
        } catch (error) {
            console.error('Erro ao buscar mensagens:', error);
            setError('Erro ao buscar mensagens');
        }
    };

    const sendMessage = async () => {
        if (!newMessage || !selectedRecipient) return;

        try {
            await api.post('/messages/send', {
                recipientId: selectedRecipient,
                message: newMessage
            }, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            setNewMessage('');
            await fetchMessages(accessToken);
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            setError('Erro ao enviar mensagem');
        }
    };

    // Componente de diálogo de consentimento
    const ConsentDialog = () => (
        <div className="consent-dialog">
            <div className="consent-content">
                <h2>Termos de Uso e Privacidade</h2>
                <p>Para usar o InstaTalks, você precisa aceitar nossos termos de uso e política de privacidade.</p>
                <p>Por favor, leia os seguintes documentos:</p>
                <div className="consent-links">
                    <a href={privacyPolicyUrl} target="_blank" rel="noopener noreferrer">Política de Privacidade</a>
                    <a href={termsOfServiceUrl} target="_blank" rel="noopener noreferrer">Termos de Serviço</a>
                </div>
                <div className="consent-actions">
                    <button onClick={handleConsent} className="accept-button">
                        Aceitar e Continuar
                    </button>
                    <button onClick={() => setShowConsentDialog(false)} className="decline-button">
                        Recusar
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="instagram-integration">
            <h1>InstaTalks</h1>
            
            {error && <div className="error-message">{error}</div>}
            
            {!isConnected ? (
                <div className="login-section">
                    <button onClick={handleLogin} className="login-button">
                        Conectar com Instagram
                    </button>
                    <div className="legal-links">
                        <a href={privacyPolicyUrl} target="_blank" rel="noopener noreferrer">
                            Política de Privacidade
                        </a>
                        <span className="separator">|</span>
                        <a href={termsOfServiceUrl} target="_blank" rel="noopener noreferrer">
                            Termos de Serviço
                        </a>
                    </div>
                </div>
            ) : (
                <div className="messages-section">
                    <div className="messages-list">
                        {messages.map((msg, index) => (
                            <div key={index} className="message">
                                <strong>{msg.from}:</strong> {msg.text}
                            </div>
                        ))}
                    </div>
                    <div className="message-input">
                        <select
                            value={selectedRecipient}
                            onChange={(e) => setSelectedRecipient(e.target.value)}
                        >
                            <option value="">Selecione um destinatário</option>
                            {/* Adicione opções de destinatários aqui */}
                        </select>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Digite sua mensagem..."
                        />
                        <button onClick={sendMessage}>Enviar</button>
                    </div>
                </div>
            )}

            {showConsentDialog && <ConsentDialog />}

            <style jsx>{`
                .instagram-integration {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }

                .error-message {
                    color: #ff4444;
                    margin: 10px 0;
                    padding: 10px;
                    background-color: #ffe5e5;
                    border-radius: 4px;
                }

                .login-section {
                    text-align: center;
                    margin: 40px 0;
                }

                .login-button {
                    background-color: #0095f6;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                }

                .legal-links {
                    margin-top: 20px;
                }

                .legal-links a {
                    color: #666;
                    text-decoration: none;
                    margin: 0 10px;
                }

                .separator {
                    color: #666;
                }

                .messages-section {
                    margin-top: 20px;
                }

                .messages-list {
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    padding: 10px;
                    height: 400px;
                    overflow-y: auto;
                }

                .message {
                    margin: 10px 0;
                    padding: 10px;
                    background-color: #f5f5f5;
                    border-radius: 4px;
                }

                .message-input {
                    margin-top: 20px;
                    display: flex;
                    gap: 10px;
                }

                .message-input input {
                    flex: 1;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }

                .message-input select {
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }

                .message-input button {
                    background-color: #0095f6;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                }

                .consent-dialog {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }

                .consent-content {
                    background-color: white;
                    padding: 30px;
                    border-radius: 8px;
                    max-width: 500px;
                    width: 90%;
                }

                .consent-links {
                    margin: 20px 0;
                    display: flex;
                    gap: 20px;
                    justify-content: center;
                }

                .consent-links a {
                    color: #0095f6;
                    text-decoration: none;
                }

                .consent-actions {
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                    margin-top: 20px;
                }

                .accept-button {
                    background-color: #0095f6;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                }

                .decline-button {
                    background-color: #666;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default InstagramIntegration;
