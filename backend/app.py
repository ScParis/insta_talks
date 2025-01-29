# Importando as bibliotecas necessárias
from flask import Flask, request, jsonify, redirect, url_for
from flask_cors import CORS
import requests
from config import Config
import urllib.parse
import json

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Bem-vindo à API do Instagram Direct!'}), 200

@app.route('/api/auth/facebook/callback', methods=['POST'])
def facebook_callback():
    data = request.json
    access_token = data.get('accessToken')
    
    if not access_token:
        return jsonify({'error': 'Token não fornecido'}), 400

    try:
        # Verifica o token com o Facebook
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
        print("Erro:", str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/api/instagram/messages', methods=['GET'])
def get_messages():
    access_token = request.headers.get('Authorization')
    if not access_token:
        return jsonify({'error': 'Token não fornecido'}), 401

    try:
        # Obtém as mensagens do Instagram
        messages_url = f'https://graph.facebook.com/v18.0/{Config.INSTAGRAM_BUSINESS_ACCOUNT_ID}/conversations'
        response = requests.get(messages_url, params={
            'access_token': access_token,
            'fields': 'participants,messages{message,from,to,created_time}'
        })
        
        messages = response.json()
        return jsonify(messages), 200

    except Exception as e:
        print("Erro ao obter mensagens:", str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/api/instagram/send-message', methods=['POST'])
def send_instagram_message():
    data = request.json
    if not data or 'message' not in data or 'recipient_id' not in data:
        return jsonify({'error': 'Dados incompletos'}), 400

    access_token = request.headers.get('Authorization')
    if not access_token:
        return jsonify({'error': 'Token não fornecido'}), 401

    try:
        # Envia a mensagem
        send_url = f'https://graph.facebook.com/v18.0/{Config.INSTAGRAM_BUSINESS_ACCOUNT_ID}/messages'
        response = requests.post(send_url, params={
            'access_token': access_token,
            'recipient': {'id': data['recipient_id']},
            'message': {'text': data['message']}
        })
        
        result = response.json()
        return jsonify(result), 200

    except Exception as e:
        print("Erro ao enviar mensagem:", str(e))
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
