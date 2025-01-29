import React from 'react';

const Terms = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Termos de Serviço</h1>
            
            <div className="space-y-6">
                <section>
                    <h2 className="text-2xl font-semibold mb-4">1. Aceitação dos Termos</h2>
                    <p>Ao usar nosso serviço, você concorda com estes termos de serviço.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">2. Descrição do Serviço</h2>
                    <p>Oferecemos uma interface para gerenciar mensagens do Instagram de forma eficiente.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">3. Uso do Serviço</h2>
                    <p>Você concorda em usar o serviço apenas para fins legítimos e de acordo com as políticas do Instagram.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">4. Limitações</h2>
                    <p>O serviço é fornecido "como está" e pode sofrer alterações ou interrupções.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">5. Contato</h2>
                    <p>Para dúvidas sobre os termos, entre em contato: bruce@robot-mail.com</p>
                </section>
            </div>
        </div>
    );
};

export default Terms;
