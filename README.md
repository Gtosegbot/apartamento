# Sistema de Captura de Leads - Apartamentos Cury

Este sistema foi desenvolvido para capturar leads através de um formulário web, enviar os dados por e-mail usando o SMTP do Zoho e integrar com o Salesforce CRM.

## Requisitos

- Node.js (versão 14 ou superior)
- NPM (gerenciador de pacotes do Node.js)
- Conta no Salesforce com permissões para criar Leads

## Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

## Configuração

### SMTP do Zoho
O sistema está configurado com as credenciais do SMTP do Zoho:
- Host: smtp.zoho.com
- Porta: 587
- E-mail: comercial@disparoseguro.shop

### Salesforce
Para configurar a integração com o Salesforce:

1. Acesse sua conta do Salesforce
2. Vá em Configurações > Configurações de Usuário > Gerar Token de Segurança
3. Copie o token gerado
4. No arquivo `server.js`, substitua:
   - `seu_usuario@seu_dominio.com` pelo seu usuário do Salesforce
   - `sua_senha` pela sua senha do Salesforce
   - `seu_token_seguranca` pelo token gerado

## Executando o Sistema

1. Inicie o servidor:
```bash
npm start
```

2. O servidor estará rodando em `http://localhost:3000`

3. O formulário web deve apontar para a rota `/enviar-email` do servidor

## Funcionalidades

- Captura de dados do formulário (nome, telefone, e-mail)
- Envio automático de e-mail com os dados do lead
- Criação automática de Lead no Salesforce
- Formatação automática do número de telefone
- Tracking de eventos com Google Analytics
- Validação de campos obrigatórios

## Segurança

- Todas as requisições são protegidas com CORS
- Os dados são validados antes do envio
- As credenciais do SMTP e Salesforce estão configuradas no servidor
- Uso de tokens de segurança para autenticação no Salesforce

## Campos do Lead no Salesforce

O sistema cria um Lead no Salesforce com os seguintes campos:
- LastName: Nome do lead
- Email: E-mail do lead
- Phone: Telefone do lead
- Company: "Apartamentos Cury"
- LeadSource: "Website"
- Status: "Novo"
- Description: Informações adicionais sobre o lead 