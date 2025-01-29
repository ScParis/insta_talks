# Importando as bibliotecas necessárias
from flask import Flask, request, jsonify, redirect, url_for
from flask_cors import CORS
import requests
import json
from datetime import datetime
import logging
from config import Config

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Bem-vindo à API do Instagram Direct!'}), 200

@app.route('/api/auth/facebook/callback', methods=['POST'])
def facebook_callback():
    try:
        data = request.json
        access_token = data.get('accessToken')
        user_consent = data.get('userConsent')

        if not access_token:
            return jsonify({'error': 'Token de acesso não fornecido'}), 400

        if not user_consent:
            return jsonify({'error': 'Consentimento do usuário necessário'}), 403

        # Log the consent
        logger.info(f'User consent received at {datetime.now().isoformat()}')

        # Validate token with Instagram
        debug_token_url = f'https://graph.facebook.com/v18.0/debug_token'
        app_access_token = f"{Config.INSTAGRAM_CLIENT_ID}|{Config.INSTAGRAM_CLIENT_SECRET}"
        
        response = requests.get(debug_token_url, params={
            'input_token': access_token,
            'access_token': app_access_token
        })
        
        token_info = response.json()
        print("Token info:", token_info)

        if 'data' in token_info and token_info['data'].get('is_valid'):
            # Obtém informações da conta do Instagram
            instagram_account_url = f'https://graph.facebook.com/v18.0/me/accounts'
            response = requests.get(instagram_account_url, params={
                'access_token': access_token
            })
            
            pages = response.json().get('data', [])
            print("Pages:", pages)
            
            if pages:
                # Use o primeiro page access token
                page_access_token = pages[0]['access_token']
                page_id = pages[0]['id']
                
                # Agora obtém a conta do Instagram associada
                instagram_business_account_url = f'https://graph.facebook.com/v18.0/{page_id}?fields=instagram_business_account&access_token={page_access_token}'
                response = requests.get(instagram_business_account_url)
                instagram_data = response.json()
                print("Instagram data:", instagram_data)
                
                if 'instagram_business_account' in instagram_data:
                    return jsonify({
                        'message': 'Token validado com sucesso',
                        'instagram_account': instagram_data['instagram_business_account']
                    }), 200
                else:
                    return jsonify({'error': 'Conta do Instagram não encontrada'}), 400
            else:
                return jsonify({'error': 'Nenhuma página do Facebook encontrada'}), 400
        else:
            return jsonify({'error': 'Token inválido'}), 400
            
    except Exception as e:
        logger.error(f'Authentication error: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/instagram/messages', methods=['GET'])
def get_messages():
    try:
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token não fornecido'}), 401

        token = token.replace('Bearer ', '')

        # Fetch messages from Instagram API
        messages_url = f'https://graph.facebook.com/v18.0/{Config.INSTAGRAM_BUSINESS_ACCOUNT_ID}/conversations'
        response = requests.get(messages_url, params={
            'access_token': token,
            'fields': 'participants,messages{message,from,to,created_time}'
        })
        
        if response.status_code != 200:
            logger.error(f'Instagram API error: {response.text}')
            return jsonify({'error': 'Erro ao buscar mensagens'}), response.status_code

        return jsonify(response.json())

    except Exception as e:
        logger.error(f'Error fetching messages: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/instagram/send-message', methods=['POST'])
def send_instagram_message():
    try:
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token não fornecido'}), 401

        token = token.replace('Bearer ', '')
        data = request.get_json()

        recipient_id = data.get('recipient_id')
        message = data.get('message')

        if not recipient_id or not message:
            return jsonify({'error': 'Destinatário e mensagem são obrigatórios'}), 400

        # Send message through Instagram API
        send_url = f'https://graph.facebook.com/v18.0/{Config.INSTAGRAM_BUSINESS_ACCOUNT_ID}/messages'
        response = requests.post(send_url, params={
            'access_token': token,
            'recipient': {'id': recipient_id},
            'message': {'text': message}
        })
        
        if response.status_code != 200:
            logger.error(f'Instagram API error: {response.text}')
            return jsonify({'error': 'Erro ao enviar mensagem'}), response.status_code

        return jsonify({'success': True})

    except Exception as e:
        logger.error(f'Error sending message: {str(e)}')
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=Config.DEBUG, host='0.0.0.0', port=5000)
