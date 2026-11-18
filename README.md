# 🐵 Macaco Espacial

Jogo infinito 2D com física: balance entre asteroides, fuja da tempestade solar e colete bananas!
Funciona como app instalável (PWA) em Android e iPhone, inclusive sem internet.

## Arquivos
| Arquivo | Para que serve |
|---|---|
| `index.html` | O jogo inteiro |
| `sw.js` | Service worker: modo offline e aviso de nova versão |
| `manifest.webmanifest` | Nome, ícone e tela cheia do app instalado |
| `icon-*.png`, `apple-touch-icon.png` | Ícones |

## Como publicar uma nova versão
1. Substitua os arquivos alterados no repositório (Add file → Upload files → Commit changes).
2. **Sempre** aumente o número em `sw.js` → `const VERSION = '1.1.0';` (ex.: `1.1.1`, `1.2.0`).
   Sem isso, os celulares que já instalaram o jogo não recebem a atualização.
3. Em ~2 minutos o GitHub Pages publica. Na próxima vez que o jogo for aberto, aparece
   "✨ Nova versão disponível! Toque para atualizar". O progresso (recorde, bananas, skins) é mantido.

> Não altere a chave de salvamento `macacoEspacial_v1` no `index.html`, nem o nome do repositório:
> isso faria o progresso salvo "sumir".
