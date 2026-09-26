# Vendored authoring tool

Source: https://github.com/dgreenheck/ez-tree
Revision: dcf309bd86bd521083d9c70f01f2de45fdc7c457
Author: Daniel Greenheck. License: MIT, retained in LICENSE.

Local compatibility change: relative JavaScript imports include `.js`; JSON imports use Node import attributes. This source is used only by `scripts/build-botanical-model.mjs`, never sent to the browser. No third-party wind shader is used at runtime.

Bark012 textures originate from ambientCG (CC0). The foliage texture is included under the EZ-Tree MIT license. Attribution and license are also stored alongside the public model.
