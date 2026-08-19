# PROMPT MESTRE — Reconstrução do site CBE (Corrêa Barbosa Engenharia)

Você vai reconstruir o site institucional da CBE, empresa de engenharia especializada em quadros elétricos sob medida, em Uberlândia/MG. Este prompt consolida decisões de produto, conteúdo e direção de arte já validadas — siga-o com precisão, especialmente as seções "NÃO FAZER", que existem porque tentativas anteriores já caíram nesses erros.

Stack obrigatória: **HTML/CSS/JS puro (sem framework de UI)**, GSAP (animação + ScrollTrigger), Swup (transição de página), Three.js (apenas se indicado). Não usar React, Vue ou similares.

---

## 1. IDENTIDADE VISUAL — a peça que estava faltando

O site já passou por duas rodadas de construção. As rodadas anteriores ficaram tecnicamente funcionais mas visualmente genéricas — "cara de site gerado por IA sem direção": fundo 100% branco do início ao fim, ícones de emoji/flaticon, cards com sombra leve e ícone-título-texto empilhados, textos longos e explicativos. Esta rodada corrige isso com uma identidade de verdade.

### 1.1 Paleta e uso de cor por função
- **Azul CBE** `#314E8A` (e variação escura `#1F3363` para texto sobre fundo claro/hover): usado como **cor de bloco sólido cheio** em seções de **credibilidade técnica e institucional** — normas, ensaios/laboratório, "Sobre Nós", rodapé. Tom sério, de autoridade.
- **Vermelho CBE** `#EC3237` (e variação escura `#B8181D`): usado como **cor de bloco sólido cheio** em seções de **ação/urgência** — CTA de orçamento, convites a contato imediato. Tom mais energético.
- **Base neutra**: off-white `#FBFBFA` para o corpo do conteúdo (não branco puro `#FFFFFF` — usar off-white sutilmente aquecido para não parecer "documento vazio").
- **Regra de ritmo**: o site deve alternar entre seções de fundo claro (conteúdo, respiro, leitura) e seções de bloco de cor sólida cheia (pontuação, ênfase, chamada à ação) — nunca mais que 2-3 seções claras seguidas sem uma seção de cor cheia quebrando o ritmo. Referência direta: o site https://mrcnegocios.com.br usa esse princípio com sucesso no mesmo setor (elétrico/industrial) — mesma lógica de alternância, cores trocadas para as da CBE.

### 1.2 Elementos gráficos de identidade (novos, não existiam antes)
- **Cortes diagonais entre seções**: ao invés de transições retas horizontais entre blocos de cor, usar um corte diagonal sutil (`clip-path: polygon(...)`) na borda superior ou inferior de seções de cor cheia — dá dinamismo sem ser decoração vazia. Referência visual: hero do site MRC, onde a foto do produto é cortada por uma diagonal que separa do fundo branco.
- **Selo/emblema rotativo**: considerar um elemento circular pequeno, com texto contornando o círculo (via `<path>` de SVG + `<textPath>`) e um ícone central (seta, ou o símbolo CBE simplificado), girando lentamente via CSS `@keyframes rotate` infinito. Pode ser usado como elemento de destaque perto de CTAs ou na seção "Sobre Nós", como um selo de "veja mais"/"conheça a CBE". Referência: elemento circular giratório do site MRC (ver imagem de referência "MRC NEGÓCIOS · MRC NEGÓCIOS", ícone com seta central).

### 1.3 Botões — padrão de formato
- Botões primários: formato pill (`border-radius: 999px`), não retângulo com cantos levemente arredondados como antes.
- Botão com ícone: texto + ícone circular embutido à direita (círculo preenchido contendo uma seta ou ícone pequeno), separado visualmente do texto. Referência: botões "INSCREVER-SE" e "CONTATO" do site WebHub (ver imagem de referência) — manter esse *formato* (pill + ícone circular à direita), mas na paleta CBE (azul ou vermelho sólido, texto branco), não no estilo dark/gradiente do exemplo.

---

## 2. TIPOGRAFIA (já definida, manter)
- Títulos: **Space Grotesk** (pesos 500/600/700)
- Corpo: **Inter** (pesos 400/500/600)
- Dados técnicos/specs (números, normas, medidas): **JetBrains Mono** (pesos 400/500)
- Carregar via Google Fonts.

