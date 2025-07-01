## Relatório de Análise das Regras de Negócio

Este relatório detalha a verificação das regras de negócio implementadas no código backend fornecido.

### 1. Ação: Publicar evento
- **Quem pode**: Prefeitura
- **Observação**: Diretamente
- **Status da Implementação**: ✅ **Implementado corretamente**
  - No arquivo `src/controllers/anuncioController.js`, na função `create`, há a seguinte verificação:
    ```javascript
    if (anuncioData.tipo_anuncio === 'evento' && user.tipo_usuario !== 'prefeitura') {
      throw new AppError('Apenas a prefeitura pode publicar eventos.', 403);
    }
    ```
  - Além disso, o status do anúncio é definido como `aprovado` se o usuário for `prefeitura`:
    ```javascript
    const status = user.tipo_usuario === 'prefeitura' ? 'aprovado' : (precisaAprovacao ? 'pendente' : 'aprovado');
    ```

### 2. Ação: Publicar produto
- **Quem pode**: Produtor (cliente se permitido)
- **Observação**: Pode exigir aprovação
- **Status da Implementação**: ✅ **Implementado corretamente**
  - No arquivo `src/controllers/anuncioController.js`, na função `create`, há a seguinte verificação para produtos:
    ```javascript
    if (anuncioData.tipo_anuncio === 'produto') {
      const clientePodePublicarConfig = await Configuracao.findByChave('liberar_publicacao_cliente');
      const clientePodePublicar = clientePodePublicarConfig && clientePodePublicarConfig.valor === 'sim';
      
      const isProdutor = user.tipo_usuario === 'produtor';
      const isClientePermitido = user.tipo_usuario === 'cliente' && clientePodePublicar;

      if (!isProdutor && !isClientePermitido) {
        throw new AppError('Você não tem permissão para publicar produtos.', 403);
      }
    }
    ```
  - A aprovação condicional é tratada pela configuração `validacao_manual_anuncios`:
    ```javascript
    const validacaoManualConfig = await Configuracao.findByChave('validacao_manual_anuncios');
    const precisaAprovacao = validacaoManualConfig && validacaoManualConfig.valor === 'sim';
    // ...
    const status = user.tipo_usuario === 'prefeitura' ? 'aprovado' : (precisaAprovacao ? 'pendente' : 'aprovado');
    ```

### 3. Ação: Comentar
- **Quem pode**: Todos usuários
- **Observação**: Se habilitado nas configurações
- **Status da Implementação**: ⚠️ **Parcialmente implementado**
  - No arquivo `src/controllers/comentarioController.js`, na função `create`, o `id_usuario` está fixo como `1` (`const id_usuario = 1; // << SUBSTITUIR PELA LÓGICA REAL`). Isso impede que 


qualquer usuário comente, pois não está sendo obtido do token de autenticação. A lógica de permissão para "todos os usuários" não está completa.
  - A observação "Se habilitado nas configurações" não está implementada no controller de comentários. Embora exista um modelo `Configuracao`, não há verificação de uma chave de configuração para habilitar/desabilitar comentários.

### 4. Ação: Responder comentário
- **Quem pode**: Todos usuários
- **Observação**: Ligado ao id do comentário pai
- **Status da Implementação**: ⚠️ **Parcialmente implementado**
  - Similar à regra de "Comentar", o `id_usuario` está fixo, impedindo a correta atribuição do autor da resposta.
  - A lógica para ligar ao `id_comentario_pai` está presente e funcional:
    ```javascript
    if (id_comentario_pai) {
      const comentarioPai = await Comentario.findById(id_comentario_pai);
      if (!comentarioPai) {
        throw new AppError("Comentário pai não encontrado", 404);
      }
      if (comentarioPai.id_anuncio !== anuncio.id_anuncio) {
        throw new AppError("A resposta deve pertencer ao mesmo anúncio do comentário pai.", 400);
      }
    }
    ```
  - No entanto, a permissão para "todos os usuários" não está completa devido ao `id_usuario` fixo.

### 5. Ação: Aprovar anúncios
- **Quem pode**: Prefeitura
- **Observação**: Controle de qualidade
- **Status da Implementação**: ✅ **Implementado corretamente**
  - No arquivo `src/controllers/anuncioController.js`, a função `updateStatus` é responsável por esta ação. Embora a verificação de permissão não esteja explicitamente dentro desta função, o comentário `// A permissão já foi verificada na rota (authorize("prefeitura"))` indica que um middleware de autorização (`authorize('prefeitura')`) deve estar protegendo esta rota.
  - A lógica de mudança de status (`aprovado` ou `rejeitado`) está presente:
    ```javascript
    if (!status || !["aprovado", "rejeitado"].includes(status)) {
      throw new AppError("Status inválido. Use \"aprovado\" ou \"rejeitado\".", 400);
    }
    // ...
    const updatedAnuncio = await Anuncio.update(id, { status });
    ```

### Conclusão Geral

As regras de negócio relacionadas à publicação e aprovação de anúncios (`Publicar evento`, `Publicar produto`, `Aprovar anúncios`) estão bem implementadas e seguem as especificações. No entanto, as regras de `Comentar` e `Responder comentário` necessitam de atenção, pois o `id_usuario` está fixo no controller de comentários, impedindo a correta atribuição do autor e a verificação de permissões baseadas no usuário logado. Além disso, a dependência de uma configuração para habilitar comentários não está explícita no código do controller.

**Recomendação:** Implementar o middleware de autenticação para passar o `id_usuario` real para o controller de comentários e adicionar a lógica de verificação de configuração para habilitar/desabilitar comentários.

