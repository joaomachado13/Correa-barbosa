# Resultado das correções — CBE

Revisão de 18/11/2026. Alterações na árvore de trabalho do projeto; sem deploy, push ou envio de mensagens reais. Base auditada: commit `5b0cd02a0e93b8487fc88b779641b64a2c5c5ee3`.

## Resultado principal

Os cinco formulários agora preparam uma mensagem com os dados preenchidos para o WhatsApp institucional. O visitante revisa o conteúdo, escolhe continuar e confirma o envio no aplicativo. Não há confirmação falsa de recebimento, limpeza automática dos campos ou dependência de credenciais de e-mail/CRM. Uma edição invalida a mensagem anterior. O telefone recebe validação com DDD, os campos têm nomes e autocomplete, e o feedback possui região de status acessível.

Essa solução usa o canal de contato que já existia no projeto. **Não foi implementado recebimento direto por e-mail/CRM. A entrega real da mensagem depende da confirmação do visitante e do serviço WhatsApp e não foi testada enviando mensagens à empresa.**

## Achados e revalidação

| Achado da avaliação | Alteração | Resultado |
| --- | --- | --- |
| A-01: envio simulado | Preparação/revisão da mensagem e link ao número institucional; campos preservados. | Cinco formulários validados, sem requisição externa durante a preparação; conteúdo e encoding conferidos. |
| A-02: branco sobre branco | Componentes claros têm cores de texto próprias; removidas regras conflitantes de superfície. | Rótulos de contato, título da home e aviso de uso dos dados visíveis. Verificação de estilo computado e visual. |
| A-03: corte no celular | Grid com trilhas que podem encolher, min-width dos filhos, quebra de textos e padding responsivo. | Seis páginas verificadas em 320, 390, 901 e 1440 px; campos/controles de formulário dentro da tela. |
| A-04: teclado | Seletores técnico/guiado e especificações usam botões nativos, estados e associação aos painéis; face inativa fica inert. | Enter abre especificações e orçamento guiado, Escape retorna à foto e foco acompanha o estado. |
| A-05: foco/menu | Foco visível; menu retém foco, isola fundo e fecha por Escape; widget também fecha e restaura foco. | Testes passaram, inclusive após quatro visitas consecutivas via Swup. |
| A-06: anexos | FAQ e formulários explicam que os documentos são anexados na conversa do WhatsApp. | Recurso anunciado corresponde ao caminho implementado; não há upload pelo site. |
| A-07: movimento | Introdução opcional abrevia para cerca de 0,9 s; preferência de redução desativa splash, efeitos contínuos e autoplay. Carrossel tem pausa/reprodução. | Autoplay permanece parado com redução de movimento e controles manuais funcionam. Navegação com movimento normal também verificada. |
| A-08: sem JavaScript | Splash oculta por padrão; navegação e contato alternativos em noscript; botão de preparação habilitado só após inicialização. | Home e contato alternativo acessíveis no ensaio sem JS, sem sobreposição bloqueante. |
| A-09: validação/feedback | Validação, nomes, autocomplete e status; mensagem anterior invalidada após edição. | Telefone inválido bloqueado, mensagens corretamente codificadas e dados preservados. |
| A-10: peso da logo | WebP sem perdas, preservando a marca e os pixels originais. | De 786.436 para 531.094 bytes: **32,5% menor**. Comparação de pixels retornou zero diferenças. |
| A-11: manutenção | Módulo próprio de formulários, remoção de código de lookbook sem uso, limpeza de listeners/timers nas visitas, consolidação das regras que causavam conflitos. | JS principal de 1.065 para aproximadamente 859 linhas; comportamento verificado. Refatoração integral do CSS e catálogo único continuam sendo evoluções possíveis. |
| A-12: jornada | Orçamento com introdução menor e três etapas reais no guiado; guia longo de famílias do catálogo recolhido em details nativo. | Etapas validam avanço, permitem voltar e conservam dados; guia opcional e filtro de família funcionam por teclado. |
| A-13: SEO | Metadados básicos de compartilhamento nos HTMLs; build gera canonical, imagem absoluta, JSON-LD, sitemap e robots quando informado SITE_URL. | Geração testada com domínio reservado .test e com ausência de domínio. Usuário ainda não definiu domínio oficial: URLs de publicação não foram inventadas. |
| A-14: contraste/headings | Ajustes de contraste no rodapé, rótulos, ação vermelha e organização dos headings. | Nenhuma violação automática WCAG 2 A/AA e 2.1 AA reportada pelo axe nas páginas/estados testados. Isso não é certificação completa de acessibilidade. |
| A-15: confiança | Separação de primeiro retorno e prazo de proposta, retirada da promessa de anexo inexistente e página de privacidade para o fluxo atual. | Textos ajustados; comprovação operacional das alegações técnicas, autorizações de logos e revisão jurídica não foram realizadas. |
| A-16: execução/testes | README, dependências com lockfile, fontes/bibliotecas locais, build estático e workflow de CI. | Instalação limpa, build e testes locais passaram. O workflow foi criado, mas não executado no GitHub nesta tarefa. |

## Verificações executadas

