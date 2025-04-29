require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const jsforce = require('jsforce');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de segurança
app.use(helmet());
app.use(compression());
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://comprar-apartamento-na-planta.com']
        : '*'
}));

// Limite de requisições
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // limite de 100 requisições por IP
});
app.use(limiter);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuração do SMTP Zoho
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Configuração do Salesforce
const conn = new jsforce.Connection({
    loginUrl: 'https://login.salesforce.com',
    instanceUrl: process.env.SF_INSTANCE_URL
});

// Função para autenticar no Salesforce
async function authenticateSalesforce() {
    try {
        await conn.login(
            process.env.SF_USERNAME,
            process.env.SF_PASSWORD
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
            from: process.env.SMTP_USER,
            to: process.env.SMTP_USER,
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

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
});

// Iniciar servidor
if (process.env.NODE_ENV === 'production') {
    app.listen(PORT, () => {
        console.log(`Servidor rodando em produção na porta ${PORT}`);
    });
} else {
    app.listen(PORT, () => {
        console.log(`Servidor rodando em desenvolvimento na porta ${PORT}`);
    });
}