---

## 3. PRINCÍPIO DE CONTEÚDO — "mostrar, não explicar"

Este é o princípio central e mais importante do projeto: **o site depende de elementos visuais e interativos para provar competência técnica, não de blocos de texto tentando convencer.**

Regras práticas de copywriting:
- **Fato concreto, nunca frase de efeito genérica.** Teste: se a frase serve para qualquer concorrente do setor sem perder sentido, está genérica demais e deve ser reescrita com detalhe técnico real, processo real, ou consequência prática específica.
  - Ruim (genérico): "Engenharia elétrica de alta precisão sem desperdício de materiais."
  - Bom (concreto): "A gente não corta um barramento sem calcular corrente de curto-circuito e tipo de partida do motor primeiro. É isso que evita voltar depois pra trocar disjuntor."
- **Tom conversacional, não institucional.** Pode usar "a gente", frases mais curtas, uma pausa/ressalva natural — como alguém da equipe explicando, não um comunicado corporativo em terceira pessoa. Mas informalidade não é desculpa para vago: o dado técnico real continua sustentando a frase.
- **Texto é rótulo/legenda, não parágrafo de convencimento.** Sempre que possível, um número, uma norma técnica, ou um rótulo mono substituem um parágrafo explicativo. A prova é visual/interativa; o texto só nomeia o que já está sendo mostrado.

### NÃO FAZER (erros já cometidos em tentativas anteriores, não repetir):
- ❌ Ícones de emoji ou flaticon genéricos (🛡️ ⚙️ 🧪 🏠 🏢 🏭). Se um ícone for necessário, deve ser desenhado como SVG de linha customizado, coerente com a identidade — nunca um emoji ou ícone de biblioteca genérica óbvia.
- ❌ Cards com estrutura "ícone no topo + título + parágrafo + sombra leve" repetidos em grade — é o padrão mais batido de landing page SaaS genérica.
- ❌ Badges/pills com bolinha pulsante tipo indicador "ao vivo" (ex: tag "● ENGENHARIA DE ALTA PERFORMANCE" com ponto piscando).
- ❌ Rachuras, formas orgânicas abstratas decorativas de fundo sem função.
- ❌ Blocos de estatística empilhados em grid sob o texto principal sem contexto (ex: "100% ✓ / IP54/65 ✓ / NBR 5410 ✓" em caixinhas soltas).
- ❌ Legendas defensivas do tipo "fotos reais da fábrica" — se a foto é real, ela não precisa se explicar.
- ❌ Parágrafos longos explicando o que a empresa faz de forma abstrata ("Projetamos e montamos painéis de distribuição, centros de controle de motores... em estrita conformidade com...").

---

## 4. PÚBLICO E ARQUITETURA DE CONTEÚDO

Dois perfis de visitante atravessam o site inteiro:
- **Leigo**: chega com um problema/desejo concreto (ex: "quero instalar uma banheira de hidromassagem"), não sabe terminologia técnica.
- **Técnico** (eletricista, engenheiro, projetista): já sabe exatamente o que precisa e fala a língua técnica (kVA, circuitos, tipo de partida, corrente de curto-circuito).

### 4.1 Página "Quadros Elétricos" (catálogo)
Vitrine do trabalho já realizado pela CBE — não é onde o orçamento é feito, é prova de capacidade técnica. Organizar por categoria real (Residencial, Comercial, Industrial), com fotos reais (ver seção 6) e specs técnicas em formato mono (kVA, grau de proteção IP, norma aplicável) — não em parágrafo.

### 4.2 Página "Orçamento" (o coração da diferenciação)
Dois caminhos diferentes, escolhidos pela própria pessoa logo na entrada — não um formulário único genérico:
1. **Caminho técnico** ("Sei o que preciso"): formulário direto com campos técnicos reais desde o início — kVA, quantidade de circuitos, tipo de partida de motor, corrente de curto-circuito (Icc), tensão de operação, grau de proteção.
2. **Caminho leigo/orientação guiada** ("Tenho uma necessidade, não sei o que preciso"): fluxo guiado (perguntas simples) + campo de descrição livre.

