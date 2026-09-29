# Anatomy models – source and license

The 3D muscle models in this folder are **not** part of this project's own work.

| | |
| --- | --- |
| Files | `full-body-male-mobile.glb`, `full-body-female-mobile.glb`, `full-body-map.json`, `female-muscle-map.json` |
| Source | https://github.com/slfresh/fitmitwith-anatomy-atlas |
| Commit | `4120ee68b6604b8f2f69105d6de6166fad4734c4` |
| Derived from | Z-Anatomy (https://github.com/Z-Anatomy/Models-of-human-anatomy) and BodyParts3D (DBCLS) |
| License | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Changes | The two `.glb` files were losslessly re-encoded with `gltf-transform meshopt --level high` (EXT_meshopt_compression, KHR_mesh_quantization) to reduce their size; geometry and metadata are otherwise unchanged. The JSON maps are unchanged. Materials are replaced at runtime for coloring. |

SHA-256 (matches the values recorded in the maps):

```
d80bebc4045069b660ca8e7afe599d76d15ccc7d96410b3727c600ef01d24e54  full-body-male-mobile.glb
cf5350b62fdb42702b9227a4e8ec4fc1a7bffffef2601cc1c7cc57a72b3bfc99  full-body-female-mobile.glb
```

The female model is, according to its author, an illustrative, anatomically unreviewed variant of the male model
(`variantStatus: illustrative-unverified`).

ShareAlike: the models embedded in `StrongPro.html` remain under CC BY-SA 4.0; if you redistribute them (or an
adaptation), keep this notice and the license.
