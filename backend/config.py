class Config:
    # Credenciais do Instagram/Meta
    INSTAGRAM_CLIENT_ID = '3848557175369988'
    INSTAGRAM_CLIENT_SECRET = 'c3bc991957363be2db8021f55dc0c223'
    INSTAGRAM_REDIRECT_URI = 'http://localhost:5000/api/auth/instagram/callback'
    
    # IDs das contas
    INSTAGRAM_BUSINESS_ACCOUNT_ID = '17841472087676984'  # ID da conta @app.aris
    
    # URLs da API do Meta/Facebook
    INSTAGRAM_AUTH_URL = 'https://www.facebook.com/v18.0/dialog/oauth'
    INSTAGRAM_TOKEN_URL = 'https://graph.facebook.com/v18.0/oauth/access_token'
    INSTAGRAM_GRAPH_URL = 'https://graph.facebook.com/v18.0'