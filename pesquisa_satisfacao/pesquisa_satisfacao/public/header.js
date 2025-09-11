document.addEventListener("DOMContentLoaded", function () {
    const headerHTML = `
        <header>
            <img src="http://cucinare.com.br/wp-content/uploads/2023/12/Prancheta-2-1.png" alt="Logo da Empresa">
        </header>
    `;

    // Insere o header no início do body
    document.body.insertAdjacentHTML("afterbegin", headerHTML);

    // Adiciona estilo para manter o header fixo e ocultá-lo ao rolar para baixo
    const style = document.createElement("style");
    style.textContent = `
        /* Estilos do Header */
        header {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 120px; /* Ajuste conforme necessário */
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: transparent; /* Definido para transparente */
            box-shadow: none; /* Retirando a sombra */
            z-index: 1000; /* Garante que fique acima de outros elementos */
            transition: transform 0.3s ease-in-out; /* Animação suave para esconder/show */
        }

        header img {
            max-height: 100px;
            max-width: 100%;
        }

        /* Estilos do Body */
        body {
            background-color: transparent; /* Garantir que o fundo do body seja transparente */
            padding-top: 120px; /* Ajuste para o conteúdo não ficar escondido atrás do header */
            margin: 0; /* Remove a margem padrão */
        }

        /* Adiciona a classe para esconder o header */
        .header-hidden {
            transform: translateY(-120px); /* Desloca o header para cima (esconde ele) */
        }
    `;
    document.head.appendChild(style);

    // Função para controlar a rolagem e esconder o header
    let lastScrollTop = 0;
    const header = document.querySelector("header");

    window.addEventListener("scroll", function () {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

        // Se rolou para baixo, esconde o header
        if (currentScroll > lastScrollTop) {
            header.classList.add("header-hidden");
        } else {
            // Se rolou para cima, mostra o header novamente
            header.classList.remove("header-hidden");
        }

        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Evita que o valor seja negativo
    });
});
