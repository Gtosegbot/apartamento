const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const jsforce = require('jsforce');

const app = express();
const port = 3000;

// Configuração do CORS
app.use(cors());
app.use(bodyParser.json());

// Configuração do transporter do nodemailer
const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 587,
    secure: false,
    auth: {
        user: 'comercial@disparoseguro.shop',
        pass: 'Bot241223seGgto!'
    }
});

// Configuração do Salesforce
const conn = new jsforce.Connection({
    loginUrl: 'https://login.salesforce.com' // ou sua URL de sandbox se estiver usando
});

// Função para autenticar no Salesforce
async function authenticateSalesforce() {
    try {
        await conn.login(
            'seu_usuario@seu_dominio.com', // Substitua pelo seu usuário do Salesforce
            'sua_senha' + 'seu_token_seguranca' // Senha + Token de Segurança
        );
        console.log('Autenticado no Salesforce com sucesso!');
    } catch (error) {
        console.error('Erro na autenticação do Salesforce:', error);
    }
}

// Rota para receber os dados do formulário
app.post('/enviar-email', async (req, res) => {
    const { nome, telefone, email, aceite } = req.body;

    try {
        // Configuração do e-mail
        const mailOptions = {
            from: 'comercial@disparoseguro.shop',
            to: 'comercial@disparoseguro.shop',
            subject: 'Novo Lead - Apartamentos Cury',
            html: `
                <h2>Novo Lead Recebido</h2>
                <p><strong>Nome:</strong> ${nome}</p>
                <p><strong>Telefone:</strong> ${telefone}</p>
                <p><strong>E-mail:</strong> ${email}</p>
                <p><strong>Aceitou receber contato:</strong> ${aceite ? 'Sim' : 'Não'}</p>
                <p><strong>Data:</strong> ${new Date().toLocaleString()}</p>
            `
        };

        // Envio do e-mail
        await transporter.sendMail(mailOptions);
        
        // Criar Lead no Salesforce
        try {
            await authenticateSalesforce();
            
            const lead = {
                LastName: nome,
                Email: email,
                Phone: telefone,
                Company: 'Apartamentos Cury',
                LeadSource: 'Website',
                Status: 'Novo',
                Description: `Lead capturado via formulário web. Aceitou receber contato: ${aceite ? 'Sim' : 'Não'}`
            };

            const result = await conn.sobject('Lead').create(lead);
            console.log('Lead criado no Salesforce com sucesso:', result.id);
            
        } catch (sfError) {
            console.error('Erro ao criar lead no Salesforce:', sfError);
        }
        
        res.status(200).json({ message: 'E-mail enviado e lead criado com sucesso!' });
    } catch (error) {
        console.error('Erro ao processar lead:', error);
        res.status(500).json({ error: 'Erro ao processar lead' });
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
}); 