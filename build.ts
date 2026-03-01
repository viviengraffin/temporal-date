const bundles: Deno.bundle.Options[] = [
    {
        entrypoints:["./main.ts"],
        outputDir: "dist/clone-date.js",
        platform:"browser"
    }
];

bundle(bundles);

async function bundle(bundles: Deno.bundle.Options[]) {
    for(const bundle of bundles) {
        await Deno.bundle(bundle);
    }
}