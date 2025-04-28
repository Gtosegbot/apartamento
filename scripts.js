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

// Form submission
$('#lead-capture-form').submit(function(e) {
    e.preventDefault();
    
    // Usar o formato E.164 armazenado no data attribute
    const telefoneE164 = $('#telefone').data('e164') || ('+55' + $('#telefone').val().replace(/\D/g, ''));
    
    const formData = {
        nome: $('#nome').val(),
        telefone: telefoneE164,
        email: $('#email').val(),
        aceite: $('#aceite-contato').is(':checked')
    };
    
    // Envio para o servidor Node.js
    $.ajax({
        url: 'http://localhost:3000/enviar-email',
        type: 'POST',
        data: JSON.stringify(formData),
        contentType: 'application/json',
        success: function(response) {
            $('#lead-capture-form').html('<div class="success-message"><p>Obrigado! Em breve você receberá nossas ofertas exclusivas.</p></div>');
            gtag('event', 'lead_form_success', {
                'event_category': 'conversion',
                'event_label': 'form_email'
            });
        },
        error: function(error) {
            alert('Ocorreu um erro. Por favor, tente novamente mais tarde.');
            gtag('event', 'lead_form_error', {
                'event_category': 'error',
                'event_label': 'form_email'
            });
        }
    });
});
EOF
