import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PhraseDetailCard from "../PhraseDetailCard";

const ReactStructure = () => {
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
                <h1 className="text-3xl font-semibold">Reactions and Exclamations</h1>
                <p className="text-gray-500 text-sm">
                    Everyday Hindi Reactions
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                <PhraseDetailCard
                    phrase="Arre waah!"
                    Hindi="अरे वाह!"
                    literal="Oh wow!"
                    level="Common"
                    meaning="That's amazing! / Great job!" whenToUse="Used to express genuine admiration or pleasant surprise."
                    example="A: Maine nayi car li. B: Arre waah! Mubarak ho."
                    gradient="bg-gradient-to-r from-rose-400 to-pink-500"
                    hoverBorder="hover:border-rose-400"
                />

                <PhraseDetailCard
                    phrase="Arey yaar!"
                    Hindi="अरे यार!"
                    literal="Oh friend!"
                    level="Common"
                    meaning="Oh man! / Oh no! / Come on!"
                    whenToUse="The universal expression for frustration, disappointment, or sympathy."
                    example="A: Light chali gayi. B: Arey yaar! Ab kya karein?"
                    gradient="bg-gradient-to-r from-rose-400 to-pink-500"
                    hoverBorder="hover:border-rose-400"
                />

                <PhraseDetailCard
                    phrase="Baap re!"
                    Hindi="बाप रे!"
                    literal="Oh father!"
                    level="Common"
                    meaning="Oh my God! / Goodness gracious!" whenToUse="Used when you are shocked, scared, or overwhelmed by the size/price of something." example="A: Ye phone 2 lakh ka hai. B: Baap re! Itna mehenga?"
                   gradient="bg-gradient-to-r from-rose-400 to-pink-500"
                    hoverBorder="hover:border-rose-400"
                />

                <PhraseDetailCard
                    phrase="O teri!"
                    Hindi="ओ तेरी!"
                    literal="Oh yours... (Incomplete slang)" level="Slang"
                    meaning="Oh snap! / Oh shoot! / Wow!"
                    whenToUse="Used for sudden realization, mistake, or surprise (lighter than a swear word)."
                    example="A: Aaj Sunday nahi hai, Monday hai. B: O teri! Main toh bhool hi gaya."
                    gradient="bg-gradient-to-r from-rose-400 to-pink-500"
                    hoverBorder="hover:border-rose-400"
                />

                <PhraseDetailCard
                    phrase="Hadd hai"
                    Hindi="हद है"
                    literal="It is the limit"
                    level="Common"
                    meaning="This is too much / Unbelievable / Ridiculous"
                    whenToUse="Used when someone is being annoying or a situation is absurd."
                    example="A: Wo phir late aaya. B: Hadd hai yaar, wo sudhrega nahi."
                    gradient="bg-gradient-to-r from-rose-400 to-pink-500"
                    hoverBorder="hover:border-rose-400"
                />

                <PhraseDetailCard
                    phrase="Satya naash"
                    Hindi="सत्या नाश"
                    literal="Truth destruction"
                    level="Dramatic"
                    meaning="Disaster / Ruined / Darn it"
                    whenToUse="Used when something goes completely wrong or gets ruined."
                    example="A: Doodh ubal kar gir gaya. B: Satya naash! Ab saaf karna padega."
                    gradient="bg-gradient-to-r from-rose-400 to-pink-500"
                    hoverBorder="hover:border-rose-400"
                />

                <PhraseDetailCard
                    phrase="Kasam se"
                    Hindi="कसम से"
                    literal="By oath"
                    level="Common"
                    meaning="I swear / Honestly"
                    whenToUse="Used to emphasize that you are telling the truth."
                    example="A: Movie achi thi? B: Kasam se, bohot maza aaya."
                    gradient="bg-gradient-to-r from-rose-400 to-pink-500"
                    hoverBorder="hover:border-rose-400"
                />

                <PhraseDetailCard
                    phrase="Kya bakwaas hai"
                    Hindi="क्या बकवास है"
                    literal="What rubbish is"
                    level="Angry/Annoyed"
                    meaning="What the hell / What nonsense" whenToUse="Used when you hear something stupid or false."
                    example="A: Wo bol raha tha dharti flat hai. B: Kya bakwaas hai!"
                    gradient="bg-gradient-to-r from-rose-400 to-pink-500"
                    hoverBorder="hover:border-rose-400"
                />

                <PhraseDetailCard
                    phrase="Uff"
                    Hindi="उफ़"
                    literal="Oof"
                    level="Expression"
                    meaning="Oh my / Oof (Exhaustion or Admiration)" whenToUse="Can express tiredness ('Uff, itni garmi') or admiring beauty ('Uff, kya lag rahi hai')." example="A: Uff! Kitni garmi hai aaj."
                    gradient="bg-gradient-to-r from-rose-400 to-pink-500"
                    hoverBorder="hover:border-rose-400"
                />

                <PhraseDetailCard
                    phrase="Waah bhai waah"
                    Hindi="वाह भाई वाह"
                    literal="Wow brother wow"
                    level="Sarcastic/Praise"
                    meaning="Bravo / Well done (Often used sarcastically)"
                    whenToUse="Real praise, or ironic praise when someone does something stupid."
                    example="A: Maine apna phone paani mein gira diya. B: Waah bhai waah!"
                    gradient="bg-gradient-to-r from-rose-400 to-pink-500"
                    hoverBorder="hover:border-rose-400"
                />

            </div>
        </div>

    )
}

export default ReactStructure