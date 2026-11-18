import Benefits from '@/components/Home/Benefits';
import ClosingCta from '@/components/Home/ClosingCta';
import CounselorShowcase from '@/components/Home/CounselorShowcase';
import ForProfessionals from '@/components/Home/ForProfessionals';
import Hero from '@/components/Home/Hero';
import HowItWorks from '@/components/Home/HowItWorks';
import TrustHighlights from '@/components/Home/TrustHighlights';

export default function Home() {
    return (
        <>
            <Hero />
            <TrustHighlights />
            <HowItWorks />
            <Benefits />
            <CounselorShowcase />
            <ForProfessionals />
            <ClosingCta />
        </>
    );
}
