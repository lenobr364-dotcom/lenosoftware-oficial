# ChemVault Global

Plataforma Next.js para licenciamento químico industrial, cofre de fórmulas e painel executivo (BIJU / leno.software).

---

## Relatório de prontidão para deploy

O sistema está **pronto para escala global**, com os pilares abaixo validados em código e em pipeline de build.

| Pilar | Estado |
|--------|--------|
| **Criptografia** | Dados sensíveis de fórmulas com AES-256-GCM em repouso; backups para GCS com blob encriptado; sessões CEO e licenças com segredos fortes; palavra-passe executiva com scrypt na BD (quando configurada). |
| **Multi-idioma** | Interface `next-intl` com locales **en, de, pt, hi, ar** (incl. RTL para árabe), mensagens alinhadas em `messages/*.json`, SEO e meta-tags por locale. |
| **Sociedade definida (50/50)** | Narrativa societária **Leno César & Lumen Onel** e venture **ChemVault Global** integradas na landing, documentação legal e experiência de marca (glass / neon). |
| **Escala global** | `output: "standalone"` para contentores; integrações GCP/Gemini opcionais; backup diário para GCS (SDK ou URL assinada); stress scripts e painéis operacionais. |

### Cache de assets (produção)

`next.config.ts` define **Cache-Control** agressivo (`max-age=31536000, immutable`) para SVGs em `public/` e `/icon.svg`. O bundle versionado em **`/_next/static/*`** (JS, CSS, fontes do `next/font`) já é servido pelo Next com **fingerprint + cache imutável** em produção — não duplicamos headers aí para não interferir com `next dev` nem com otimizações internas.

Isto reduz round-trips em regiões com RTT alto (ex.: Dubai, São Paulo, Nova York) após o primeiro carregamento.

### Sanitização de segurança (revisão dirigida)

Foi feita uma **revisão estática** focada em **SQL injection** e **XSS** nas áreas novas do dashboard (gráfico de tendência de licenças, perfil executivo, APIs associadas):

- **SQL:** `getLicenseRequestTrend30d` usa apenas `prisma.licenseRequest.findMany` com `Date` — sem concatenação de SQL nem `$queryRawUnsafe` no código da aplicação (`lib/`, `app/`).
- **XSS:** não há `dangerouslySetInnerHTML` em `app/`; o gráfico usa dados numéricos/datas gerados no servidor; o perfil renderiza texto via React/`next-intl` e opções MFA fixas no cliente; `QRCodeSVG` recebe `otpauth://` gerado pelo servidor após autenticação.

Recomendação operacional: manter **CSP** e **rate limiting** na borda (CDN / API gateway) em produção pública.

---

## Início rápido (desenvolvimento)

```bash
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
npm run dev
```

Abrir `http://localhost:3000` (o router de locales redireciona conforme configuração).

## Build de produção

```bash
npm run build
npm run start
```

- **Build command:** `npm run build`  
- **Output:** padrão Next.js; modo **standalone** ativo para imagem Docker.

## Variáveis de ambiente

Ver `.env.example` para a lista atual (CEO, MFA, e-mail, Gemini/GCP, backup GCS, `NEXT_PUBLIC_APP_URL`, etc.).

---

## Estrutura de alto nível

- Landing e gateway comerciais (`BijuLanding`, acesso ChemVault).
- Dashboard restrito (CEO + licença core): cofre, analytics, leads, suporte, **perfil** (senha + MFA/TOTP), monitorização.
- APIs em `app/api/*` com validação Zod onde aplicável.

---

© BIJU Global Technology · ChemVault Global — materiais comerciais confidenciais.
