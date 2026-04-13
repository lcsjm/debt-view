# Documentação Técnica: Assistente Inteligente (Chatbot AI)

## Resumo Rápido (Executivo)

1. **Inteligência Integrada**: Utiliza a *API* do [Gemini 2.5 Flash](https://ai.google.dev/gemini-api/docs/models?hl=pt-br) especializada por um prompt sistemático estrito para focar no alívio de dívidas financeiras.
2. **Arquitetura Segura**: A comunicação web não interage com os provedores Google diretamente. Passa de forma mascarada através de uma "Edge Function" hospedada dentro do Supabase.
3. **Contexto Ativo em Tempo Real**: Cada *enter* pressionado mapeia silenciosamente o saldo estático, as dívidas vazadas via Serasa e calculos de simuladores contidos no perfil e injeta eles como plano de subtexto ao robô.
4. **Otimização Extrema de Custos**: Exclui repasses de históricos pesadissímos. Limita propositalmente ao topo das últimas 15 comunicações e utiliza javascript nativo no Front-End para avaliações iniciais antes de pagar a rede.
5. **Persistência em PostgreSQL**: O estado da conversa e suas memórias são retidos não só no front end, mas atracados entre as tabelas `chat` relacionais contendo chaves cruzadas que hospedam os grandes JSONs pesados em Arquivamento Storage Bucket.

Este documento descreve detalhadamente o funcionamento e a arquitetura do chatbot inteligente implementado no projeto "DebtView". O objetivo é oferecer uma visão técnica sobre como a interface, a geração de contexto em tempo real e a comunicação segura com o banco de dados Supabase e a API do Gemini foram integradas ao sistema.

## 1. Visão Geral

O Assistente Financeiro é uma inteligência artificial embutida no sistema, desenvolvida para prover orientações e estratégias de alívio de dívidas adaptadas ao cenário econômico real de cada usuário cadastrado na aplicação.

A solução utiliza o modelo [**Gemini 2.5 Flash**](https://ai.google.dev/gemini-api/docs/models?hl=pt-br) do Google. Para garantir máxima segurança e não expor as credenciais na aplicação cliente (o que poderia permitir roubo ou abuso na cota da I.A.), o projeto adota uma arquitetura particionada em camadas. Toda chamada definitiva à inteligência e o armazenamento do histórico são processados de forma privada em um ambiente backend de nuvem, utilizando as [**Supabase Edge Functions**](https://supabase.com/docs/guides/functions).

## 2. Arquitetura e Componentes do Código

### 2.1. Camada Visual (Frontend)

- **Arquivo Dominante**: [`src/components/ui/ChatBot.tsx`](../../src/components/ui/ChatBot.tsx)
- **Características Base**: O componente é desenvolvido em React e renderizado mantendo um estilo responsivo. Utiliza Markdown para a apresentação visual adequada (`react-markdown`).
- **Análise Lógica Inicial**: Quando aberto e renderizado contendo a propriedade `financialData` (capturada previamente no painel analítico do usuário), o código roda uma bateria de cálculos locais. Exemplo: Através do método `generateAnalysis(data)`, ele é capaz de alertar sozinho o usuário em casos onde os custos fixos ultrapassam métricas seguras antes mesmo de ser necessário contatar a resposta neural custosa do Google.
- **Controle de UI**: Gerencia os estados de mensagens de forma volátil até que receba a aprovação de carregamento do BackEnd local via a rotina principal atrelada à submissão do form.

### 2.2. Agregação de Contexto Financeiro (Live Context)

- **Arquivo Dominante**: [`src/utils/aiContext.ts`](../../src/utils/aiContext.ts)
- **Justificativa do Fluxo**: Se a aplicação apenas redigisse a pergunta enviada ("Como faço para quitar minhas dívidas?"), os retornos seriam básicos. Devido a esta lacuna, implementamos o módulo `getAILiveContext(user)`.
- **Implementação Técnica**: Todo acionamento do campo de "Enviar", dispara silenciosamente chamadas múltiplas (usando a função `Promise.all()`) direto ao Supabase em requisições de leitura na sessão do usuário operante, e então monta um extenso plano de texto (o Prompt de Contexto) ensinando o que o usuário faz e quanto o seu perfil de dados carrega.
- **Tabelas do Schema referenciadas na varredura:**
  - `profiles`: Vincula características inerentes de perfil, como a extração do `cpf` para batimentos subsequentes, e identificação nominativa via coluna `name`.
  - `finances` e `financial`: Onde são catalogadas as balizas financeiras totais (ex: `fixedExpenses`, `investments`, e `variableIncome`). Assim, o robô recebe a conta macro de despesas em contrapartida aos ganhos reais da pessoa.
  - `debts` e `mock_serasa_debts`: Responsável por cruzar dívidas cadastradas internamente (tabela `debts`) com a tabela reflexa contendo as dívidas vazadas via órgãos protetores, o robô consome os valores explícitos `original_amount`, `current_amount`, data de validade de boletos em `due_date` e o seu provedor na `creditor_name`.
  - `transactions`: Levanta a trilha das mais atualizadas despesas diárias da coluna tipo e categoria.
  - `simulators`: Passa ao histórico quaisquer testes simulados salvos usando cálculos contornando as multas de pagamento total, e resgatando da tabela parâmetros como a prestação prevista de `installments`, para que o robô tenha ciência de se aquele plano amortizador vale e o valor retido `value`.

### 2.3. Camada de Requisição Segura Mestre (Supabase Backend)

- **Arquivo Dominante**: [`supabase/functions/chat_handler/index.ts`](../../supabase/functions/chat_handler/index.ts)
- **Mecanismo Edge Function**: O Frontend nunca fará um `fetch()` para o provedor externo do Gemini Web diretamente. Em seu escopo as ações invocam instâncias via intermédio SDK com `supabase.functions.invoke('chat_handler')`.
- **Processamento de Requisições Serverless**:
  - **Autorização (RLS Equivalente)**: Lê o header do Bearer Token assinado pela subárea do Auth e autentica o uuid relator daquele JSON da chamada.
  - **Limitações e Desempenho**: Sincroniza ativamente apenas as últimas aproximações retentoras (exibe as últimas 15 submissões listadas no array de memórias) evitando problemas de estouro de JSON longos sobre HTTP. E só interagem mediante confirmações do Banco de Dados.
  - **Condução Instrucional da IA**: Carrega dinamicamente os parâmetros da instrução primária atreladas e orientações morais na propriedade `systemInstruction`: delimitando sempre um viés profissional focado inteiramente na remissão do endividamento daquele caso contextual associado.

## 3. Estruturas Nativas (Banco de Dados Postgres e Storage)

O estado e o versionamento transacional do módulo do chat estão ancorados majoritariamente sob uma estrutura uníssona de tabela e buckets atrelados no PostgreSQL padrão, garantindo que usuários que mudarem de plataforma mantenham suas consultas abertas:

- **Tabela Relacional - `chat`**:
    Estrutura DDL Principal que armazena referências da identidade. Apresenta tipografia para UUID único `user_id` vinculado por Chave Estrangeira aos registros autênticos (`auth.users`). Utilizou-se das colunas complementares:
  - `history` formatado diretamente sob especificação binária flexível em base `JSONB` facilitando a rápida indexação de conversas pelo front end.
  - `json_url` como referencial direto textual ligando ao Backup arquivado pelo formato nominal fixo no repositório geral de mídias.

- **Storage Bucket - `chat_history`**:
    Sempre que a Edge Function recupera uma conversa nova, visando impedir corrompimentos do bando de dados principal sobrecarregado, a conversação de fato integral gera um backup local arquivado em formato estático (ex: `1a2b3c4d-9321.json`). E o repassa ao serviço de Bucket nomeado especificamente em prol desta manutenção de Storage.

## 4. Testando Logística de Rede no Desenvolvimento (Deploy Local)

Para a completa aprovação e submissão em testes para novos contribuidores do repositório, ateste o seguinte checklist antes de forçar compilações ativas no painel de conversa contido em `npm run dev`:

1. Verificar se o pacote `.env` da raiz contem as exatas diretrizes validadas que dão o endereçamento público na Vercel e o passaporte anônimo de segurança da API (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`).
2. Sincronização e Deploy Externo de Functions na CLI do provedor. A invocação da Edge Function apenas responderá os comandos da tela se confirmarmos sua alocação, caso constem pendências no repositório de servidor de testes (devido ao uso e exigência do token criptografado para o motor gerador `GEMINI_API_KEY`). A CLI deve estar conectada e pareada ao banco validado em conformidade.
