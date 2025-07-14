📘 MeuIPCB — Plataforma Centralizada de Gestão Académica

MeuIPCB é uma plataforma web desenvolvida para centralizar, num único ponto de acesso, toda a informação académica relevante dos estudantes do Instituto Politécnico de Castelo Branco (IPCB). Este sistema visa colmatar a dispersão de dados existente entre plataformas como o NetPa, Moodle e o website institucional.
🎯 Objetivo

Fornecer aos alunos e serviços escolares uma interface moderna, segura e acessível, que permita visualizar dados pessoais, horários, classificações, faltas, calendários escolares e contactos institucionais, sem depender de múltiplas plataformas.
⚙️ Tecnologias Utilizadas

    Frontend: React.js

    Backend: Node.js + Express

    Base de Dados: MongoDB (Atlas)

    Autenticação: Microsoft Entra ID (OAuth 2.0 + PKCE)

    AI Integrada: DeepSeek V3 via OpenRouter.ai

    Agendador: Node.js (leitura de JSONs + scraping de dados do website institucional)

🔍 Funcionalidades Principais

    Autenticação federada via Microsoft Entra ID

    Visualização de horários, disciplinas, classificações e faltas

    Acesso a calendários de avaliações e calendários escolares

    Gestão de tarefas pessoais com categorização por prioridade

    Sistema de gestão de anúncios por perfil (aluno, docente, serviços)

    Mapa interativo de salas com horários

    Assistente inteligente com IA para apoio contextual ao aluno

    Agendador automático para atualização periódica dos dados

🧠 Destaques Técnicos

    Integração de scraping e ingestão de ficheiros PDF/JSON devido à ausência de APIs oficiais

    Estrutura modular e escalável (separação clara entre frontend, backend e agendador)

    Segurança assegurada via sessões, cookies HTTP-only e validação por middleware

    Interface responsiva e otimizada para uso académico real
