export default function Hero() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center">

      <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-black md:text-7xl">
        Build Your Brand&apos;s
        <br />
        AI Brain
      </h1>

      <p className="mt-8 max-w-2xl text-lg leading-8 text-gray-600">
        Prompt AI Studio helps brands organize knowledge,
        manage prompts, and build their future AI content systems.
      </p>

      <div className="mt-10 flex gap-4">

        <button className="rounded-xl bg-black px-8 py-4 text-white hover:bg-gray-800">
          Start Building
        </button>

        <button className="rounded-xl border border-gray-300 px-8 py-4 text-black hover:bg-gray-100">
          Explore Platform
        </button>

      </div>

    </section>
  );
}
