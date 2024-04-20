/*
Uses all content from rust_simulation.js, so we only need one file:
 */

let wasm;

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); }

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

/**
 * @param {number} num_samples
 * @param {number} num_dimensions
 * @param {number} _worker_index
 * @param {number} _num_workers
 * @returns {number}
 */
function monte_carlo_hypersphere_volume(num_samples, num_dimensions, _worker_index, _num_workers) {
    return wasm.monte_carlo_hypersphere_volume(num_samples, num_dimensions, _worker_index, _num_workers);
}

function notDefined(what) { return () => { throw new Error(`${what} is not defined`); }; }

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_random_26e2d782b541ca6b = typeof Math.random == 'function' ? Math.random : notDefined('Math.random');
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    return imports;
}

function __wbg_init_memory(imports, maybe_memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedUint8Memory0 = null;


    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(input) {
    if (wasm !== undefined) return wasm;

    const wasmUrl = 'rust_simulation_bg.wasm';

    const imports = __wbg_get_imports();

    if (typeof input === 'undefined') {
        input = wasmUrl;
    }

    // No need to use `fetch` if input is already a URL
    if (!(input instanceof URL)) {
        input = new URL(input, self.location.href);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await fetch(input), imports);

    return __wbg_finalize_init(instance, module);
}

/*
 * Actual Worker Code:
 */

// Listen for messages from the main thread
self.onmessage = async function(event) {
    if (event.data.type === 'start') {

        const workerIndex = event.data.workerID; // The index of this worker
        const numWorkers = event.data.numWorkers; // Total number of workers

        const numSamples = event.data.workerSamples; // Number of samples for the simulation
        console.log(numSamples);
        const numDimensions = event.data.numDimensions; // Number of dimensions

        await __wbg_init();

        let result = monte_carlo_hypersphere_volume(numSamples, numDimensions, workerIndex, numWorkers)

        self.postMessage([result, numSamples / numWorkers]);

    }
};