Em ambos os caminhos, deixar claro (visualmente, não só em texto pequeno) que **o site não calcula nada tecnicamente sozinho** — ele coleta e estrutura a demanda; a decisão técnica final é sempre humana, feita pela equipe de engenharia da CBE depois, por contato direto. Isso já existia na versão anterior como uma caixa de aviso — manter esse princípio, mas integrar visualmente ao invés de ser só um card de alerta azul claro isolado.

### 4.3 Nova seção — Parceiros/Marcas atendidas
Adicionar um bloco (pode ser na Home, próximo ao rodapé, ou em "Sobre Nós") com uma fileira horizontal de logos de parceiros/clientes/marcas de componentes trabalhados — em estilo monocromático ou baixo contraste (não colorido chamativo), fileira simples, eventualmente com leve scroll automático horizontal infinito (ver referência: grade de logos de concessionárias no rodapé do site MRC). **Os logotipos específicos ainda não foram fornecidos** — implementar a estrutura/seção com placeholders claramente nomeados, prontos para receber os arquivos reais depois.

---

## 5. SPLASH SCREEN (entrada do site) — especificação já validada, manter exatamente assim

Não é uma tela de carregamento — é uma introdução coreografada:

1. A logo CBE (símbolo + texto "Corrêa Barbosa Engenharia", como **bloco único**, respeitando a proporção exata do arquivo `assets/logo/logo-cbe.svg`) aparece centralizada na tela, revelada por uma **máscara/clip-path progressivo da esquerda para a direita** (efeito "cortina abrindo") — like `clip-path: inset(0 100% 0 0)` animando até `inset(0 0% 0 0)` via GSAP, duração ~1.4s, easing `power3.inOut`.
   - **Importante**: a logo já aparece com sua cor e proporção finais durante todo o reveal — não usar efeito de "desenhar contorno"/stroke-dasharray. Testamos essa abordagem antes e o resultado ficou ruim (a logo em traço fino, sem o peso visual do preenchimento, parece fraca quando exibida grande e sozinha).
2. Após o reveal, breve pausa (~0.3s).
3. A logo inteira anima (via GSAP, calculando `getBoundingClientRect()` de origem e destino) até a posição exata onde ela fica fixa no header — movimento de escala + translação, ~1.2s.
4. A tela da splash faz fade out (~0.4s), revelando o conteúdo principal da página por trás, já com a logo posicionada corretamente no header.
5. Duração total da sequência: entre 3.3s e 3.5s.
6. **Fundo da splash**: não usar branco puro isolado — considerar o fundo off-white padrão do site, ou um fundo com leve textura/gradiente muito sutil condizente com a nova identidade (não voltar a usar fundo escuro, que já foi testado e rejeitado nas versões anteriores).
7. Comportamento de repetição: usar `sessionStorage` — a splash aparece de novo apenas quando o navegador/aba for fechado de verdade e reaberto, nunca a cada F5/recarregamento dentro da mesma sessão.

---

## 6. TRANSIÇÃO ENTRE PÁGINAS (Swup) — especificação já validada, manter exatamente assim

- O overlay de transição deve conter a **logo CBE real** (versão monocromática branca, `assets/logo/logo-cbe-mono-white.svg`), centralizada, sobre fundo de cor sólida da marca (alternar entre azul e vermelho conforme a seção de origem/destino, ou fixar em azul — decisão de implementação).
- Movimento da transição: **opacidade + leve escala apenas** (fade in/out do overlay, logo com scale de ~0.92 para 1). **Não usar deslocamento de posição** (`translateY`/`translateX` tipo "cortina que desliza de um lado e sai pelo outro") — essa abordagem já foi testada e o resultado pareceu "exagerado, tipo vai e volta".
- Duração total do ciclo (cobrir + revelar): entre 0.7s e 0.9s.
- Configurar Swup com `preventRunning: true` para evitar bugs de clique duplo/concorrência durante transição.
- Resetar scroll (`window.scrollTo(0, 0)`) a cada transição de página.
- `pointer-events: none` no overlay quando transparente, para não bloquear cliques.

---

## 7. HERO DA HOME — nova direção (3D real descartado por ora)

