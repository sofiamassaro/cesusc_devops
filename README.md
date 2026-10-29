# Projeto DevOps - CI/CD com GitHub Actions, Docker e AWS EC2

Projeto da disciplina **Ferramentas de Implantação Contínua - DevOps** (ADS - UNICESUSC).

Aluna: Sofia Di Domenico Massaro, turma ADS 31.

Aplicação Node.js (Express) com pipeline completo:

```
feature/* --PR--> develop --CI (lint + testes)--> merge automático na main --Deploy--> Docker Hub --> EC2
```

| Etapa | Onde | O que faz |
|---|---|---|
| **CI** (Integração Contínua) | `.github/workflows/ci.yml`, job `build` | `npm ci`, ESLint (análise estática) e Jest (testes de unidade e integração) |
| **Continuous Delivery** | `.github/workflows/ci.yml`, job `delivery` | Se o CI passou, faz o merge da `develop` na `main` usando o `ACCESS_TOKEN` |
| **Continuous Deployment** | `.github/workflows/deploy.yml` | Build da imagem Docker, push no Docker Hub (tags `SHA` e `latest`), SSH na EC2 e `docker compose up -d` |

## Estrutura

```
projeto-devops/
├── .github/workflows/
│   ├── ci.yml              # CI + Delivery (dispara na develop)
│   └── deploy.yml          # Deploy (dispara na main)
├── deploy/
│   ├── setup-ec2.sh        # prepara a EC2: Docker, Nginx, pasta /opt e permissões
│   └── nginx-projeto-devops.conf   # proxy reverso 80 -> 3000
├── src/
│   ├── app.js              # servidor Express
│   ├── utils/calculos.js   # funções testadas nos testes de unidade
│   └── views/index.html
├── tests/
│   ├── calculos.test.js    # testes de unidade
│   └── app.test.js         # testes de integração (supertest)
├── Dockerfile
├── .dockerignore
├── docker-compose.yaml
├── eslint.config.mjs
└── package.json
```

## Rodando localmente

```bash
npm install
npm run lint     # ESLint
npm test         # Jest com cobertura
npm start        # http://localhost:3000
```

Com Docker:

```bash
docker build -t seu_usuario/projeto-devops .
docker run -p 3000:3000 seu_usuario/projeto-devops
```

---

# Passo a passo de configuração

## 1. GitHub: repositório e branches

```bash
git init
git add .
git commit -m "Estrutura inicial do projeto"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/projeto-devops.git
git push -u origin main

git checkout -b develop
git push --set-upstream origin develop
```

No GitHub, em **Settings > General > Default branch**, deixe a `develop` como padrão. Assim os PRs abrem contra ela.

## 2. Docker Hub (Fase 1 da aula)

1. Crie a conta em hub.docker.com e ative o 2FA.
2. Crie o repositório **`projeto-devops`** (fica `seu_usuario/projeto-devops`).
3. Em **Account settings > Personal access tokens**, gere um token com permissão **Read & Write**. Copie o token.

## 3. Token do GitHub (para o merge automático)

**Settings (do seu perfil) > Developer settings > Personal access tokens > Tokens (classic) > Generate new token (classic)**

- Note: `projeto-devops-ci`
- Expiration: 90 dias
- Escopos: marque **`repo`** e **`workflow`**

## 4. Secrets do repositório

No repositório: **Settings > Secrets and variables > Actions > New repository secret**

| Nome | Valor |
|---|---|
| `ACCESS_TOKEN` | Token classic do GitHub (passo 3) |
| `DOCKER_USERNAME` | Seu usuário do Docker Hub |
| `DOCKERHUB_TOKEN` | Token do Docker Hub (passo 2) |
| `EC2_HOST` | IP fixo da instância (Elastic IP) |
| `SSH_PRIVATE_KEY` | Conteúdo inteiro do arquivo `.pem`, incluindo as linhas `-----BEGIN ...-----` e `-----END ...-----` |

Se a chave foi criada em `.ppk` (PuTTY), converta para `.pem` no PuTTYgen: **Conversions > Export OpenSSH key**.

## 5. Instância EC2 (Fase 2 da aula)

Configuração da instância: Ubuntu, `t2.micro`, região `sa-east-1`, 8 GB. No Security Group, libere SSH (22), HTTP (80) e HTTPS (443). Associe um Elastic IP para o IP não mudar.

Copie os arquivos de setup para o servidor e rode o script:

```bash
scp -i sua-chave.pem deploy/setup-ec2.sh deploy/nginx-projeto-devops.conf ubuntu@SEU_IP:~
ssh -i sua-chave.pem ubuntu@SEU_IP
bash setup-ec2.sh
exit        # saia e entre de novo para o grupo docker valer
```

O script faz:

1. Atualiza o sistema.
2. Instala o Docker Engine.
3. Adiciona o `ubuntu` ao grupo `docker`.
4. Habilita o Docker no boot.
5. Instala e configura o Nginx como proxy reverso.
6. Cria `/opt/projeto-devops` com `chown ubuntu:ubuntu` e `chmod 755`.

## 6. Testando o pipeline completo

```bash
git checkout develop
git checkout -b feature/primeira-alteracao
# altere algo em src/views/index.html (ex.: "Versão 1.1")
git add .
git commit -m "Altera versão da página"
git push --set-upstream origin feature/primeira-alteracao
```

1. No GitHub, abra o **Pull Request** de `feature/primeira-alteracao` para `develop`. O CI roda só os testes.
2. Faça o **Merge**. O CI roda de novo e, se passar, faz o merge na `main`.
3. O push na `main` dispara o **Deploy**: a imagem vai para o Docker Hub e o container sobe na EC2.
4. Acesse `http://SEU_IP` no navegador e confira a alteração.

Acompanhe tudo na aba **Actions** do repositório.

---

## Observações sobre os arquivos de exemplo da aula

- **`deploy_ssh.yaml` da aula**: `host: ${{ <ip_instancia> }}` e `username: ${{ ubuntu }}` não são sintaxe válida do GitHub Actions. Aqui o host vem do secret `EC2_HOST` e o usuário é escrito direto: `username: ubuntu`.
- **PM2**: com Docker, quem mantém a aplicação no ar é o próprio container, com `restart: unless-stopped` no compose. O PM2 não é necessário nesse fluxo. Ele era usado na versão anterior do deploy, que rodava `node src/app.js` direto no servidor.
- **Portas**: o compose da aula mapeia `3000:3000` e o slide 3.2 sugere `80:3000`. Aqui foi usado `3000:3000` com o Nginx na porta 80 fazendo o proxy reverso, como no `exemplo-nginx.conf`. Assim as duas peças não disputam a porta 80.
- **Dockerfile**: copia o `package*.json` antes do código para aproveitar o cache de camadas, e instala só as dependências de produção (`--omit=dev`). Essas são as boas práticas do slide 3.1.

## Boas práticas aplicadas

- **Imagem leve**: base Alpine.
- **Segredos protegidos**: senhas, tokens e chaves ficam só nos GitHub Secrets. `.pem` e `.ppk` estão no `.gitignore`.
- **Rollback rápido**: cada imagem é etiquetada com o SHA do commit. Para voltar a uma versão, troque `latest` pela tag anterior no compose.
- **Limpeza do servidor**: `docker image prune -f` a cada deploy, para não lotar o disco da EC2.
