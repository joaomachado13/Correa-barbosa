# Primeira nova frente: energia solar fotovoltaica

Implementação preparada em 19/11/2026 para integrar a branch `main`. O histórico do Git registra o envio desta entrega. O status `publicada` no cadastro significa inclusão no build normal; não significa que a hospedagem foi atualizada.

## Resultado

- `solucoes.html` apresenta Quadros Elétricos e Energia Solar Fotovoltaica. Projetos/Laudos, Consultorias/Comissionamento, Instalações e Automação continuam em rascunho.
- `energia-fotovoltaica.html` apresenta projeto e instalação para residências e empresas, seis instalações do portfólio, etapas de atendimento, perguntas frequentes e formulário solar.
- O formulário solicita nome, telefone, cidade e tipo de imóvel. Valor da conta, consumo e observações são opcionais. A mensagem é preparada localmente e revisada antes de o visitante abrir o WhatsApp; os dados continuam preenchidos. Alterações invalidam a versão anterior da mensagem.
- Os botões de orçamento do cabeçalho acompanham a frente: na página solar levam ao formulário solar, inclusive após navegação Swup. Nas páginas geradas das outras áreas, levam ao contato com a área selecionada.
- A descrição institucional do rodapé passa a abranger quadros e sistemas fotovoltaicos.
- Não foram incluídos preços, prazos, projeções de economia, financiamento, garantias comerciais ou depoimentos sem fonte. As potências são as identificações das instalações no portfólio, não previsões de geração.

## Como editar

1. Em `assets/data/frentes.json`, localizar `energia-fotovoltaica`. Editar nome, resumo, introdução, grupos e `cases`. Cada case contém nome, cidade, tipo (`Residencial` ou `Comercial`), potência numérica em kWp e imagem local com alt e dimensões reais.
2. Os demais textos e a estrutura específica da página estão em `scripts/solar.mjs`; a apresentação usa `css/solar.css` e os tokens existentes. O HTML final é gerado; não editar `dist/energia-fotovoltaica.html` diretamente.
3. Executar `npm run frentes:validar`, `npm test` e `npm run dev`. Abrir `/solucoes.html` ou `/energia-fotovoltaica.html` na prévia da porta 8000. Reiniciar o comando após alterações.
4. Quando a versão for enviada ao Git e publicada pelo fluxo da equipe, publicar o conteúdo de `dist/`. A mudança de status no JSON não executa essas ações.

O domínio de publicação continua sendo definido por `SITE_URL`. O teste de build verifica canonical, imagem própria, sitemap e dados estruturados `Service` com um domínio reservado de teste; nenhum domínio fictício fica no build normal.

## Fontes do conteúdo e das fotografias

