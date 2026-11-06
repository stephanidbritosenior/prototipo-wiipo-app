# Protótipo — design reference

This is a design mockup created in a visual design tool, exported as a
standalone page. Treat it as a REFERENCE MOCKUP, not production code:
the markup and inline styles carry the design's precise values — colors,
font sizes, spacing, radii, shadows, layout — which an implementation
should replicate faithfully in its own components and styling system
rather than copy wholesale.

## Contents

- `App.dc.html` — the artboard (a Design Component: an `<x-dc>`
  template + a small logic class). The values to replicate live in its
  inline `style="…"` attributes and the `<helmet><style>` block.
- `Alterar.dc.html` — referenced resource
- `AlterarSucesso.dc.html` — referenced resource
- `Blog.dc.html` — referenced resource
- `BlogPost.dc.html` — referenced resource
- `Cadastro.dc.html` — referenced resource
- `CartaoVirtual.dc.html` — referenced resource
- `Clubii.dc.html` — referenced resource
- `Codigo.dc.html` — referenced resource
- `Comprovante.dc.html` — referenced resource
- `Configuracoes.dc.html` — referenced resource
- `Demonstrativo.dc.html` — referenced resource
- `EducacaoFinanceira.dc.html` — referenced resource
- `EdutivoWebview.dc.html` — referenced resource
- `Entrar.dc.html` — referenced resource
- `Flex.dc.html` — referenced resource
- `FlexBolso.dc.html` — referenced resource
- `FlexSeguranca.dc.html` — referenced resource
- `Helpii.dc.html` — referenced resource
- `Holerite.dc.html` — referenced resource
- `HoleritePDF.dc.html` — referenced resource
- `Home.dc.html` — referenced resource
- `InformeRendimentos.dc.html` — referenced resource
- `Login.dc.html` — referenced resource
- `Main.dc.html` — referenced resource
- `NamuWebview.dc.html` — referenced resource
- `Notificacoes.dc.html` — referenced resource
- `Recuperar.dc.html` — referenced resource
- `SaibaMais.dc.html` — referenced resource
- `SaraChat.dc.html` — referenced resource
- `Seguranca.dc.html` — referenced resource
- `Social.dc.html` — referenced resource
- `Splash.dc.html` — referenced resource
- `Transferencia.dc.html` — referenced resource
- `VimeoWebview.dc.html` — referenced resource
- `SvaDetalhe.dc.html` — referenced resource
- `BuscaApp.dc.html` — referenced resource
- `assets/` — files uploaded to the design (images, fonts, media)
- `support.js`, `vendor/react*.js` — the runtime that renders the
  component in a browser; not part of the design.

## Uploaded files

Images, fonts and media uploaded to the design are written once each under
`assets/` — 89 in this export — and the exported files refer to them there. A
reference a script puts together while the page runs (for example
`"/_blob/" + id`) is not rewritten and does not load from this folder.

## Viewing

Serve the folder (e.g. `python3 -m http.server`) and open `App.dc.html`;
some browsers block the scripts over file://.
