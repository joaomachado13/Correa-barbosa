# Site da Corrêa Barbosa Engenharia

Site estático em HTML, CSS e JavaScript, com seis páginas. Mantém a identidade e as fotografias da CBE. Não exige servidor de aplicação ou banco de dados.

## Desenvolvimento

Pré-requisitos: Node.js 20+ e Python 3. Em uma tarefa na nuvem, use o checkout existente; a tarefa já é isolada e não precisa de Git worktree adicional.

```sh
npm ci
npm run dev
```

`npm ci` verifica as dependências pelo lockfile e prepara bibliotecas/fontes em `assets/vendor` e `assets/fonts`. Esses diretórios são gerados e ignorados pelo Git. O servidor de desenvolvimento usa a porta 8000. Para outra porta, execute `python3 -m http.server PORTA --bind 0.0.0.0` na raiz do projeto.

## Formulários e atendimento

Todos os formulários preparam uma mensagem para o WhatsApp institucional já utilizado no site: **+55 34 99922-7667**. Após revisar os dados, o visitante escolhe **Continuar no WhatsApp** e confirma o envio no aplicativo. O site não confirma entrega, não apaga os campos e não envia dados automaticamente.

Qualquer edição invalida a mensagem preparada para evitar enviar uma versão antiga. PDF/DWG/DXF e fotos devem ser anexados na conversa do WhatsApp. Há instrução de contato alternativa quando JavaScript está indisponível e uma página de privacidade acessível pelos formulários e rodapé.

`js/forms.js` concentra validação, preparação da mensagem e navegação do orçamento guiado em três etapas. `js/main.js` controla os componentes e limpa listeners/intervalos quando Swup troca a página. As bibliotecas e as três fontes são servidas localmente, com versões fixadas em `package-lock.json`.

O projeto **não implementa recebimento direto por e-mail ou CRM**. Caso esse canal seja adotado no futuro, integrar um backend/serviço autorizado, validar os dados no servidor e confirmar o sucesso somente após a resposta desse serviço. Nunca colocar credenciais em HTML ou JavaScript público.

## Testes

```sh
npx playwright install chromium
npm test
```

No ambiente de nuvem, os testes usam `/usr/bin/chromium` quando disponível. Também é possível informar `CHROMIUM_PATH`. Os testes iniciam seu próprio servidor na porta 8010, validam as rotas em quatro larguras, formulários, teclado, menu, navegação repetida Swup, redução de movimento, acesso sem JS e verificações axe. Não abrem nem enviam mensagens para WhatsApp. Capturas, traces e relatórios do runner ficam em diretórios ignorados.

Para executar apenas parte da validação: `npm run test:unit` ou `npm run test:browser`. A análise automática não equivale a uma certificação completa de acessibilidade ou teste da entrega real na conta comercial.

## Publicação

```sh
npm ci
npm run build
```

Publicar **o conteúdo de `dist/`** na hospedagem estática. O build inclui os arquivos gerados; não publique a raiz do repositório, `node_modules`, testes ou referências de trabalho.

O domínio oficial ainda não foi definido. Quando estiver disponível, executar:

```sh
SITE_URL=https://DOMINIO-OFICIAL npm run build
```

Substitua o marcador pelo domínio real. A variável pode incluir um caminho base de hospedagem. O build gera canonical, `og:url`, imagem de compartilhamento absoluta, JSON-LD LocalBusiness, sitemap e robots no diretório de saída. Sem `SITE_URL`, gera as páginas sem inventar URLs de publicação. Títulos, descrições, locale e nome da marca já estão nos HTMLs.

Antes de publicar, conferir o número de atendimento, prazos e alegações técnicas com a empresa, revisar a página de privacidade conforme o processo efetivo e validar HTTPS/cache/compressão na hospedagem escolhida. Recebimento real do WhatsApp depende da conta comercial e da confirmação do visitante.

## Manutenção

- `css/tokens.css`: cores e escala de marca; `css/fonts.css`: fontes locais.
- `css/main.css`: layout e componentes compartilhados; superfícies dos formulários possuem regras próprias para evitar herança de texto branco em cards claros.
- `assets/data/catalogo-quadros.json`: referência de catálogo. As fichas atuais continuam em HTML estático; conferir ambos ao alterar especificações. Uma geração única dos dados pode ser adotada em tarefa futura, com revisão das informações pela empresa.
- `scripts/vendor.mjs`: copia distribuições e avisos/licenças dos pacotes. Preserva os cabeçalhos de licença de terceiros.
- A marca WebP usa compressão sem perdas, preservando os pixels do PNG original; a redução foi verificada por comparação de pixels. Não substituir pelo SVG antigo, que tem outra identidade visual.
