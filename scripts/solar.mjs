import { escapeHTML as e } from './html.mjs';

const power = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

export function renderSolar(front) {
  const image = front.imagem;
  return `<section class="solar-hero section-spacing">
    <div class="container">
      <nav class="areas-breadcrumb" aria-label="Você está aqui"><a href="index.html">Início</a><span aria-hidden="true">/</span><a href="solucoes.html">Áreas de atuação</a><span aria-hidden="true">/</span><span aria-current="page">Energia solar</span></nav>
      <div class="solar-hero-grid">
        <div class="solar-hero-copy">
          <h1>Painéis solares para sua casa ou empresa</h1>
          <p>${e(front.introducao)}</p>
          <div class="solar-actions"><a class="cbe-btn cbe-btn-red" href="#analise-solar">Solicitar análise do meu projeto</a><a class="solar-text-link" href="#projetos-solares">Ver instalações da CBE <span aria-hidden="true">↓</span></a></div>
        </div>
        <figure class="solar-hero-photo"><img src="${e(image.src)}" alt="${e(image.alt)}" width="${image.width}" height="${image.height}" fetchpriority="high"><figcaption>Instalação comercial no bairro Tubalina · Uberlândia/MG</figcaption></figure>
      </div>
    </div>
  </section>
  <section class="section-spacing" aria-labelledby="solar-escopo">
    <div class="container solar-scope">
      <div><h2 id="solar-escopo">Um sistema dimensionado para o seu consumo</h2><p>O ponto de partida é entender sua conta de energia e o espaço disponível. A partir dessa análise, a equipe define o escopo do projeto com você.</p></div>
      <div class="solar-audiences">${front.grupos.map(group => `<div><h3>${e(group.titulo)}</h3><ul>${group.itens.map(item => `<li>${e(item)}</li>`).join('')}</ul></div>`).join('')}</div>
    </div>
  </section>
  <section id="projetos-solares" class="section-spacing solar-projects" aria-labelledby="solar-projetos-titulo">
    <div class="container">
      <div class="solar-section-intro"><h2 id="solar-projetos-titulo">Energia solar em projetos da CBE</h2><p>Instalações residenciais e comerciais do nosso portfólio. As potências identificam cada sistema e não representam uma estimativa de geração ou economia.</p></div>
      <div class="solar-project-grid">${front.cases.map(project => `<figure class="solar-project" data-solar-case="${e(project.id)}">
        <a href="${e(project.imagem.src)}" target="_blank" rel="noopener noreferrer" data-no-swup aria-label="Abrir foto de ${e(project.nome)} em nova aba"><img src="${e(project.imagem.src)}" alt="${e(project.imagem.alt)}" width="${project.imagem.width}" height="${project.imagem.height}" loading="lazy" decoding="async"></a>
        <figcaption><div class="solar-project-meta"><span>${e(project.tipo)}</span><strong>${power.format(project.potenciaKwp)} kWp</strong></div><h3>${e(project.nome)}</h3><p>${e(project.cidade)}</p></figcaption>
      </figure>`).join('')}</div>
    </div>
  </section>
  <section class="section-spacing" aria-labelledby="solar-etapas">
    <div class="container"><div class="solar-section-intro"><h2 id="solar-etapas">Da primeira conversa à instalação</h2><p>Conheça as etapas para definir o seu sistema fotovoltaico.</p></div>
      <ol class="solar-steps">
        <li><h3>Entender a demanda</h3><p>Você informa o local e o consumo de energia. A conta de luz ajuda a equipe a conhecer o perfil da instalação.</p></li>
        <li><h3>Definir o projeto</h3><p>A equipe avalia as condições do imóvel e apresenta o dimensionamento, o escopo e a proposta para sua decisão.</p></li>
        <li><h3>Planejar a execução</h3><p>Com a proposta aprovada, são alinhados o projeto elétrico, os equipamentos e a instalação do sistema.</p></li>
      </ol>
    </div>
  </section>
  <section class="section-spacing solar-questions" aria-labelledby="solar-duvidas">
    <div class="container solar-faq-layout"><h2 id="solar-duvidas">Antes de começar</h2><div class="solar-faq">
      <details><summary>O que preciso para pedir uma análise?</summary><p>Informe a cidade, o tipo de imóvel e um telefone de contato. Se souber, inclua o consumo mensal em kWh ou o valor médio da conta. Você poderá compartilhar a conta de energia na conversa pelo WhatsApp.</p></details>
      <details><summary>Como saber quantos painéis vou precisar?</summary><p>O dimensionamento considera o histórico de consumo, a área disponível, a orientação e o sombreamento do local. A quantidade de painéis será definida na avaliação do projeto.</p></details>
      <details><summary>É possível informar o preço ou a economia agora?</summary><p>Esses valores dependem do consumo, dos equipamentos, das condições de instalação e das tarifas aplicáveis. A proposta precisa considerar os dados do seu imóvel.</p></details>
      <details><summary>A CBE atende projetos comerciais?</summary><p>Sim. Nosso portfólio inclui instalações em residências, condomínios e estabelecimentos comerciais. Informe a localização e a necessidade do seu projeto para avaliarmos o atendimento.</p></details>
    </div></div>
  </section>
  <section id="analise-solar" class="section-spacing" aria-labelledby="solar-contato-titulo">
    <div class="container solar-contact-layout">
      <div class="solar-contact-copy"><h2 id="solar-contato-titulo">Vamos avaliar o seu projeto solar?</h2><p>Conte onde pretende instalar e como é o seu consumo. A equipe CBE conversa com você sobre os próximos passos.</p><p>Se tiver uma conta de energia em mãos, você poderá anexá-la depois, no WhatsApp.</p><a class="solar-text-link" href="contato.html?frente=energia-fotovoltaica#contact-engineering-form">Outras formas de contato</a></div>
      <form id="solar-form" class="solar-form" data-contact-form="um projeto de energia solar fotovoltaica">
        <p class="solar-form-note" id="solar-required">Campos com * são obrigatórios.</p>
        <div class="solar-form-grid">
          <div class="form-group"><label for="solar_nome">Nome *</label><input class="input-styled" id="solar_nome" name="nome" autocomplete="name" maxlength="160" required></div>
          <div class="form-group"><label for="solar_telefone">Telefone com DDD *</label><input class="input-styled" id="solar_telefone" name="telefone" type="tel" autocomplete="tel" inputmode="tel" maxlength="32" required></div>
          <div class="form-group"><label for="solar_cidade">Cidade / UF *</label><input class="input-styled" id="solar_cidade" name="cidade" autocomplete="address-level2" maxlength="160" required></div>
          <div class="form-group"><label for="solar_imovel">Tipo de imóvel *</label><select class="input-styled" id="solar_imovel" name="imovel" required><option value="">Selecione...</option><option value="residencia">Residência</option><option value="empresa">Empresa / comércio</option><option value="condominio">Condomínio</option><option value="outro">Outro</option></select></div>
          <div class="form-group"><label for="solar_conta">Valor médio da conta (R$)</label><input class="input-styled" id="solar_conta" name="conta" inputmode="decimal" maxlength="32" aria-describedby="solar-consumo-ajuda"></div>
          <div class="form-group"><label for="solar_consumo">Consumo mensal (kWh)</label><input class="input-styled" id="solar_consumo" name="consumo" inputmode="decimal" maxlength="32" aria-describedby="solar-consumo-ajuda"></div>
        </div>
        <p id="solar-consumo-ajuda" class="solar-form-note">Se ainda não souber o valor ou o consumo, pode deixar esses campos em branco.</p>
        <div class="form-group"><label for="solar_detalhes">O que você tem em mente?</label><textarea class="input-styled" id="solar_detalhes" name="detalhes" rows="3" maxlength="1600"></textarea></div>
        <p class="form-channel-note">Este formulário prepara uma mensagem. Você revisa os dados e confirma o envio no WhatsApp. <a href="privacidade.html">Uso dos seus dados</a>.</p>
        <button type="submit" class="cbe-btn cbe-btn-red" disabled>Preparar pedido no WhatsApp</button>
        <div class="form-feedback" hidden><p role="status" aria-live="polite" aria-atomic="true"></p><details><summary>Revisar mensagem</summary><pre class="message-preview"></pre></details><a class="cbe-btn cbe-btn-blue whatsapp-continue" target="_blank" rel="noopener noreferrer" data-no-swup>Continuar no WhatsApp</a></div>
        <noscript><p>Para pedir sua análise, <a class="solar-text-link" href="https://wa.me/5534999227667" target="_blank" rel="noopener noreferrer">fale com a CBE pelo WhatsApp</a>.</p></noscript>
      </form>
    </div>
  </section>`;
}
