import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ChallengeSection from "@/components/ChallengeSection";
import FeaturesSection from "@/components/FeaturesSection";
import CapabilitiesSection from "@/components/CapabilitiesSection";
import GovernanceSection from "@/components/GovernanceSection";
import CTASection from "@/components/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ChallengeSection />
      <FeaturesSection />
      <CapabilitiesSection />
      <GovernanceSection />
      <CTASection />
    </div>
  );
};

export default Index;