Tentativas anteriores usaram modelos 3D reais (Three.js) no hero, mas o resultado visual ficou ruim/deselegante mesmo com os modelos tecnicamente corretos. **Não usar Three.js no hero nesta rodada.**

Nova direção: **fotografia tratada com apresentação que simula profundidade**, não 3D real:
- Foto de produto (painel elétrico, ou outro produto CBE) com fundo removido/tratado (fundo neutro ou integrado ao fundo da seção).
- Efeito de profundidade via **parallax leve no scroll** (a foto se move a uma velocidade ligeiramente diferente do restante do conteúdo, criando sensação de camadas) e/ou **sombra flutuante** projetada abaixo do objeto (sombra elíptica desfocada, não sombra realista de chão) para dar sensação de "objeto suspenso".
- Pode incluir leve rotação/tilt 3D via CSS (`transform: perspective() rotateY()`) reagindo sutilmente à posição do mouse, para reforçar a sensação de profundidade sem ser modelo 3D de verdade.
- Layout: texto à esquerda (título curto e direto seguindo o princípio da seção 3, sem parágrafo longo), produto em destaque à direita, com 2-3 rótulos técnicos mono flutuando próximos ao produto (ex: "IP54", "NBR 5410") em vez de bloco de estatística.
- As fotos reais dos produtos da CBE já existem no projeto em `assets/images/` (residencial, comercial, industrial) — usar essas como base, tratando o fundo se necessário.

---

## 8. ASSETS JÁ EXISTENTES NO PROJETO — reaproveitar, não recriar

- `assets/logo/logo-cbe.svg` — logo vetorial limpa, 3 paths de cor sólida (azul `#314E8A`, vermelho `#EC3237`, texto escuro), pronta para uso.
- `assets/logo/logo-cbe-mono-white.svg` — versão monocromática branca da logo, para uso sobre fundos escuros/coloridos (overlay de transição, rodapé se for de cor cheia).
- `assets/images/residencial/`, `/comercial/`, `/industrial/` — fotos reais de quadros já fotografados.
- `assets/data/catalogo-quadros.json` — estrutura de dados do catálogo, já populada.
- `contents/*.glb` — modelos 3D (electric_box, solar_panel, bmw_korea_i-home_charger, mcb-box) — **não usar no hero nesta rodada** (ver seção 7), mas manter os arquivos no projeto para uso futuro possível em outra seção, caso façam mais sentido lá.

---

## 9. ESTRUTURA DE PÁGINAS (sem mudança em relação à versão anterior)
1. **Home** (`index.html`) — hero, seção de credibilidade técnica (bloco de cor cheia, ver seção 1.1), catálogo em destaque, CTA de orçamento (bloco de cor cheia), parceiros, rodapé.
2. **Quadros Elétricos** (`quadros-eletricos.html`) — catálogo completo, filtros por categoria.
3. **Orçamento** (`orcamento.html`) — os dois caminhos (técnico / guiado).
4. **Sobre Nós** (`sobre.html`) — institucional, pode usar bloco azul cheio para reforçar autoridade técnica.
5. **Contato** (`contato.html`) — informações de contato + formulário.

---

## 10. CHECKLIST FINAL DE ACEITE
- [ ] Existe alternância visível entre seções de fundo claro e seções de bloco de cor sólida (azul ou vermelho) — o site não é mais 100% branco do início ao fim.
- [ ] Nenhum ícone de emoji ou flaticon genérico está presente em nenhuma página.
- [ ] Nenhum card segue o padrão "ícone + título + parágrafo + sombra" repetido em grade sem alguma característica distintiva de identidade.
- [ ] A splash screen revela a logo por máscara/clip-path (não por desenho de contorno), mantendo proporção e cor finais durante todo o processo.
- [ ] A transição entre páginas usa a logo real dentro do overlay, com movimento de opacidade/escala (não deslocamento de posição).
- [ ] O hero da Home não usa Three.js/3D real — usa fotografia tratada com efeito de profundidade (parallax/sombra/tilt).
- [ ] Existe uma seção (ainda que com placeholders) reservada para logos de parceiros.
- [ ] Todo texto persuasivo foi revisado contra o teste "serviria para qualquer concorrente?" — se sim, foi reescrito com fato concreto específico da CBE.
