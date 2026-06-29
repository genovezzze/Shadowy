import { HeroGeometric } from "@/components/ui/shape-landing-hero"

function DemoHeroGeometric() {
    return (
        <HeroGeometric
            badge="Shadowy"
            title={
                <>
                    Padariet <span className="text-gradient-emerald">neredzamo<br />darbu</span> redzamu.
                </>
            }
            description="Shadowy palīdz uzņēmumiem pamanīt slēpto darba slodzi, papildu pienākumus un darbu ārpus oficiālās lomas - bez darbinieku novērošanas."
        />
    )
}

export { DemoHeroGeometric }
