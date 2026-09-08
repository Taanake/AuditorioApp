document.addEventListener("DOMContentLoaded", function () {

    const app =
        document.getElementById("app");

    const cenario =
        document.getElementById("cenario");

    const auditorio =
        document.getElementById("auditorio");

    const avatares =
        document.getElementById("avatares");

    const btnResetar =
        document.getElementById("btnResetar");

    const btnVisitantes =
        document.getElementById("btnVisitantes");

    const menuVisitantes =
        document.getElementById("menuVisitantes");

    const btnAdicionarHomem =
        document.getElementById("btnAdicionarHomem");

    const btnAdicionarMulher =
        document.getElementById("btnAdicionarMulher");

    const btnExcluirVisitantes =
        document.getElementById("btnExcluirVisitantes");


    /*
     * ==========================================================
     * CONFIGURAÇÃO DA VISÃO
     * ==========================================================
     */

    let escalaBase = 1;
    let escalaAtual = 1;

    let deslocamentoX = 0;
    let deslocamentoY = 0;

    const ZOOM_MINIMO = 1;
    const ZOOM_MAXIMO = 4;


    /*
     * ==========================================================
     * CHAVES DO LOCALSTORAGE
     * ==========================================================
     */

    const CHAVE_POSICOES =
        "auditorio_posicoes_avatares";

    const CHAVE_VISITANTES =
        "auditorio_visitantes";


    /*
     * ==========================================================
     * POSIÇÕES SALVAS
     * ==========================================================
     */

    let posicoesSalvas = {};

    try {

        const dados =
            localStorage.getItem(
                CHAVE_POSICOES
            );

        if (dados) {

            posicoesSalvas =
                JSON.parse(dados);
        }

    } catch (erro) {

        console.error(
            "Erro ao carregar posições:",
            erro
        );

        posicoesSalvas = {};
    }


    /*
     * ==========================================================
     * VISITANTES SALVOS
     * ==========================================================
     */

    let visitantesSalvos = [];

    try {

        const dados =
            localStorage.getItem(
                CHAVE_VISITANTES
            );

        if (dados) {

            visitantesSalvos =
                JSON.parse(dados);
        }

    } catch (erro) {

        console.error(
            "Erro ao carregar visitantes:",
            erro
        );

        visitantesSalvos = [];
    }


    function salvarPosicoes() {

        try {

            localStorage.setItem(
                CHAVE_POSICOES,
                JSON.stringify(
                    posicoesSalvas
                )
            );

        } catch (erro) {

            console.error(
                "Erro ao salvar posições:",
                erro
            );
        }
    }


    function salvarVisitantes() {

        try {

            localStorage.setItem(
                CHAVE_VISITANTES,
                JSON.stringify(
                    visitantesSalvos
                )
            );

        } catch (erro) {

            console.error(
                "Erro ao salvar visitantes:",
                erro
            );
        }
    }


    /*
     * ==========================================================
     * AJUSTA O AUDITÓRIO
     * ==========================================================
     */

    function calcularEscalaBase() {

    const largura =
        auditorio.naturalWidth;

    const altura =
        auditorio.naturalHeight;

    if (!largura || !altura) {
        return;
    }

    cenario.style.width =
        largura + "px";

    cenario.style.height =
        altura + "px";


    const escalaX =
        window.innerWidth /
        largura;

    const escalaY =
        window.innerHeight /
        altura;


    escalaBase =
        Math.min(
            escalaX,
            escalaY
        ) * 0.95;


    escalaAtual =
        escalaBase;


    centralizarCenario();

    aplicarTransformacao();
}

function reajustarParaNovaTela() {

    const largura =
        auditorio.naturalWidth;

    const altura =
        auditorio.naturalHeight;

    if (!largura || !altura) {
        return;
    }

    const proporcaoZoom =
        escalaAtual / escalaBase;

    const escalaX =
        window.innerWidth /
        largura;

    const escalaY =
        window.innerHeight /
        altura;

    escalaBase =
        Math.min(
            escalaX,
            escalaY
        ) * 0.95;

    escalaAtual =
        escalaBase *
        proporcaoZoom;

    centralizarCenario();

    aplicarTransformacao();
}


    /*
     * ==========================================================
     * CENTRALIZA O AUDITÓRIO
     * ==========================================================
     */

    function centralizarCenario() {

        const largura =
            cenario.offsetWidth *
            escalaAtual;

        const altura =
            cenario.offsetHeight *
            escalaAtual;


        deslocamentoX =
            (
                window.innerWidth -
                largura
            ) / 2;


        deslocamentoY =
            (
                window.innerHeight -
                altura
            ) / 2;
    }


    /*
     * ==========================================================
     * APLICA ZOOM + POSIÇÃO
     * ==========================================================
     */

    function aplicarTransformacao() {

        cenario.style.transform =
            "translate(" +
            deslocamentoX +
            "px, " +
            deslocamentoY +
            "px) scale(" +
            escalaAtual +
            ")";
    }


    /*
     * ==========================================================
     * 47 AVATARES PRINCIPAIS
     * ==========================================================
     */

    const nomesAvatares = [];

    for (
        let i = 1;
        i <= 47;
        i++
    ) {

        nomesAvatares.push(
            String(i)
        );
    }


    /*
     * ==========================================================
     * POSIÇÃO INICIAL
     * ==========================================================
     */

    function obterPosicaoInicial(indice) {

        const coluna =
            indice % 8;

        const linha =
            Math.floor(
                indice / 8
            );


        return {

            x:
                500 +
                coluna * 300,

            y:
                500 +
                linha * 450
        };
    }


    /*
     * ==========================================================
     * CONTROLE DOS PONTEIROS
     * ==========================================================
     */

    const ponteiros =
        new Map();


    /*
     * ==========================================================
     * ESTADO DO ARRASTE
     * ==========================================================
     */

    let avatarArrastando = null;

    let avatarNome = null;

    let deslocamentoAvatarX = 0;

    let deslocamentoAvatarY = 0;


    /*
     * ==========================================================
     * ESTADO DO GESTO DE DOIS DEDOS
     * ==========================================================
     */

    let gestoAnterior = null;


    /*
     * ==========================================================
     * INFORMAÇÕES DO GESTO
     * ==========================================================
     */

    function obterDadosGesto() {

        const pontos =
            Array.from(
                ponteiros.values()
            );


        if (pontos.length < 2) {
            return null;
        }


        const p1 = pontos[0];

        const p2 = pontos[1];


        const dx =
            p2.x - p1.x;

        const dy =
            p2.y - p1.y;


        const distancia =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        const centroX =
            (p1.x + p2.x) / 2;

        const centroY =
            (p1.y + p2.y) / 2;


        return {

            distancia:
                distancia,

            centroX:
                centroX,

            centroY:
                centroY
        };
    }


    /*
     * ==========================================================
     * INICIA GESTO
     * ==========================================================
     */

    function iniciarGesto() {

        const dados =
            obterDadosGesto();


        if (!dados) {
            return;
        }


        gestoAnterior = {

            distancia:
                dados.distancia,

            centroX:
                dados.centroX,

            centroY:
                dados.centroY,

            escala:
                escalaAtual
        };


        if (avatarArrastando) {

            avatarArrastando =
                null;

            avatarNome =
                null;
        }
    }


    /*
     * ==========================================================
     * ATUALIZA GESTO
     * ==========================================================
     */

    function atualizarGesto() {

        if (!gestoAnterior) {

            iniciarGesto();

            return;
        }


        const dados =
            obterDadosGesto();


        if (!dados) {
            return;
        }


        const fatorZoom =
            dados.distancia /
            gestoAnterior.distancia;


        let novaEscala =
            gestoAnterior.escala *
            fatorZoom;


        novaEscala =
            Math.max(
                escalaBase *
                ZOOM_MINIMO,

                Math.min(
                    escalaBase *
                    ZOOM_MAXIMO,

                    novaEscala
                )
            );


        const mundoX =
            (
                dados.centroX -
                deslocamentoX
            ) / escalaAtual;


        const mundoY =
            (
                dados.centroY -
                deslocamentoY
            ) / escalaAtual;


        deslocamentoX =
            dados.centroX -
            mundoX *
            novaEscala;


        deslocamentoY =
            dados.centroY -
            mundoY *
            novaEscala;


        escalaAtual =
            novaEscala;


        aplicarTransformacao();


        gestoAnterior = {

            distancia:
                dados.distancia,

            centroX:
                dados.centroX,

            centroY:
                dados.centroY,

            escala:
                escalaAtual
        };
    }


    /*
     * ==========================================================
     * CRIA AVATAR
     * ==========================================================
     */

    function criarAvatar(
        nome,
        indice,
        arquivo = nome,
        ehVisitante = false
    ) {

        const avatar =
            document.createElement("img");


        avatar.className =
            "avatar";


        avatar.src =
            "./imagens/" +
            arquivo +
            ".png";


        avatar.alt =
            ehVisitante
                ? "Visitante"
                : "Avatar " + nome;


        /*
         * Posição.
         */

        let posicao;


        if (posicoesSalvas[nome]) {

            posicao =
                posicoesSalvas[nome];

        } else {

            posicao =
                obterPosicaoInicial(indice);
        }


        avatar.style.left =
            posicao.x + "px";


        avatar.style.top =
            posicao.y + "px";


        /*
         * Tamanho atual aprovado.
         */

        avatar.style.width =
            "135px";

        avatar.style.height =
            "auto";


        /*
         * Camada.
         */

        avatar.style.zIndex =
            ehVisitante
                ? 5000 + indice
                : 100 + indice;


        /*
         * ======================================================
         * CONTROLE DO ARRASTE
         * ======================================================
         */

        let arrastandoEsteAvatar =
            false;

        let ultimoToqueX = 0;

        let ultimoToqueY = 0;


        /*
         * ======================================================
         * POINTER DOWN
         * ======================================================
         */

        avatar.addEventListener(
            "pointerdown",
            function (evento) {

                evento.preventDefault();


                /*
                 * Desseleciona os outros.
                 */

                document
                    .querySelectorAll(
                        ".avatar.selecionado"
                    )
                    .forEach(
                        function (outroAvatar) {

                            outroAvatar.classList.remove(
                                "selecionado"
                            );
                        }
                    );


                /*
                 * Seleciona.
                 */

                avatar.classList.add(
                    "selecionado"
                );


                /*
                 * Coloca na frente.
                 */

                avatar.style.zIndex =
                    "10000";


                /*
                 * Registra ponteiro.
                 */

                ponteiros.set(
                    evento.pointerId,
                    {
                        x:
                            evento.clientX,

                        y:
                            evento.clientY,

                        avatar:
                            avatar
                    }
                );


                /*
                 * Dois dedos.
                 */

                if (
                    ponteiros.size >= 2
                ) {

                    arrastandoEsteAvatar =
                        false;

                    avatarArrastando =
                        null;

                    iniciarGesto();

                    return;
                }


                /*
                 * Começa arraste.
                 */

                arrastandoEsteAvatar =
                    true;

                avatarArrastando =
                    avatar;

                avatarNome =
                    nome;


                ultimoToqueX =
                    evento.clientX;

                ultimoToqueY =
                    evento.clientY;


                avatar.setPointerCapture(
                    evento.pointerId
                );

            }
        );


        /*
         * ======================================================
         * POINTER MOVE
         * ======================================================
         */

        avatar.addEventListener(
            "pointermove",
            function (evento) {

                if (
                    ponteiros.has(
                        evento.pointerId
                    )
                ) {

                    ponteiros.set(
                        evento.pointerId,
                        {
                            x:
                                evento.clientX,

                            y:
                                evento.clientY,

                            avatar:
                                avatar
                        }
                    );
                }


                /*
                 * Dois dedos.
                 */

                if (
                    ponteiros.size >= 2
                ) {

                    arrastandoEsteAvatar =
                        false;

                    avatarArrastando =
                        null;

                    atualizarGesto();

                    return;
                }


                if (
                    !arrastandoEsteAvatar ||
                    avatarArrastando !== avatar
                ) {

                    return;
                }


                evento.preventDefault();


                const movimentoX =
                    evento.clientX -
                    ultimoToqueX;


                const movimentoY =
                    evento.clientY -
                    ultimoToqueY;


                ultimoToqueX =
                    evento.clientX;

                ultimoToqueY =
                    evento.clientY;


                const movimentoCenarioX =
                    movimentoX /
                    escalaAtual;


                const movimentoCenarioY =
                    movimentoY /
                    escalaAtual;


                let x =
                    parseFloat(
                        avatar.style.left
                    ) || 0;


                let y =
                    parseFloat(
                        avatar.style.top
                    ) || 0;


                x +=
                    movimentoCenarioX;

                y +=
                    movimentoCenarioY;


                /*
                 * ==================================================
                 * SEM BARREIRA
                 * ==================================================
                 *
                 * O avatar pode ser movido livremente.
                 */

                avatar.style.left =
                    x + "px";


                avatar.style.top =
                    y + "px";

            }
        );


        /*
         * ======================================================
         * POINTER UP
         * ======================================================
         */

        avatar.addEventListener(
            "pointerup",
            function (evento) {

                ponteiros.delete(
                    evento.pointerId
                );


                if (
                    ponteiros.size >= 2
                ) {

                    return;
                }


                if (
                    arrastandoEsteAvatar &&
                    avatarArrastando === avatar
                ) {

                    arrastandoEsteAvatar =
                        false;

                    avatarArrastando =
                        null;


                    /*
                     * Salva posição.
                     */

                    posicoesSalvas[nome] = {

                        x:
                            parseFloat(
                                avatar.style.left
                            ) || 0,

                        y:
                            parseFloat(
                                avatar.style.top
                            ) || 0
                    };


                    salvarPosicoes();


                    try {

                        avatar.releasePointerCapture(
                            evento.pointerId
                        );

                    } catch (erro) {

                        // Nada a fazer
                    }
                }


                if (
                    ponteiros.size < 2
                ) {

                    gestoAnterior =
                        null;
                }

            }
        );


        /*
         * ======================================================
         * POINTER CANCEL
         * ======================================================
         */

        avatar.addEventListener(
            "pointercancel",
            function (evento) {

                ponteiros.delete(
                    evento.pointerId
                );

                arrastandoEsteAvatar =
                    false;

                avatarArrastando =
                    null;

                gestoAnterior =
                    null;
            }
        );


        /*
         * ======================================================
         * CARREGAMENTO
         * ======================================================
         */

        avatar.onload =
            function () {

                console.log(
                    "CARREGOU:",
                    arquivo
                );
            };


        avatar.onerror =
            function () {

                console.error(
                    "NÃO CARREGOU:",
                    arquivo
                );
            };


        avatares.appendChild(
            avatar
        );
    }


    /*
     * ==========================================================
     * CRIA OS 46 AVATARES PRINCIPAIS
     * ==========================================================
     */

    function criarAvatares() {

        avatares.innerHTML = "";


        /*
         * Primeiro os 46 principais.
         */

        nomesAvatares.forEach(
            function (nome, indice) {

                criarAvatar(
                    nome,
                    indice,
                    nome,
                    false
                );
            }
        );


        /*
         * Depois recria visitantes salvos.
         */

        visitantesSalvos.forEach(
            function (visitante, indice) {

                criarAvatar(
                    visitante.id,
                    100 + indice,
                    visitante.arquivo,
                    true
                );
            }
        );


        console.log(
            "AVATARES PRINCIPAIS:",
            nomesAvatares.length
        );


        console.log(
            "VISITANTES:",
            visitantesSalvos.length
        );
    }


    /*
     * ==========================================================
     * ADICIONAR VISITANTE
     * ==========================================================
     */

    function adicionarVisitante(tipo) {

        const masculino =
            tipo === "homem";


        const numero =
            Math.floor(
                Math.random() * 5
            ) + 1;


        const arquivo =
            masculino
                ? "visitante homem " + numero
                : "visitante mulher " + numero;


        /*
         * ID único.
         */

        const id =
            "visitante_" +
            Date.now() +
            "_" +
            Math.floor(
                Math.random() * 100000
            );


        /*
         * Posição inicial.
         *
         * Coloca visitantes próximos
         * da região central do auditório.
         */

        const indice =
            visitantesSalvos.length;


       const coluna = indice % 3;

const linha = Math.floor(indice / 3);

const posicao = {
    x: 5000 + coluna * 300,
    y: 1200 + linha * 400
};


        /*
         * Guarda visitante.
         */

        visitantesSalvos.push({

            id:
                id,

            tipo:
                tipo,

            arquivo:
                arquivo
        });


        /*
         * Guarda posição.
         */

        posicoesSalvas[id] =
            posicao;


        salvarVisitantes();

        salvarPosicoes();


        /*
         * Cria somente o novo avatar.
         */

        criarAvatar(
            id,
            100 + visitantesSalvos.length,
            arquivo,
            true
        );


        console.log(
            "VISITANTE ADICIONADO:",
            arquivo
        );
    }


    /*
     * ==========================================================
     * EXCLUIR TODOS OS VISITANTES
     * ==========================================================
     */

    function excluirVisitantes() {

        if (
            visitantesSalvos.length === 0
        ) {

            return;
        }


        /*
         * Remove posições dos visitantes.
         */

        visitantesSalvos.forEach(
            function (visitante) {

                delete posicoesSalvas[
                    visitante.id
                ];
            }
        );


        /*
         * Limpa lista.
         */

        visitantesSalvos = [];


        salvarVisitantes();

        salvarPosicoes();


        /*
         * Recria somente os 46 principais.
         */

        criarAvatares();


        console.log(
            "TODOS OS VISITANTES FORAM EXCLUÍDOS."
        );
    }


    /*
     * ==========================================================
     * BOTÃO VISITANTES
     * ==========================================================
     */

    btnVisitantes.addEventListener(
        "click",
        function () {

            menuVisitantes.classList.toggle(
                "aberto"
            );
        }
    );


    /*
     * ==========================================================
     * ADICIONAR HOMEM
     * ==========================================================
     */

    btnAdicionarHomem.addEventListener(
        "click",
        function () {

            adicionarVisitante(
                "homem"
            );
        }
    );


    /*
     * ==========================================================
     * ADICIONAR MULHER
     * ==========================================================
     */

    btnAdicionarMulher.addEventListener(
        "click",
        function () {

            adicionarVisitante(
                "mulher"
            );
        }
    );


    /*
     * ==========================================================
     * EXCLUIR VISITANTES
     * ==========================================================
     */

    btnExcluirVisitantes.addEventListener(
        "click",
        function () {

            const confirmar =
                confirm(
                    "Deseja excluir todos os visitantes do auditório?"
                );


            if (!confirmar) {
                return;
            }


            excluirVisitantes();
        }
    );


    /*
     * ==========================================================
     * RESETAR
     * ==========================================================
     */

    btnResetar.addEventListener(
        "click",
        function () {

            const confirmar =
                confirm(
                    "Tem certeza que deseja resetar as posições dos 46 avatares e remover todos os visitantes?"
                );


            if (!confirmar) {
                return;
            }


            /*
             * Apaga todas as posições.
             */

            localStorage.removeItem(
                CHAVE_POSICOES
            );


            posicoesSalvas = {};


            /*
             * Remove visitantes.
             */

            visitantesSalvos = [];


            localStorage.removeItem(
                CHAVE_VISITANTES
            );


            /*
             * Recria somente os 46.
             */

            criarAvatares();


            console.log(
                "AUDITÓRIO RESETADO."
            );
        }
    );


    /*
     * ==========================================================
     * POINTERS NO CENÁRIO
     * ==========================================================
     */

    cenario.addEventListener(
        "pointerdown",
        function (evento) {

            if (
                evento.target.classList.contains(
                    "avatar"
                )
            ) {

                return;
            }


            ponteiros.set(
                evento.pointerId,
                {
                    x:
                        evento.clientX,

                    y:
                        evento.clientY,

                    avatar:
                        null
                }
            );


            if (
                ponteiros.size >= 2
            ) {

                iniciarGesto();
            }

        }
    );


    cenario.addEventListener(
        "pointermove",
        function (evento) {

            if (
                ponteiros.has(
                    evento.pointerId
                )
            ) {

                ponteiros.set(
                    evento.pointerId,
                    {
                        x:
                            evento.clientX,

                        y:
                            evento.clientY,

                        avatar:
                            null
                    }
                );
            }


            if (
                ponteiros.size >= 2
            ) {

                evento.preventDefault();

                atualizarGesto();
            }

        }
    );


    cenario.addEventListener(
        "pointerup",
        function (evento) {

            ponteiros.delete(
                evento.pointerId
            );


            if (
                ponteiros.size < 2
            ) {

                gestoAnterior =
                    null;
            }

        }
    );


    cenario.addEventListener(
        "pointercancel",
        function (evento) {

            ponteiros.delete(
                evento.pointerId
            );

            gestoAnterior =
                null;

            avatarArrastando =
                null;
        }
    );


    /*
     * ==========================================================
     * ZOOM COM RODA DO MOUSE
     * ==========================================================
     */

    cenario.addEventListener(
        "wheel",
        function (evento) {

            evento.preventDefault();


            const fator =
                evento.deltaY < 0
                    ? 1.15
                    : 0.87;


            const mouseX =
                evento.clientX;

            const mouseY =
                evento.clientY;


            const mundoX =
                (
                    mouseX -
                    deslocamentoX
                ) / escalaAtual;


            const mundoY =
                (
                    mouseY -
                    deslocamentoY
                ) / escalaAtual;


            let novaEscala =
                escalaAtual *
                fator;


            novaEscala =
                Math.max(
                    escalaBase *
                    ZOOM_MINIMO,

                    Math.min(
                        escalaBase *
                        ZOOM_MAXIMO,

                        novaEscala
                    )
                );


            deslocamentoX =
                mouseX -
                mundoX *
                novaEscala;


            deslocamentoY =
                mouseY -
                mundoY *
                novaEscala;


            escalaAtual =
                novaEscala;


            aplicarTransformacao();

        },
        {
            passive: false
        }
    );


    /*
     * ==========================================================
     * PAN COM BOTÃO DO MEIO
     * ==========================================================
     */

    let movendoVisao = false;

    let ultimoMouseX = 0;

    let ultimoMouseY = 0;


    cenario.addEventListener(
        "pointerdown",
        function (evento) {

            if (
                evento.button === 1
            ) {

                evento.preventDefault();


                movendoVisao =
                    true;


                ultimoMouseX =
                    evento.clientX;

                ultimoMouseY =
                    evento.clientY;


                cenario.setPointerCapture(
                    evento.pointerId
                );
            }

        }
    );


    cenario.addEventListener(
        "pointermove",
        function (evento) {

            if (!movendoVisao) {
                return;
            }


            evento.preventDefault();


            const movimentoX =
                evento.clientX -
                ultimoMouseX;


            const movimentoY =
                evento.clientY -
                ultimoMouseY;


            deslocamentoX +=
                movimentoX;


            deslocamentoY +=
                movimentoY;


            ultimoMouseX =
                evento.clientX;

            ultimoMouseY =
                evento.clientY;


            aplicarTransformacao();
        }
    );


    cenario.addEventListener(
        "pointerup",
        function (evento) {

            if (!movendoVisao) {
                return;
            }


            movendoVisao =
                false;


            try {

                cenario.releasePointerCapture(
                    evento.pointerId
                );

            } catch (erro) {

                // Nada a fazer
            }
        }
    );


    /*
     * ==========================================================
     * REDIMENSIONAMENTO
     * ==========================================================
     */

   window.addEventListener(
    "resize",
    function () {

        reajustarParaNovaTela();

    }
);



    /*
     * ==========================================================
     * INICIALIZAÇÃO
     * ==========================================================
     */

    if (
        auditorio.complete &&
        auditorio.naturalWidth > 0
    ) {

        calcularEscalaBase();

        criarAvatares();

    } else {

        auditorio.onload =
            function () {

                calcularEscalaBase();

                criarAvatares();

            };
    }

});