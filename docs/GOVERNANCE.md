# Governança — AgnoHub painel React

> Este documento existe porque o projeto é **trabalho da empresa (Pitang)** hospedado, hoje, em conta pessoal pública. Ele lista o que precisa acontecer, em ordem, e quem faz (a maioria é ação do dono do repositório — marcada como **[VOCÊ]**).

## ⚡ Faça hoje (3 itens)

1. **[VOCÊ] Tornar o repositório privado.** GitHub → `Settings` → `General` → role até *Danger Zone* → **Change repository visibility** → *Make private*. Antes, confira se existem forks (`Insights` → `Forks`): forks públicos criados antes da mudança **permanecem públicos**.
2. **[VOCÊ] Tratar as 5 chaves do zip original como comprometidas.** O arquivo `.playground_keys.json` do zip `agnohub-main` contém valores com formato de chave de projeto. Se forem reais, **revogue e regenere nos provedores** hoje. (Este repositório está limpo — a exposição é do zip na sua máquina.)
3. **[VOCÊ] Não redistribuir o zip original.** Ele contém `.playground_keys.json` e a pasta `palace/` (dados com padrões de e-mail/telefone/saúde — trate como sensíveis até confirmação). Se um dev precisar do original, aponte para o repositório git `clvschaves/agnohub`, nunca para o zip.

## Transferência para a organização

Depois de privado, transfira o repositório para a organização da Pitang:

- `Settings` → `General` → *Danger Zone* → **Transfer ownership** → informe a org.
- A transferência preserva issues, stars e cria redirect da URL antiga.
- Se a org ainda não existe, crie-a antes (ou peça ao admin do GitHub da empresa).
- Convide o(s) dev(s) como colaboradores com papel *Write* (ou via time da org).

## Proteção da branch `main`

Após a transferência, em `Settings` → `Branches` → **Add branch protection rule** (`main`):

- ☑ *Require a pull request before merging* → *Require approvals: 1*
- ☑ *Require status checks to pass before merging* → selecionar o check do CI (`.github/workflows/ci.yml`)
- ☑ *Do not allow bypassing the above settings*

Complemento: preencher `.github/CODEOWNERS` (placeholder já criado) com o time responsável, para que o GitHub solicite review automaticamente.

## Licença

A `LICENSE` atual é **MIT em nome de "Danilo Amaral / AgnoHub"**. Para trabalho feito para a empresa isso é frágil nos dois sentidos: concede a terceiros direitos que a Pitang talvez não queira conceder, e atribui a titularidade a pessoa física.

**Recomendação:** substituir por licença proprietária **após aprovação do jurídico/gestor**. Texto pronto para o commit:

```
Copyright © 2026 Pitang Tecnologia. Todos os direitos reservados.

Este software e sua documentação são propriedade da Pitang Tecnologia.
Não é permitida a reprodução, distribuição ou criação de trabalhos
derivados sem autorização expressa e por escrito.
```

> ⚠️ Atenção: enquanto o repositório esteve público sob MIT, cópias feitas nesse período permanecem licenciadas sob MIT. Mais um motivo para privar o repositório imediatamente.

Nota de terceiros a preservar em qualquer troca de licença: `src/components/data-table/` é adaptado de [satnaing/shadcn-admin](https://github.com/satnaing/shadcn-admin) (MIT © Sat Naing) — manter o aviso de copyright original desse trecho.

## Checklist de segurança do material original (fora deste repo)

- [ ] Validar se os 5 valores de `.playground_keys.json` são chaves reais; revogar/regenerar as reais.
- [ ] Revisar a pasta `palace/` do zip: se os dados forem reais (e-mails, telefones, dados de saúde), tratar como incidente de dados e sanitizar; se sintéticos, documentar isso.
- [ ] Apagar o zip de locais compartilhados (drives, e-mail, mensageiros), mantendo apenas cópia local se necessária.
- [ ] Registrar para o dev: o backend canônico é `clvschaves/agnohub` (git); o SHA de referência usado por este frontend está fixado em `STATUS.md`.

## Processo a partir daqui

- Trabalho novo entra por branch + pull request revisado (ver `CONTRIBUTING.md`).
- `main` é a fonte de verdade estável; nenhuma escrita direta.
- Decisões e aprendizados técnicos são registrados em `docs/solutions/` (padrão já praticado neste repositório).
