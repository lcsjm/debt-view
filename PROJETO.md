# DebtView - Projeto Integrador

## O que é o DebtView?

O **DebtView** é uma plataforma inovadora projetada para oferecer customização e gestão inteligente de dívidas para os usuários, levando sempre em consideração a realidade e o contexto financeiro de cada pessoa (renda mensal, gastos essenciais para moradia/família, despesas imprevistas). 

Diferente de sistemas rígidos que apenas cobram montantes cheios, a plataforma visa utilizar **inteligência artificial** de forma assíncrona/automatizada para cruzar os dados da renda do usuário com as dívidas listadas na base da API do Serasa, e a partir disso:
- Calcular qual parcela caberia no orçamento da pessoa sem comprometer seus gastos essenciais diários (alimentação, aluguel, luz).
- Sugerir acordos, novos planos ou contratos de renegociação que façam sentido.
- Prestar um planejamento financeiro que guia o usuário a quitar suas dívidas ("sair do vermelho") de maneira saudável e realista.

## Sobre Redirecionamentos de Autenticação

Para garantir a melhor experiência possível de uso, a plataforma conta com middlewares que blindam páginas sensíveis baseados na sessão de usuário (Sessão utilizando Supabase Auth):
- Usuários que **NÃO ESTÃO LOGADOS** e tentarem acessar o `/Resultado` (ou o Dashboard interno da aplicação) são empurrados automaticamente de volta para a tela de autenticação (`/login`).
- Usuários que **JÁ ESTÃO LOGADOS** e tentarem acessar as páginas de `/login` ou `/register` inadvertidamente, são direcionados automaticamente para o painel principal (`/Resultado`), ignorando o fluxo de login redundante.

## Arquitetura de Dados: Dívidas Mockadas vs Serasa API

Uma vez que, pelo escopo do projeto acadêmico/integrador não temos acesso em tempo real e de produção à API do Serasa Limpa Nome para consultar dívidas reais baseadas em CPFs verdadeiros, a arquitetura de base de dados foi planejada para mitigar esse obstáculo e se manter próxima do mundo real:

### Solução Proposta com Tabelas no Supabase

Criaremos uma tabela auxiliar dentro do banco de dados (por exemplo, `mock_serasa_debts`):

```sql
CREATE TABLE mock_serasa_debts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_cpf varchar(14) NOT NULL, -- O CPF do usuário para o cruzamento associativo
  creditor_name varchar(255) NOT NULL, -- Exemplo: Banco do Brasil, Nubank, Claro
  original_amount decimal(10, 2) NOT NULL, -- Valor inicial da dívida
  current_amount decimal(10, 2) NOT NULL, -- Valor com juros (para negociação)
  due_date date NOT NULL,
  status varchar(50) DEFAULT 'Pendente'
);
```

### Como isso ajuda se virar um produto do Serasa?

Se este MVP (Produto Mínimo Viável) tracionar e for adotado pelas operações do Serasa no futuro, a migração será extremamente **simples**:

1. Toda a lógica de frontend, cálculo de amortização via IA e customização da renegociação pelo comportamento financeiro do usuário já estará construída e independente da fonte dos dados.
2. A API que hoje busca de forma assíncrona da tabela `mock_serasa_debts` baseada pelo `user_cpf` pode, da noite para o dia, ser refatorada para fazer um `GET` no endpoint oficial de dívidas do Serasa, usando como header a credencial ou o mesmo identificador do CPF do usuário logado. 
3. Os campos (Nome do credor, Valor original, Valor com desconto/juros etc.) continuarão abastecendo a IA sem necessidade de redesenhar a arquitetura da aplicação inteira.

Dessa forma garantimos a viabilidade do projeto hoje, preservando a escalabilidade para uma integração oficial real futura.
