import { Hero } from "~/components/hero";
import { Navigation } from "~/components/navigation";
import { TrustedBy } from "~/components/trustedby";
import { Footer } from "~/components/footer";
import { SelectedWork } from "~/components/selectedwork";
import { WhatWeDo } from "~/components/whatwedo";
import { Approach } from "~/components/approach";
import { BuiltByFounder } from "~/components/builtbyfounder";
import { ResultsProof } from "~/components/resultsproof";

export default function Index() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <TrustedBy />
        <SelectedWork />
        <ResultsProof />
        <WhatWeDo />
        <Approach />
        <BuiltByFounder />
      </main>
      <Footer />
    </>
  );
}
