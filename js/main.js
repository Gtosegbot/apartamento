// Verificar erros no carregamento dos recursos
window.addEventListener('error', function(e) {
    console.error('Erro ao carregar recurso:', e.target.src || e.target.href);
}, true);

// Verificar se o DOM está completamente carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM completamente carregado');
    console.log('Número total de elementos:', document.getElementsByTagName('*').length);
});

// Verificar se a página está completamente carregada
window.addEventListener('load', function() {
    console.log('Página completamente carregada');
    console.log('Recursos carregados:', performance.getEntriesByType('resource').length);
});

$(document).ready(function () {
    // Log para verificar o carregamento do DOM
    console.log('DOM carregado');
    console.log('Conteúdo do body:', $('body').html());
    console.log('Número de seções:', $('section').length);
    console.log('Seções encontradas:', $('section').map(function() { return $(this).attr('class'); }).get());
    
    // Verificação de elementos específicos
    console.log('Elementos FAQ:', $('.faq-section').length);
    console.log('Elementos Accordion:', $('.accordion-item').length);
    console.log('Headers Accordion:', $('.accordion-header').length);
    console.log('Contents Accordion:', $('.accordion-content').length);
    
    // Verificação de imagens
    console.log('Imagens carregadas:', $('img').length);
    console.log('Imagens com erro:', $('img').filter(function() { return this.complete && this.naturalHeight === 0; }).length);
    
    // Inicialização do carrossel
    $('.carousel').slick({
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        arrows: true,
        adaptiveHeight: true,
        fade: true,
        cssEase: 'linear',
        lazyLoad: 'ondemand'
    });
    
    // Accordion functionality
    $('.accordion-header').click(function() {
        console.log('Accordion clicado:', $(this).text());
        $(this).toggleClass('active');
        $(this).next('.accordion-content').toggleClass('active');
        
        // Registro de evento GA
        gtag('event', 'faq_click', {
            'event_category': 'engagement',
            'event_label': $(this).text()
        });
    });
    
    // Verificação de carregamento
    console.log('jQuery carregado:', typeof jQuery !== 'undefined');
    console.log('Slick carregado:', typeof $.fn.slick !== 'undefined');
    
    // Política de Privacidade Modal
    if (!localStorage.getItem('cookiesAccepted')) {
        $('#privacy-modal').css('display', 'block');
    }
    
    // Fechar modal ao clicar no X
    $('.close').click(function() {
        $('#privacy-modal').css('display', 'none');
    });
    
    // Aceitar cookies
    $('#accept-cookies').click(function() {
        localStorage.setItem('cookiesAccepted', 'true');
        $('#privacy-modal').css('display', 'none');
    });
    
    // N8N Form Integration
    setTimeout(function() {
        $('#n8n-form-container').addClass('show-modal');
    }, 15000);
    
    // Close modal
    $('.close-modal').click(function() {
        $('#n8n-form-container').removeClass('show-modal');
    });
    
    // Formatação de telefone no padrão E.164
    $('#telefone').on('input', function() {
        let telefone = $(this).val().replace(/\D/g, '');
        
        if (telefone.startsWith('0')) {
            telefone = telefone.substring(1);
        }
        
        if (!telefone.startsWith('55')) {
            telefone = '55' + telefone;
        }
        
        let formattedDisplay;
        if (telefone.length > 12) {
            formattedDisplay = `+${telefone.substring(0, 2)} (${telefone.substring(2, 4)}) ${telefone.substring(4, 9)}-${telefone.substring(9)}`;
        } else {
            formattedDisplay = `+${telefone.substring(0, 2)} (${telefone.substring(2, 4)}) ${telefone.substring(4, 8)}-${telefone.substring(8)}`;
        }
        
        $(this).val(formattedDisplay);
        $(this).data('e164', '+' + telefone);
    });
    
    // Form submission
    $('#lead-capture-form').submit(function(e) {
        e.preventDefault();
        
        const telefoneE164 = $('#telefone').data('e164') || ('+55' + $('#telefone').val().replace(/\D/g, ''));
        
        const formData = {
            nome: $('#nome').val(),
            telefone: telefoneE164,
            email: $('#email').val(),
            aceite: $('#aceite-contato').is(':checked'),
            origem: 'website_form'
        };
        
        $.ajax({
            url: 'https://seu-servidor-n8n.com/webhook/lead-capture',
            type: 'POST',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function(response) {
                $('#lead-capture-form').html('<div class="success-message"><p>Obrigado! Em breve você receberá nossas ofertas exclusivas.</p></div>');
                gtag('event', 'lead_form_success', {
                    'event_category': 'conversion',
                    'event_label': 'form_n8n'
                });
            },
            error: function(error) {
                alert('Ocorreu um erro. Por favor, tente novamente mais tarde.');
                gtag('event', 'lead_form_error', {
                    'event_category': 'error',
                    'event_label': 'form_n8n'
                });
            }
        });
    });
    
    // Monitoramento de tempo de permanência
    const startTime = new Date();
    window.addEventListener('beforeunload', function() {
        const endTime = new Date();
        const timeSpent = Math.round((endTime - startTime) / 1000);
        
        gtag('event', 'time_on_page', {
            'event_category': 'engagement',
            'value': timeSpent
        });
    });
});
