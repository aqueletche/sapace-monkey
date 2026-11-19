# 🐵 Macaco Espacial — v2.0

Jogo infinito 2D com física: balance entre asteroides, fuja da tempestade solar e colete bananas!
Funciona como app instalável (PWA) em Android e iPhone, inclusive sem internet.

## Arquivos
| Arquivo | Para que serve |
|---|---|
| `index.html` | Estrutura das telas |
| `style.css` | Visual das telas (menus, loja, metas) |
| `js/data.js` | Dados: níveis, mundos, conquistas, itens da loja, missões e save |
| `js/game.js` | Motor do jogo: física, mundos, objetos, eventos, chefes e desenho |
| `js/ui.js` | Telas: menu, loja, metas, baú diário, backup, compartilhar e PWA |
| `sw.js` | Service worker: modo offline e aviso de nova versão |
| `manifest.webmanifest` + ícones | Instalação como app |

## Como publicar uma nova versão
1. Envie os arquivos alterados para o repositório, **mantendo a pasta `js/`** (Add file → Upload files → arraste a pasta inteira).
2. **Sempre** aumente o número em `sw.js` → `const VERSION = '2.0.0';`.
3. Em ~2 minutos o GitHub Pages publica e o jogo mostra "Nova versão disponível".

> Não altere a chave de salvamento `macacoEspacial_v1` (em `js/data.js`) nem o nome do repositório:
> isso faria o progresso salvo "sumir". Para trocar de celular, use Config → Backup.
