#!/bin/sh


source $HOME/.ghc-wasm/env

wasm32-wasi-cabal build --project-file=cabal-wasm.project wasm-decoder   


cp dist-newstyle/build/wasm32-wasi/ghc-9.12.1.20250309/wasm-metadata-decoder-0.1.0.0/x/wasm-decoder/build/wasm-decoder/wasm-decoder.wasm scripts/wasm/