- `npm ci --cache /tmp/cbe-npm-cache --no-audit --no-fund`: instalação limpa e geração dos recursos locais.
- `npm test`: **3 testes Node e 12 testes Playwright**. Abrange seis rotas em quatro larguras, mensagens de todos os formulários, validação inválida, conservação de campos, três etapas, teclado, filtros, menu, visitas Swup repetidas, movimento reduzido, acesso sem JS e axe em páginas/estados alternativos.
- Build com e sem domínio, incluindo todos os arquivos de bibliotecas/fontes no diretório de publicação. O domínio `.test` foi usado apenas como fixture e removido do build final pelos próprios testes.
- Inspeção visual de capturas desktop 1440×1000 e mobile 390×844; fontes oficiais agora disponíveis localmente. Inspeção manual adicional com movimento normal e mudança dinâmica da preferência sem erros JavaScript.
- `git diff --check`, sintaxe dos módulos JS e comparação sem perdas da imagem.

Os testes não enviam mensagens ao WhatsApp e não medem Core Web Vitals de visitantes reais. A confirmação de recebimento pela conta comercial deverá ser validada pela empresa em seu fluxo operacional.

## Matriz de reavaliação dos 40 critérios

Os padrões estéticos foram avaliados no contexto da marca, sem rebranding. “Conforme” limita-se às telas e estados conferidos. As observações editoriais residuais não representam falha bloqueante do fluxo corrigido.

| IDs | Status | Evidência ou limite |
| --- | --- | --- |
| V1-01 | Exceção justificada | Pills mantidas nos filtros e CTAs previstos na marca. |
| V1-02, V1-04, V1-06 | Conforme | Sem itálico ornamental; fontes oficiais locais e títulos inspecionados; divisórias agrupam conteúdo. |
| V1-03, V1-09, V1-14, V1-15 | Não aplicável | Sem Instrument Serif, diagramas detalhados, dithering ou ASCII. |
| V1-05 | Conforme | Abertura do orçamento encurtada, etapas reais e guia de categorias opcional. |
| V1-07 | Conforme | Cores por superfície corrigidas nos componentes afetados e revalidadas. |
| V1-08 | Exceção justificada | Cards agrupam produtos, contatos e formulários distintos. |
| V1-10, V1-13 | Não conforme | Ainda há repetições editoriais de normas/microtítulos entre seções institucionais; os excessos do orçamento foram reduzidos. |
| V1-11 | Conforme | Removidos os prefixos decorativos 01 // a 06 // dos campos. |
| V1-12, V1-17, V1-18, V1-20 | Exceção justificada | Numeração dos ensaios, mono técnica, rótulos curtos e títulos em frase pertencem à linguagem existente. |
| V1-16, V1-19 | Conforme | Geometria consistente e predominância dos blocos de marca. |
| V2-01, V2-06 | Não verificado | Fotos/logos existentes preservados; autenticidade documental e suporte das promessas dependem da empresa. |
| V2-02 | Não conforme | Redundância reduzida no orçamento; parte dos rótulos institucionais ainda pode ser simplificada editorialmente. |
| V2-03 | Conforme | Sem itálico aleatório. |
| V2-04 | Exceção justificada | Mono mantida nos usos previstos da identidade técnica. |
| V2-05 | Não conforme | Conflitos críticos resolvidos e módulo de formulários extraído; CSS ainda acumula variantes e os dados de catálogo permanecem repetidos em HTML/JSON. |
| V2-07, V2-08, V2-09 | Conforme | Produto em destaque; grid ajustado; oferta e etapas concretas. |
| V2-10, V2-11, V2-12, V2-13 | Conforme | Ações com nome/estado, cor de ação contrastante, ícones preservados e movimento controlável. |
| V2-14 | Não aplicável | Sem geometria crítica de contornos equidistantes que exija a fórmula. |
| V2-15, V2-16, V2-17 | Conforme | Contraste nas superfícies verificadas, conteúdo móvel e alinhamentos inspecionados. Zoom nativo de todos os navegadores não faz parte desta cobertura. |
| V2-18 | Não aplicável | Sem tabela de comparação numérica. |
| V2-19, V2-20 | Conforme | Feedback corresponde à preparação real, dados preservados, nenhuma declaração de entrega e redução de movimento respeitada. |

## O que depende da publicação ou da empresa

1. Definir domínio e hospedagem; gerar novamente com `SITE_URL` para ativar os endereços SEO corretos.
2. Publicar `dist/` e verificar HTTPS, cache/compressão e comportamento em navegadores/dispositivos reais. Nenhum deploy foi realizado.
3. Validar recebimento do WhatsApp pela conta da empresa e confirmar prazos, conteúdo técnico, logos e adequação da página de privacidade ao atendimento efetivo.
4. A configuração reutilizável do ambiente foi atualizada em rascunho (`install_script` e `start_skill`). Para ativá-la em versões futuras, revisar e salvar nas configurações e publicar o ambiente. Isso é separado de publicar o site.

Uma futura integração de e-mail/CRM e uma fonte única para o catálogo podem ser implementadas com os requisitos desses serviços definidos. Não são recursos que o site atual finge possuir.
