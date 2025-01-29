import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Política de Privacidade</h1>
            
            <div className="space-y-6">
                <section>
                    <h2 className="text-2xl font-semibold mb-4">1. Coleta de Dados</h2>
                    <p>Coletamos apenas as informações necessárias para o funcionamento do serviço de mensagens do Instagram.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">2. Uso dos Dados</h2>
                    <p>As informações são utilizadas exclusivamente para gerenciar mensagens do Instagram e melhorar a experiência do usuário.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">3. Proteção dos Dados</h2>
                    <p>Implementamos medidas de segurança para proteger suas informações contra acesso não autorizado.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">4. Seus Direitos</h2>
                    <p>Você tem o direito de acessar, corrigir ou excluir seus dados a qualquer momento.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">5. Contato</h2>
                    <p>Para questões sobre privacidade, entre em contato: bruce@robot-mail.com</p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
