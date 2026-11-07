import Navbar from '@/components/Navigation/Navbar';
import { getDictionary } from '@/i18n';

async function LandingLayout({ children, params }: LayoutProps<'/[locale]'>) {
    const { locale } = await params;
    const t = await getDictionary();

    return (
        <>
            <header className="bg-white">
                <Navbar
                    t={t.navigation}
                    locale={locale}
                    className="max-w-8xl mx-auto"
                />
            </header>
            <main className="max-w-8xl mx-auto">{children}</main>
        </>
    );
}

export default LandingLayout;
