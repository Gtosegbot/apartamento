const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const jsforce = require('jsforce');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuração do SMTP Zoho
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
    loginUrl: 'https://login.salesforce.com'
});

// Função para autenticar no Salesforce
async function authenticateSalesforce() {
    try {
        await conn.login(
            'seu_usuario@seu_dominio.com',
            'sua_senha' + 'seu_token_seguranca'
        );
        console.log('Autenticado no Salesforce com sucesso!');
    } catch (error) {
        console.error('Erro na autenticação do Salesforce:', error);
    }
}

// Rota para envio de e-mail e criação de lead
app.post('/enviar-email', async (req, res) => {
    const { nome, email, telefone, interesse, aceite } = req.body;

    try {
        // Envio do e-mail
        const mailOptions = {
            from: 'comercial@disparoseguro.shop',
            to: 'comercial@disparoseguro.shop',
            subject: 'Novo Lead - Apartamentos Cury',
            html: `
                <h2>Novo Lead Recebido</h2>
                <p><strong>Nome:</strong> ${nome}</p>
                <p><strong>E-mail:</strong> ${email}</p>
                <p><strong>Telefone:</strong> ${telefone}</p>
                <p><strong>Interesse:</strong> ${interesse}</p>
                <p><strong>Aceitou receber contato:</strong> ${aceite ? 'Sim' : 'Não'}</p>
                <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            `
        };

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
                Description: `Lead capturado via formulário web. Interesse: ${interesse}. Aceitou receber contato: ${aceite ? 'Sim' : 'Não'}`
            };

            const result = await conn.sobject('Lead').create(lead);
            console.log('Lead criado no Salesforce com sucesso:', result.id);
            
        } catch (sfError) {
            console.error('Erro ao criar lead no Salesforce:', sfError);
        }
        
        res.status(200).json({ success: true, message: 'E-mail enviado e lead criado com sucesso!' });
    } catch (error) {
        console.error('Erro ao processar lead:', error);
        res.status(500).json({ success: false, message: 'Erro ao processar lead' });
    }
});

// Rota para webhook do n8n
app.post('/webhook/n8n', async (req, res) => {
    try {
        const data = req.body;
        console.log('Dados recebidos do n8n:', data);
        
        // Processar dados do webhook
        // Adicione sua lógica aqui
        
        res.status(200).json({ success: true, message: 'Webhook processado com sucesso' });
    } catch (error) {
        console.error('Erro ao processar webhook:', error);
        res.status(500).json({ success: false, message: 'Erro ao processar webhook' });
    }
});

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
