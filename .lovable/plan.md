# Ligar o Cloud e reactivar o "English Expansion" nesta conta

## Onde está o Cloud (se preferir fazer à mão)

1. Na barra de topo do editor, clique em **More**. Se a janela for estreita, os separadores ficam escondidos num menu de excesso ("...") — alargue a janela ou abra esse menu.
2. Escolha **Cloud**.
3. Clique em **Enable**.

Nota: o Cloud só pode ser ligado na versão principal do projeto, não num rascunho (draft).

## O mais simples: eu ligo por si

Também posso activar o Cloud aqui no chat — aparece um pedido de aprovação e só precisa de confirmar. Depois disso faço o resto sem lhe pedir mais nada.

Já confirmei que o Cloud **ainda não está ligado** neste projeto: as chaves de acesso à base de dados não existem, por isso os logins e as aulas guardadas não funcionam.

## O que passa a funcionar depois disto

- Entrar e criar conta (e-mail ou Google)
- Aulas guardadas por aluno, histórico e progresso
- Vocabulário automático, relatórios semanais e certificados verificáveis
- Áudio das aulas

## O que NÃO vem com o código

Os alunos e os dados antigos ficam na outra conta. Aqui, cada pessoa volta a criar a sua conta.

## Detalhes técnicos

- **Activar Cloud** (ferramenta `supabase--enable`).
- **Recriar o esquema** a partir dos ficheiros SQL que já estão no repositório, aplicados por ordem:
  - `supabase/migrations/` (5 ficheiros): tipos de função, `user_roles`, `profiles`, `lessons`, `conversations`, `messages`, políticas de armazenamento, atribuição automática de função no gatilho `handle_new_user`.
  - `drizzle/migrations/0000`–`0005`: `owner_id` em `lessons`, `learner_profiles`, `daily_activity`, `level_tests`, `vocab_items`, `course_certificates`, e as funções `verify_course_certificate` e `issue_course_certificate`.
- **Tabelas necessárias** (confirmadas no código): `profiles`, `user_roles`, `lessons`, `conversations`, `messages`, `learner_profiles`, `daily_activity`, `level_tests`, `vocab_items`, `course_certificates`.
- **Funções**: `has_role`, `issue_course_certificate`, `verify_course_certificate`.
- **Armazenamento**: criar o contentor `lesson-audio` com as políticas de leitura para utilizadores com sessão e escrita só para administradores.
- **Logins**: activar e-mail/senha (está desligado por omissão em projetos novos) e iniciar sessão com Google.
- **Primeiro utilizador**: o gatilho atribui a função de administrador à primeira conta criada; as seguintes ficam como aluno.
- **Verificação**: criar conta, entrar, abrir uma aula e ver a conversa guardada; confirmar que o certificado só é emitido depois do teste final aprovado.

## Riscos e limites

- O certificado exige o teste final aprovado; sem os dados antigos, o nível de cada aluno recomeça do teste inicial.
- As chaves dos serviços de voz ficam ligadas automaticamente pelo Cloud; nada é copiado da outra conta.
