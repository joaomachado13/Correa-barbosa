# Home institucional e páginas de cada frente

Preparado em 19/11/2026 a partir de `dc9195a`. A página inicial deixa de funcionar como uma apresentação exclusiva de quadros elétricos e passa a apresentar a CBE e suas frentes ativas.

## Organização

- A primeira tela apresenta Quadros Elétricos e Energia Solar com o mesmo destaque, fotografia e acesso direto à página específica. Os dois títulos ficam visíveis sem rolagem nos tamanhos conferidos.
- A home apresenta a empresa, explica o início do atendimento e oferece um formulário geral. Catálogo, filtros e informações técnicas de quadros continuam em `quadros-eletricos.html`, que também recebe perguntas frequentes específicas. A análise solar permanece em `energia-fotovoltaica.html`.
- Cabeçalho institucional, rodapé e mensagem inicial do widget atendem às diferentes demandas da CBE. O botão do cabeçalho acompanha a página: formulário geral na home, orçamento de quadros no catálogo e análise solar na página fotovoltaica.
- Novas frentes entram nos acessos da home e nas opções do formulário quando forem ativadas no cadastro. As quatro áreas ainda em rascunho continuam fora do build público.

`templates/home-main.html` contém o conteúdo da home; `scripts/home.mjs` gera cartões e opções a partir de `assets/data/frentes.json`. `homeTitulo` é um nome curto opcional para o cartão, sem substituir o nome completo da frente. `css/home.css` utiliza tokens, fontes e cores existentes. As folhas de estilo estão disponíveis também nas demais páginas para navegação Swup.

O formulário prepara a mensagem para revisão, sem enviá-la ou apagar os campos. Aceita uma frente específica ou orientação geral. O e-mail é opcional; nome, telefone, área e descrição são obrigatórios. Nenhum orçamento, prazo ou resultado financeiro foi acrescentado como promessa.

## Conferência

Escopo: home, entrada em Quadros/Solar, cabeçalho compartilhado, formulário geral, FAQ de quadros e regressão das oito rotas públicas. Conferência visual real em Chromium, com desktop 1440×1000, mobile 390×844 e 320×844. A suíte também cobre largura de 901 px, ausência de JavaScript, teclado, retorno via Swup, contraste com axe e ampliação de texto para 200% em 390 px.

`npm test`: **11 testes de lógica/build e 20 testes de navegador passaram**. Os testes conferem as duas frentes na primeira tela, seleção de solar e orientação geral na mensagem, preservação de dados, inclusão futura de uma frente, escape editorial e exclusão de rascunhos. O build normal gera oito páginas e duas frentes. Também foram executados `npm run frentes:validar` e `git diff --check`.

Evidências locais em `/workspace/cbe-home-evidence/`: `antes-desktop.png`, `antes-mobile.png`, `depois-desktop.png`, `depois-390.png`, `depois-320.png`, `institucional-desktop.png`, `contato-desktop.png` e `mensagem-mobile.png`. As fotografias já pertenciam ao projeto/portfólio documentado. A documentação da frente solar mantém as fontes das instalações fotovoltaicas.

| Achado | Critérios | Impacto | Correção e revalidação |
| --- | --- | --- | --- |
| Início apresentava somente quadros, embora o site já oferecesse energia solar | V2-06, V2-07, V2-09, V2-10 | A segunda frente ficava distante da entrada principal | Cartões equivalentes na primeira tela, conferidos em quatro larguras e no fluxo de navegação. |
| Formulário e atalhos institucionais partiam de um pedido de quadro elétrico | V2-02, V2-10, C-01 | Demanda solar ou geral começava com contexto incorreto | Área de interesse, opção de orientação e mensagem geral; botão de orçamento acompanha a página. |
| Alteração do destino padrão do cabeçalho afetou o link solar sem JS na primeira execução dos testes | C-02 | Atalho solar levava ao contato geral nesse estado | Marcadores `data-quote-link` permitem ao gerador aplicar o destino correto sem depender do href anterior; regressão sem JS passou. |

## Matriz visual

Limitada aos componentes novos e às integrações alteradas. As verificações automáticas e capturas não representam certificação completa do site.

| IDs | Status | Evidência ou motivo |
| --- | --- | --- |
| V1-01 | Exceção justificada | CTAs arredondados seguem a marca; cartões representam escolhas reais de área, sem tags de preenchimento. |
| V1-02, V1-03 | Não aplicável | Sem itálico ou Instrument Serif nos componentes novos. |
| V1-04 | Exceção justificada | Tracking da tipografia existente preservado; leitura e acentos conferidos nos tamanhos inspecionados. |
| V1-05, V1-06, V1-07, V1-08 | Conforme | Entrada focada nas áreas, tokens existentes, agrupamento por espaço; cartões e formulário têm função de escolha/atendimento. |
| V1-09 | Não aplicável | Sem diagramas na nova home. |
| V1-10, V1-11 | Conforme | Resumos por área e instruções de atendimento; sem caminhos de código decorativos. |
| V1-12 | Exceção justificada | Numeração apenas nas três etapas de início do atendimento. |
| V1-13, V1-14, V1-15 | Não aplicável | Sem microtítulos ornamentais, dithering ou ASCII. |
| V1-16 | Conforme | Raios seguem os componentes existentes; sem geometria nova arbitrária. |
| V1-17, V1-18, V1-19, V1-20 | Conforme | Conteúdo novo sem mono/caixa alta decorativa, fundo sólido e títulos sem pontos ornamentais. |
| V2-01 | Não aplicável | Sem novos selos ou métricas promocionais. |
| V2-02, V2-03, V2-04 | Conforme | Rótulos explícitos, opcionais identificados, sem itálico ou mono de preenchimento. |
| V2-05 | Conforme | Tokens, CTA e preparação de mensagem reutilizados; áreas derivadas de um cadastro único. |
| V2-06, V2-07 | Conforme | Fotografias do acervo e duas frentes em escala equivalente, com títulos visíveis na primeira tela. |
| V2-08, V2-09, V2-10 | Conforme | Empresa, áreas e atendimento organizados por proximidade; ações levam à página e ao formulário correspondentes. |
| V2-11, V2-12, V2-13 | Conforme | Azul/vermelho de marca, ícones vetoriais consistentes e ausência de efeitos novos de preenchimento. |
| V2-14 | Não aplicável | Sem contornos arredondados aninhados equidistantes. |
| V2-15, V2-16, V2-17 | Conforme | Axe, capturas reais, largura do conteúdo e texto em 200%; foco visível e acesso por teclado preservados. |
| V2-18 | Não aplicável | Sem novas métricas ou valores numéricos para comparação. |
| V2-19 | Conforme | Imagens com espaço reservado; destaque inicial carregado diretamente e fotos secundárias lazy. Formulário local e síncrono, sem simular entrega remota. |
| V2-20 | Exceção justificada | Escolha de área direta e feedback textual com foco na revisão; não exige animação. Redução de movimento testada. |

Limites: sem envio real de mensagens, teste de recebimento na conta comercial ou estimativa de geração solar. As páginas das quatro novas áreas em preparação continuam em rascunho. A mudança não constitui reauditoria editorial de todas as alegações técnicas anteriores nas páginas existentes.
