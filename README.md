# @bardotiao/ui

Peças de interface e áudio compartilhadas entre o portal do Bar do Tião e os jogos: modal, avatar, campos de formulário, escape de HTML, efeitos de carta e serviço de áudio.

## Uso
```bash
npm i github:TheCics/ui#v1.0.0
```
```js
import { modalShell, val } from '@bardotiao/ui';
```
O ponto de entrada é `src/index.js` (ESM, sem efeitos colaterais).

## Mudanças
- Mantenha a API compatível: o `uno`, o `domino` e o portal importam daqui.
- Para publicar: `git tag vX.Y.Z && git push --tags`; depois atualize a tag nos repositórios que usam.
- `card-fx` não conhece o portal: o portal informa se as animações estão ligadas com `setAnimationsSource(() => opts.anim)`.
