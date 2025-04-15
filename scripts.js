# Abra o arquivo scripts.js para edição
cat > scripts.js << 'EOF'
// Função para enviar formulário para o WhatsApp
function submitForm() {
  const nome = document.getElementById('nome').value;
  const telefone = document.getElementById('telefone').value;
  const email = document.getElementById('email').value;
  
  if (!nome || !telefone || !email) {
    alert('Por favor, preencha todos os campos obrigatórios.');
    return false;
  }
  
  const mensagem = `Olá, meu nome é ${nome}. Tenho interesse em um apartamento Cury. Meu telefone é ${telefone} e meu e-mail é ${email}.`;
  
  window.location.href = `https://wa.me/+5511951947025?text=${encodeURIComponent(mensagem)}`;
  
  return false;
}

// Efeito de scroll suave para links internos
document.addEventListener('DOMContentLoaded', function() {
  // Verifica se a página foi carregada com sucesso
  console.log('Site carregado com sucesso!');
  
  // Função para mostrar botão de WhatsApp após um tempo
  setTimeout(function() {
    const whatsappFloat = document.querySelector('.whatsapp-float');
    if (whatsappFloat) {
      whatsappFloat.style.display = 'block';
    }
  }, 5000);
});
EOF
