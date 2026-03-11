# DebtView

## Visão Geral

O **DebtView** é uma plataforma focada em gestão inteligente de finanças e renegociação humanizada de dívidas, utilizando inteligência artificial para personalizar planos de pagamento de acordo com o padrão de vida real e renda do usuário. 

Diferente de sistemas de cobrança comuns, nós consideramos o Método de Maslow Financeiro, onde as despesas essenciais do cidadão (moradia, alimentação, saúde) são garantidas antes de qualquer valor ser direcionado aos credores, preservando assim o bem-estar da família.

## Principais Funcionalidades

- **Dashboard Financeiro (Painel)**: Apresenta o Score de Saúde Financeira do usuário, gráficos da divisão de despesas e as melhores propostas de negociação com desconto.
- **Simulador de Orçamento Interativo**: Analisa a renda vs. gastos essenciais com IA e diz, de forma visual e explicada, o quanto do orçamento está comprometido.
- **Integração de Dívidas (Mock Serasa)**: Simulação de uma consulta às dívidas atreladas ao CPF do usuário usando o Supabase como banco de dados proxy, viabilizando o projeto de forma similar ao ambiente de produção do Serasa.
- **Autenticação Segura**: Fluxos de Inscrição e Login separados, protegidos via Middlewares para acesso seguro e controlado da conta.

## Stack Tecnológica

- **Frontend**: React + TypeScript
- **Build Tool**: Vite
- **Estilização**: Tailwind CSS + Shadcn UI
- **Animações (UX)**: Framer Motion
- **Banco de Dados & Autenticação**: Supabase
- **Gráficos**: Recharts / Tremor

## Como rodar o projeto localmente

1. Certifique-se de ter o Node.js instalado na máquina.
2. Clone o repositório.
3. Instale as dependências executando:
   ```bash
   npm install
   ```
4. Crie o arquivo de configuração para o Supabase (`.env` ou `.env.local`) com as suas chaves baseadas no ambiente configurado.
5. Inicie o servidor em modo de desenvolvimento local:
   ```bash
   npm run dev
   ```
6. O projeto será iniciado na porta alocada pelo Vite, como padrão em [http://localhost:5173/](http://localhost:5173/).

*Este projeto foi desenvolvido como um Projeto Integrador acadêmico focando em proporcionar uma prova de conceito robusta (MVP) do uso de tecnologias web avançadas associadas a estratégias financeiras compassivas.*
