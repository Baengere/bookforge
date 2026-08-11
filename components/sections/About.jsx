export default function About() {
  return (
    <section
      id="about"
      className="border-t border-zinc-800 bg-[#0B0B0B] px-6 py-24 text-zinc-100"
    >
      <div className="mx-auto max-w-4xl">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-500">
          About BookForge
        </p>

        <h2 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">
          Stories for the curious.
        </h2>

        <div className="mt-10 space-y-6 text-lg leading-8 text-zinc-400">
          <p>
            BookForge began with a simple question:
          </p>

          <p className="text-xl font-medium text-zinc-200">
            What happens when we push beyond what we think we know?
          </p>

          <p>
            The world is full of accepted facts, familiar boundaries, and
            questions we rarely stop to ask. But what if we moved those
            boundaries a little? What if we imagined having extraordinary
            abilities, impossible choices, or the power to change something
            fundamental about ourselves?
          </p>

          <p>
            That is where the stories begin.
          </p>

          <p>
            BookForge is a space for experimenting with ideas through fiction.
            Some stories may challenge what we believe. Others may simply take
            an interesting idea somewhere unexpected. Along the way, they
            might leave you with a question, teach you something you didn't
            know, or give you a completely different way of looking at
            something familiar.
          </p>

          <p>
            There is no requirement to have all the answers.
          </p>

          <p>
            There is only an invitation to be curious.
          </p>

          <p>
            And perhaps, somewhere between one story and the next, to
            rediscover the pleasure of reading.
          </p>
        </div>

        <div className="mt-12 border-l-2 border-amber-500 pl-6">
          <p className="text-xl font-medium leading-8 text-zinc-200">
            Read. Question. Imagine. Explore.
          </p>
        </div>
      </div>
    </section>
  );
}