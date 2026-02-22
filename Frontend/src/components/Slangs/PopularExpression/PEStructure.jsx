import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PhraseDetailCard from "../PhraseDetailCard";

const PEstructure = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-6xl mx-auto px-6 py-5 space-y-10 w-full">
            <button
                onClick={() => navigate("/dashboard/slang")}
                className="flex items-center gap-2 text-m font-medium text-gray-500 hover:text-gray-700"
            >
                <ArrowLeft size={16} />
                Back to Slang
            </button>
            <div className="space-y-1">
                <h1 className="text-3xl font-semibold">Popular Expressions</h1>
                <p className="text-gray-500 text-sm">
                    Trending phrases and idioms
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

                <PhraseDetailCard
                    phrase="Sahi hai"
                    literal="सही है"
                    level="Casual"
                    meaning="That's cool / Nice"
                    whenToUse="Used to validate something or express mild jealousy."
                    example="A: Kal main Goa ja raha hoon. B: Sahi hai bhai!"
                    gradient="bg-gradient-to-r from-purple-500 to-pink-500"
                    hoverBorder="hover:border-purple-400"
                    audioSrc="/src/assets/Audio/PE/SahiHai.mp3"
                />

                <PhraseDetailCard
                    phrase="Waat lag gayi"
                    Hindi="वाट लग गई"
                    literal="Watt is applied"
                    level="Slang"
                    meaning="I'm screwed / In big trouble" whenToUse="When a situation goes terribly wrong."
                    example="A: Boss ne dekh liya? B: Haan, waat lag gayi aaj."
                    gradient="bg-gradient-to-r from-purple-500 to-pink-500"
                    hoverBorder="hover:border-purple-400"
                    audioSrc="/src/assets/Audio/PE/Watlaggayi.mp3"
                />

                <PhraseDetailCard
                    phrase="Jugaad"
                    Hindi="जुगाड़"
                    literal="Arrangement / Hack"
                    level="Cultural Slang"
                    meaning="A creative hack, quick fix, or connection"
                    whenToUse="The most common Indian word for fixing problems non-traditionally."
                    example="A: Ticket nahi mili. B: Chinta mat kar, kuch jugaad karte hain."
                    gradient="bg-gradient-to-r from-purple-500 to-pink-500"
                    hoverBorder="hover:border-purple-400"
                    audioSrc="/src/assets/Audio/PE/Jugaad.mp3"
                />
                <PhraseDetailCard
                   phrase="Pakau" 
                   Hindi="पकाऊ" 
                   literal="One who cooks (brains)" 
                   level="Informal" meaning="Boring / Annoying person" 
                   whenToUse="Used to describe someone who talks too much or is boring." 
                   example="A: Wo lecture kaisa tha? B: Bohot pakau tha yaar."
                    gradient="bg-gradient-to-r from-purple-500 to-pink-500"
                    hoverBorder="hover:border-purple-400"
                    audioSrc="/src/assets/Audio/PE/Pakau.mp3"
                />
                <PhraseDetailCard
                    phrase="Kalti maar" 
                    Hindi="कलटी मार" 
                    literal="Hit a somersault/turn" 
                    level="Street Slang" 
                    meaning="Get lost / Let's leave quickly" 
                    whenToUse="Used when you want to escape a situation or tell someone to go away." 
                    example="A: Police aa rahi hai! B: Jaldi kalti maar!"
                    gradient="bg-gradient-to-r from-purple-500 to-pink-500"
                    hoverBorder="hover:border-purple-400"
                    audioSrc="/src/assets/Audio/PE/KaltiMaar.mp3"
                />
                <PhraseDetailCard
                   phrase="Vella" 
                   Hindi="वेल्ला" literal="Idle" level="Informal" meaning="Jobless / Free / Having nothing to do" whenToUse="Used to describe a friend who is always free to hang out." 
                   example="A: Tu free hai? B: Haan, main toh vella hoon."
                    gradient="bg-gradient-to-r from-purple-500 to-pink-500"
                    hoverBorder="hover:border-purple-400"
                    audioSrc="/src/assets/Audio/PE/Vella.mp3"
                />
                <PhraseDetailCard
                    phrase="Dhaasu"
                    Hindi="धांसू" literal="Explosive/Solid" level="Slang" meaning="Awesome / Spectacular / Solid" whenToUse="Used to praise a performance, movie, or object." 
                    example="A: Movie kaisi thi? B: Ekdum dhaasu thi!"
                    gradient="bg-gradient-to-r from-purple-500 to-pink-500"
                    hoverBorder="hover:border-purple-400"
                    audioSrc="/src/assets/Audio/PE/Dhaasu.mp3"
                />
                <PhraseDetailCard
                    phrase="Jhol" 
                    Hindi="झोल" literal="Bagginess/Wrinkle" level="Slang" meaning="Something suspicious / A scam / A mess" 
                    whenToUse="When you suspect something is not right or shady." 
                    example="A: Hisaab barabar hai? B: Nahi, kuch jhol lag raha hai."
                    gradient="bg-gradient-to-r from-purple-500 to-pink-500"
                    hoverBorder="hover:border-purple-400"
                    audioSrc="/src/assets/Audio/PE/Jhol.mp3"
                />
                <PhraseDetailCard
                    phrase="Bas kar" 
                    Hindi="बस कर" 
                    literal="Do enough" level="Casual" 
                    meaning="Stop it / That's enough" 
                    whenToUse="Used to tell someone to stop talking or doing something." example="A: (Keeps joking) B: Bas kar bhai, ab pak mat."
                    gradient="bg-gradient-to-r from-purple-500 to-pink-500"
                    hoverBorder="hover:border-purple-400"
                    audioSrc="/src/assets/Audio/PE/BasKar.mp3"
                />
                <PhraseDetailCard
                    phrase="Oye" 
                    Hindi="ओये" 
                    literal="Hey" 
                    level="Casual" meaning="Hey! / Listen!" whenToUse="A very common way to grab someone's attention instantly." 
                    example="A: Oye! Idhar aa sun. B: Kya hua?"
                    gradient="bg-gradient-to-r from-purple-500 to-pink-500"
                    hoverBorder="hover:border-purple-400"
                    audioSrc="/src/assets/Audio/PE/Oye.mp3"
                />



            </div>


        </div>
    );
};

export default PEstructure;