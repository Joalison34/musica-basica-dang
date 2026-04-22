// server.js - Backend para integração com Mercado Pago
const express = require('express');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// 🔴 COLOQUE SEU ACCESS TOKEN AQUI (do Mercado Pago Developers)
// OU crie um arquivo .env com: MP_ACCESS_TOKEN=seu_token_aqui
const accessToken = process.env.MP_ACCESS_TOKEN || "SEU_ACCESS_TOKEN_AQUI";

const client = new MercadoPagoConfig({
    accessToken: accessToken
});

// Endpoint para criar preferência de pagamento
app.post('/create-payment', async (req, res) => {
    try {
        const { nome, preco, quantidade, email } = req.body;
        
        const valorTotal = (preco * quantidade).toFixed(2);
        
        const preference = new Preference(client);
        
        const result = await preference.create({
            body: {
                items: [
                    {
                        title: nome,
                        quantity: Number(quantidade),
                        unit_price: Number(preco),
                        currency_id: 'BRL'
                    }
                ],
                payer: {
                    email: email
                },
                back_urls: {
                    success: 'https://seusite.com/sucesso',
                    failure: 'https://seusite.com/falha',
                    pending: 'https://seusite.com/pendente'
                },
                auto_return: 'approved',
                notification_url: 'https://seu-backend.vercel.app/webhook'
            }
        });
        
        console.log(`✅ Preferência criada: ${result.id}`);
        
        res.status(200).json({
            preferenceId: result.id,
            initPoint: result.init_point
        });
        
    } catch (error) {
        console.error('Erro ao criar preferência:', error);
        res.status(500).json({ 
            error: error.message,
            details: error
        });
    }
});

// Endpoint para webhook (receber confirmação de pagamento)
app.post('/webhook', async (req, res) => {
    try {
        const { type, data } = req.body;
        
        console.log('📨 Webhook recebido:', JSON.stringify(req.body, null, 2));
        
        if (type === 'payment') {
            const paymentId = data.id;
            console.log(`💰 Pagamento ${paymentId} recebido!`);
            
            // Aqui você vai atualizar o ticket no Firebase
            // Como o Firebase está no frontend, você pode:
            // 1. Chamar uma API sua para atualizar
            // 2. Usar Firebase Admin SDK (recomendado)
            
           