Referências consultadas por HTTPS em 19/11/2026: [empresa](https://cbe.eng.br/empresa), [serviços](https://cbe.eng.br/produtos-e-servicos) e [cases](https://cbe.eng.br/cases). Fotografias originais copiadas para `assets/images/solar/`, sem alteração dos arquivos, e inspecionadas visualmente.

| Instalação | Cidade | Potência do portfólio | Foto original |
| --- | --- | --- | --- |
| Residencial — Condomínio Cyrela | Uberlândia/MG | 19,8 kWp | [residencial-cyrela.jpeg](https://cbe.eng.br/img/cases/1030424877/Residencial_Cyrela_19,8kWp.jpeg) |
| Condomínio residencial | Uberlândia/MG | 40,92 kWp | [condominio-vertical.jpg](https://cbe.eng.br/img/cases/1030422891/Condominio_Vertical_40,92kWp.jpg) |
| Clínica médica | Prata/MG | 17,16 kWp | [clinica-prata.jpeg](https://cbe.eng.br/img/cases/1030423613/Comercial_Cl%C3%ADnica_17,16kWp.jpeg) |
| Metalúrgica | Uberlândia/MG | 31,2 kWp | [metalurgica.jpeg](https://cbe.eng.br/img/cases/1030420091/Comercial_31,2kW_Metalurgica.jpeg) |
| Instalação comercial — Tubalina | Uberlândia/MG | 46,2 kWp | [comercial-tubalina.jpeg](https://cbe.eng.br/img/cases/1162911632/a.jpeg) |
| Escritório CBE | Uberlândia/MG | 9,1 kWp | [escritorio-cbe.jpeg](https://cbe.eng.br/img/cases/1030418203/Comercial_9,1kW_CBE.jpeg) |

Foram usados seis dos 18 cases identificados no legado. Showroom Multivisi e Galpão Américo não foram incluídos porque suas legendas e nomes de arquivo trazem potências diferentes. A seleção não atribui datas de instalação ou economia aos projetos. As fotos usam o armazenamento local, sem depender do site antigo durante a visita.

## Conferência executada

Alvo: página solar, entrada pela central, cabeçalho, formulário solar e regressão das rotas existentes. Chromium local; renderização real em desktop 1440×1000 e mobile 390×844 e 320×800. A suíte confere as oito rotas públicas em 1440, 901, 390 e 320 px. Também foi verificada ampliação de texto para 200% em 390 px, sem conteúdo da página fora da largura.

`npm test`: **11 testes de lógica/build e 18 testes de navegador passaram**. A cobertura inclui dados inválidos, arquivos ausentes, escape editorial, inclusão/exclusão de frentes, SEO, fotos e dimensões reais, navegação Swup, formulário sem consumo informado, telefone inválido, edição da mensagem, foco, teclado, FAQ nativa, ausência de JS, fontes locais, limites de largura e verificações axe nos estados inspecionados. `npm run frentes:validar`, `npm run build` e `git diff --check` também concluídos.

Capturas desta sessão em `/workspace/cbe-solar-evidence/`: `desktop-inicio.png`, `desktop-projetos.png`, `desktop-formulario.png`, `mobile-inicio.png`, `mobile-projetos.png`, `mobile-formulario.png`, `mobile-mensagem.png` e `mobile-320.png`. São evidências de revisão local; a suíte não abre o link de envio e não envia mensagens reais à CBE.

| Achado | Critérios | Impacto | Correção e conferência |
| --- | --- | --- | --- |
| Cabeçalho compartilhado levava ao orçamento de quadros ao visitar a página solar | V2-10, C-01 | Pedido iniciado na frente errada | Destino acompanha a página ativa; conferido com/sem JS e ao sair/retornar via Swup. |
| Campos novos herdavam rótulos pequenos, em caixa alta e fonte mono | V1-17, V1-18, V2-02, V2-04 | Leitura desnecessariamente densa no celular | Rótulos solares usam Inter, caixa natural e escala existente; nova captura mobile e axe. |
| E-mail longo do rodapé ultrapassava a tela com texto em 200% | C-02, V2-16 | Parte do endereço ficava fora da área visível | Quebra de linha no texto de contato, preservando ícone; revalidação da largura com mensagem preparada e texto ampliado. |

Matriz limitada à nova página e às integrações alteradas. IDs correspondem à skill `auditar-produtos-digitais`.

| IDs | Status | Evidência ou motivo |
| --- | --- | --- |
| V1-01 | Exceção justificada | CTAs arredondados reutilizam o componente da marca; não há tags de preenchimento. |
| V1-02, V1-03 | Não aplicável | Sem itálico ou Instrument Serif nos novos componentes. |
| V1-04 | Exceção justificada | Tracking herdado dos títulos da marca; acentos e leitura conferidos nas larguras inspecionadas. |
| V1-05, V1-06, V1-07, V1-08 | Conforme | Fotos e tarefa principal em destaque, tokens existentes, grupos por espaçamento; bordas concentram-se em campos/FAQ. |
| V1-09 | Não aplicável | Sem diagramas. |
| V1-10, V1-11 | Conforme | Conteúdo específico de energia solar e breadcrumb de navegação real. |
| V1-12 | Exceção justificada | Lista numerada representa as três etapas do atendimento, sem numerar seções decorativamente. |
| V1-13, V1-14, V1-15 | Não aplicável | Sem microtítulos ornamentais, dithering ou ASCII. |
| V1-16 | Conforme | Raios de foto/formulário seguem o sistema existente. |
| V1-17, V1-18, V1-19, V1-20 | Conforme | Conteúdo solar sem mono, caixa alta, degradês ou pontos decorativos nos títulos. |
| V2-01 | Não aplicável | Sem selos promocionais novos. |
| V2-02, V2-03, V2-04 | Conforme | Labels explícitos, opcionais identificados; sem itálico ou mono no conteúdo novo. |
| V2-05 | Conforme | Tokens, fontes, CTA e preparação de mensagem reutilizados. |
| V2-06 | Conforme | Seis fotografias do portfólio real, referências acima, sem resultados financeiros inventados. |
| V2-07, V2-08, V2-09 | Conforme | Instalação em destaque no início, galeria por projeto e títulos específicos; capturas desktop/mobile. |
| V2-10 | Conforme | CTA solar chega à análise; dados preparados, validados e preservados; teste de retorno via Swup. |
| V2-11 | Conforme | Vermelho para ação principal, azul institucional para contexto e links. |
| V2-12 | Exceção justificada | Cabeçalho/widget reutilizam ícones existentes; a seta de rolagem é decorativa e oculta de leitores de tela. |
| V2-13 | Conforme | Sem efeitos/ilustrações novas de preenchimento. |
| V2-14 | Não aplicável | Sem contornos arredondados aninhados equidistantes. |
| V2-15, V2-16, V2-17 | Conforme | Axe, inspeção dos estados iniciais e de revisão, quatro larguras e ampliação de texto; não equivale a certificação ampla. |
| V2-18 | Conforme | Potências localizadas em pt-BR, com números tabulares. |
| V2-19 | Conforme | Imagens têm dimensões reservadas; destaque prioritário e galeria lazy. Preparação é local e síncrona; teste confere carregamento real de todas as fotos. |
| V2-20 | Exceção justificada | Feedback textual e foco imediato na revisão esclarecem a ação sem exigir animação; redução de movimento preservada. |

Limites: não houve teste de recebimento na conta comercial, publicação real, integração com CRM ou estimativa de geração. Contatos existentes foram preservados; a divergência entre o legado e o novo site continua documentada em `expansao-frentes.md`. Critérios de animação e componentes anteriores permanecem cobertos pela regressão, sem reauditoria editorial de todo o site nesta inclusão.
