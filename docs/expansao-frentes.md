# Operação para incluir frentes gradualmente

## O que foi preparado

O site mantém Quadros Elétricos e inclui Energia Solar Fotovoltaica como primeira nova frente no build local. Um cadastro único, `assets/data/frentes.json`, permite preparar e ativar outras áreas individualmente. A página `solucoes.html` e as novas páginas de serviço são geradas pelo build; não é necessário copiar o HTML de cada frente. A implementação solar e suas fontes estão em [energia-solar.md](energia-solar.md).

O cadastro separa `rascunho` e `publicada`. Rascunhos entram apenas na prévia local. O build normal os exclui das páginas geradas, da lista pública de áreas, do cadastro distribuído, das opções de contato e do sitemap.

O contato existente permanece pelo WhatsApp. Ao entrar a partir de uma frente, a área é selecionada e incluída na mensagem preparada. Isso não envia mensagens automaticamente nem confirma recebimento.

## Levantamento do site antigo

Páginas consultadas em **19/11/2026**, por HTTPS, com resposta 200:

- [Home](https://cbe.eng.br/): apresenta quatro grupos de serviços.
- [Produtos e serviços](https://cbe.eng.br/produtos-e-servicos): fonte do escopo de projetos, laudos, consultoria, comissionamento, instalações e automação.
- [Empresa](https://cbe.eng.br/empresa): confirma atuação ampla e menciona instalações de geradores fotovoltaicos na visão.
- [Cases](https://cbe.eng.br/cases): lista 18 sistemas fotovoltaicos residenciais e comerciais.

| Frente cadastrada | Evidência no site antigo | Estado inicial no novo site |
| --- | --- | --- |
| Quadros elétricos | Montagem de quadros em Instalações; catálogo já existente no novo projeto | Publicada, usando o HTML atual |
| Projetos e laudos | Grupo próprio; projetos elétricos, cabines/subestações, iluminação, seletividade, SPDA e inspeções | Rascunho |
| Consultorias e comissionamento | Grupo próprio; energia, tarifas, fator de potência, ensaios e conferência da execução | Rascunho |
| Instalações elétricas | Grupo próprio; infraestrutura, equipamentos, subestações, geradores e sistemas complementares | Rascunho |
| Automação | Grupo próprio; indústria, máquinas, instalações prediais e residenciais | Rascunho |
| Energia fotovoltaica | Cases residenciais/comerciais e visão da empresa | Rascunho; escopo atual precisa ser revisado |

Após esse levantamento, a equipe escolheu energia solar como a primeira inclusão. Seu conteúdo foi preparado com fotos e casos do legado, e o registro passou a `publicada` no build local. As quatro outras novas frentes continuam em rascunho. Essa alteração de estado não realiza push ou deploy.

Eficiência energética permanece como parte de Consultorias, conforme a organização do site antigo. Instalação de ar-condicionado e manutenção de geradores estão inventariadas dentro de Instalações. A lista pode ser reorganizada no cadastro quando a equipe definir a apresentação desejada.

Os textos são um inventário inicial baseado nas fontes, não uma comprovação das qualificações ou do escopo comercial atual. Algumas frases incompletas do legado não foram tratadas como descrição definitiva de um serviço. Cada registro contém `origens` para rastrear a fonte.

**Contatos:** o legado usa `contato@cbe.eng.br` e telefone `(34) 3225-7667`; o código atual usa `contato@cbeengenharia.com.br`, outros números fixos e WhatsApp `(34) 99922-7667`. Estes últimos foram preservados. A equipe deve confirmar os contatos desejados antes de uma eventual troca.

## Rotina de trabalho

1. Escolher uma frente no cadastro.
2. Revisar `nome`, `resumo`, `introducao` e os grupos de serviços conforme o atendimento atual da empresa.
3. Adicionar uma fotografia apropriada da frente em `assets/images/`, sem copiar a foto de outro serviço apenas para preencher o campo. Informar caminho e texto alternativo:

   ```json
   "imagem": {
     "src": "assets/images/nome-do-arquivo.webp",
     "alt": "Descrição objetiva da fotografia desta frente"
   }
   ```

4. Conferir na prévia de rascunhos:

   ```sh
   npm ci
   npm run frentes:validar
   npm run dev:rascunhos
   ```

   A prévia usa a porta 8001, é gerada em `dist-preview/` e contém aviso interno e `noindex, nofollow`. Não publicar essa pasta.

5. Com a frente concluída, alterar somente seu `status` para `publicada`. O gerador exige resumo, introdução, imagem existente/alt e escopo de serviço antes de aceitar essa ativação.
6. Gerar e testar a versão de publicação:

   ```sh
   npm run frentes:validar
   npm test
   npm run build
   ```

7. Conferir as páginas de `dist/`, então enviar a alteração ao Git e publicar pela hospedagem no fluxo adotado pela equipe. Alterar `status` apenas prepara o conteúdo: não faz push ou deploy.

`npm run dev` agora gera o build público e serve `dist/` na porta 8000. Após editar fontes, reinicie o comando para regenerar as páginas. `npm run dev:rascunhos` também deve ser reiniciado após edições. Não há painel administrativo nem gravação de conteúdo em produção.

## Acrescentar uma frente ainda não cadastrada

```sh
npm run frente:criar -- slug-da-frente "Nome da frente"
```

O comando acrescenta um registro em rascunho. Preencha seus textos, imagem e grupos no JSON. IDs duplicados, rotas institucionais reservadas e caminhos que saiam do projeto são rejeitados. O comando não sobrescreve uma página existente.

## Arquitetura

- `assets/data/frentes.json`: fonte editorial e estado de cada frente.
- `scripts/frentes.mjs`: validação, seleção, renderização e opções do contato.
- `scripts/frentes-cli.mjs`: comandos de cadastro e validação.
- `templates/frente.html`: layout das novas páginas. Cabeçalho, rodapé e widget vêm do layout institucional existente em `sobre.html`, mantendo a identidade.
- `css/frentes.css`: estilos próprios da central e das páginas de serviço.
- `scripts/solar.mjs` e `css/solar.css`: apresentação específica de energia solar. Seus textos gerais ficam no renderer; escopo e projetos ficam no cadastro. As folhas de estilo são carregadas também pelas páginas de origem para funcionar após navegação Swup.
- `layout: "solar"` seleciona a apresentação solar. Nesse caso, `imagem` e as imagens de `cases` exigem `width` e `height`, além de arquivo real e alt. Cada projeto possui id exclusivo, nome, cidade, tipo e potência positiva em kWp.
- `scripts/build.mjs`: gera a central, páginas selecionadas, dados públicos e SEO. `quadros-eletricos.html` continua sendo a página existente.
- `contato.html` contém o marcador `CBE:FRONT-SELECT`; o build o substitui por opções das frentes selecionadas. Com uma única frente, o campo é dispensado. Com duas ou mais, é gerado automaticamente.

As páginas funcionam como HTML estático. A central não depende de JavaScript para mostrar as frentes; JavaScript melhora a navegação e aplica o contexto da área no formulário.

## Domínio e SEO

`cbe.eng.br` foi consultado como referência do site antigo. Esta tarefa não alterou o domínio de publicação do novo projeto. Quando o destino da nova versão estiver definido, use `SITE_URL=https://dominio-oficial npm run build` para gerar canonical, imagens de compartilhamento absolutas, dados estruturados e sitemap. A página de uma frente de serviço recebe dados estruturados `Service` e a fotografia correspondente.

A prévia nunca gera canonical/sitemap de publicação, mesmo se `SITE_URL` estiver definido, e inclui `robots.txt` com `Disallow: /`. Isso ajuda a separar artefatos de revisão, mas não oferece controle de acesso: compartilhe apenas as prévias apropriadas para os destinatários.

## Verificações incluídas

Os testes cobrem seleção por estado, ativação de uma única frente completa, bloqueio de publicação incompleta, colisões e caminhos, escape de texto editorial, layout compartilhado, ausência de rascunhos no build normal e prévia com noindex. No navegador, verificam central sem JS, nova página em desktop/mobile, navegação Swup e área preservada na preparação da mensagem. Nenhum teste envia mensagens à empresa.

## Revalidação da estrutura inicial

Este registro corresponde à estrutura anterior à inclusão de energia solar. A cobertura e a matriz da primeira frente concluída estão em [energia-solar.md](energia-solar.md).

Escopo: central pública, páginas geradas de serviço e passagem da frente ao contato. Conferência visual real em 1440×1000, 1024×900, 390×844 e 320×800, com fontes locais. A inspeção inclui o estado de rascunho; a fotografia dos serviços ainda deve ser escolhida antes da ativação. A aparência original de home/catálogo foi preservada, com inclusão do acesso à central na navegação.

Verificações automatizadas: 9 testes de lógica/build e 15 testes de navegador, cobrindo também os fluxos anteriores. Os testes de publicação são orientados aos estados do cadastro; adicionar/ativar uma frente não exige alterar uma contagem fixa de páginas esperada na suíte. Não foi feito push, deploy ou envio real de mensagens nesta etapa.

Matriz dos critérios visuais, limitada aos componentes desta implementação:

| IDs | Status | Evidência ou motivo |
| --- | --- | --- |
| V1-01 | Exceção justificada | CTAs arredondados preservam o padrão de marca; não há tags de preenchimento novas. |
| V1-02, V1-04, V1-05, V1-06, V1-07, V1-08 | Conforme | Sem itálico; fonte local e títulos inspecionados; conteúdo direto, espaçamento e tokens existentes; grupos não dependem de caixas em excesso. |
| V1-03, V1-09, V1-14, V1-15 | Não aplicável | Sem Instrument Serif, diagramas detalhados, dithering ou ASCII nos novos componentes. |
| V1-10, V1-11, V1-12, V1-13 | Conforme | Resumo por frente, breadcrumbs de navegação reais e ausência de numeração/microtítulos decorativos nas novas páginas. |
| V1-16 | Conforme | Geometria da foto segue os raios de marca, sem novas formas arbitrárias. |
| V1-17, V1-18 | Exceção justificada | Mono e rótulos curtos em caixa alta permanecem nos formulários/componentes existentes da identidade. |
| V1-19, V1-20 | Conforme | Fundos sólidos de marca e títulos específicos sem pontuação ornamental. |
| V2-01 | Não aplicável | Nenhum selo promocional novo. O aviso de rascunho comunica o estado da prévia e não existe no build público. |
| V2-02, V2-03 | Conforme | Títulos e rótulos diretos; sem itálico aleatório. |
| V2-04 | Exceção justificada | Uso técnico da fonte mono herdado da marca. |
| V2-05 | Conforme | Novas frentes usam um cadastro, template e estilos compartilhados. A dívida de CSS anterior continua registrada no relatório de correções. |
| V2-06 | Não verificado | A central usa a foto do catálogo atual; fotografias específicas das novas frentes ainda não foram selecionadas e a ativação é bloqueada sem imagem. |
| V2-07, V2-08, V2-09, V2-10 | Conforme | Produto em destaque na central; grid responsivo; oferta concreta e CTAs que chegam ao contato com área selecionada. |
| V2-11, V2-12, V2-13 | Conforme | Cores e ícones existentes preservados, sem ornamentos novos nas áreas. |
| V2-14 | Não aplicável | Sem contornos arredondados aninhados equidistantes que exijam a fórmula. |
| V2-15, V2-16, V2-17 | Conforme | Inspeção visual, limites de viewport, cabeçalho sem sobreposição e verificações axe dos novos estados. Isso não equivale a certificação geral. |
| V2-18 | Não aplicável | Não há comparação de métricas em colunas. |
| V2-19, V2-20 | Conforme | Navegação reaproveita os estados existentes; contato prepara mensagem sem declarar entrega; preferência de movimento reduzido preservada. |
