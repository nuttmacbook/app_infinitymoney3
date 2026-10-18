const footer = /*html*/`
    <footer class="mx-auto mt-12 w-full max-w-6xl px-4 pb-10 sm:mt-16 sm:px-6">
        <div class="h-px bg-gradient-to-r from-transparent via-sky-300/40 to-transparent"></div>
        <p class="mt-4 text-center text-xs text-sky-200/70">Infinity Money runs on BNB Smart Chain. Every placement is recorded on-chain.</p>
    </footer>
`;

const loading = /*html*/`
    <div class="mx-auto mt-16 flex w-full max-w-6xl flex-col items-center gap-3 px-4" role="status">
        <span class="h-10 w-10 animate-spin rounded-full border-4 border-sky-200/30 border-t-yellow-300 motion-reduce:animate-none"></span>
        <p class="text-sm text-sky-100/80">Loading your matrices…</p>
    </div>
`;

export { footer, loading };
