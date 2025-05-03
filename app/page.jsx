import Wrapper from "@/layout/Wrapper";
import Home from "@/components/home-1";

export const metadata = {
  title: "De Flexijobber - Online vacaturesite voor flexwerkers in Vlaanderen",
  description:
    "De Flexijobber is een platform voor werkgevers en flexwerkers in Vlaanderen die op zoek zijn naar flexibele jobs in verschillende sectoren.",
};

export default function page() {
  return (
    <Wrapper>
      <Home />
    </Wrapper>
  );
}
