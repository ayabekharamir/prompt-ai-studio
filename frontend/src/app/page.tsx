import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeatureCard from "@/components/FeatureCard";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">

      <Navbar />

      <Hero />

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-20 md:grid-cols-3">

        <FeatureCard
          title="Brand Brain"
          description="Store your brand identity, tone, audience, and content rules in one intelligent system."
        />

        <FeatureCard
          title="Prompt Library"
          description="Create, organize, version, and reuse professional prompts."
        />

        <FeatureCard
          title="AI Workflow"
          description="Prepare your brand for the future of autonomous AI content systems."
        />

      </section>

      <Footer />

    </main>
  );
}
