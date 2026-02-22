import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PhraseDetailCard from "../PhraseDetailCard";

const PopStructure = () => {
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
                <h1 className="text-3xl font-semibold">Bollywood and Pop Culture</h1>
                <p className="text-gray-500 text-sm">
                    Lets get Filmy!
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

                <PhraseDetailCard
                    phrase="Apna time aayega"
                    Hindi="अपना टाइम आएगा"
                    literal="My time will come"
                    level="Pop Culture (Gully Boy)"
                    meaning="I will succeed one day / My moment of glory is coming"
                    whenToUse="Used to motivate oneself or claim that you will be successful soon." example="A: Abhi fail ho gaya, par chinta mat kar. Apna time aayega."
                    gradient="bg-gradient-to-r from-fuchsia-500 to-pink-500"
                    hoverBorder="hover:border-fuchsia-400"
                    audioSrc="/src/assets/Audio/PopandCasual/ApnaTimeAayega.mp3"
                />

                <PhraseDetailCard
                    phrase="Bindaas"
                    Hindi="बिंदास"
                    literal="Without a knot (Carefree)"
                    level="Casual/Slang"
                    meaning="Cool / Carefree / Fearless / Chill" whenToUse="Used to describe a person who doesn't worry about anything."
                    example="A: Wo ladki kaisi hai? B: Ekdum bindaas hai."
                    gradient="bg-gradient-to-r from-fuchsia-500 to-pink-500"
                    hoverBorder="hover:border-fuchsia-400"
                    audioSrc="/src/assets/Audio/PopandCasual/Bindass.mp3"
                />

                <PhraseDetailCard
                    phrase="Picture abhi baaki hai"
                    Hindi="पिक्चर अभी बाकी है"
                    literal="The movie is still remaining"
                    level="Filmy (Om Shanti Om)"
                    meaning="It's not over yet / The real action is yet to come"
                    whenToUse="Used when someone thinks a task is finished, but there's a twist left."
                    example="A: Hum haar gaye. B: Haar mat maan, picture abhi baaki hai mere dost."
                    gradient="bg-gradient-to-r from-fuchsia-500 to-pink-500"
                    hoverBorder="hover:border-fuchsia-400"
                    audioSrc="/src/assets/Audio/PopandCasual/PictureAbhiBaakiHai.mp3"
                />
                <PhraseDetailCard
                    phrase="Jhakaas"
                    Hindi="झकास"
                    literal="Superb (Anil Kapoor style)"
                    level="Street Slang"
                    meaning="Awesome / Fantastic / Superb"
                    whenToUse="A high-energy way to say something is excellent."
                    example="A: Meri shirt kaisi lag rahi hai? B: Ekdum jhakaas!"
                    gradient="bg-gradient-to-r from-fuchsia-500 to-pink-500"
                    hoverBorder="hover:border-fuchsia-400"
                    audioSrc="/src/assets/Audio/PopandCasual/Jhakas.mp3"
                />
                <PhraseDetailCard
                    phrase="Tumse na ho payega"
                    Hindi=" तुमसे ना हो पाएगा"
                    literal="You won't be able to do it"
                    level="Meme/Slang (Gangs of Wasseypur)"
                    meaning="You are incapable / Give up / This is out of your league"
                    whenToUse="Used (often jokingly) to tell a friend they are failing at a task."
                    example="A: Main gym join karoon? B: Rehne de beta, tumse na ho payega."
                    gradient="bg-gradient-to-r from-fuchsia-500 to-pink-500"
                    hoverBorder="hover:border-fuchsia-400"
                    audioSrc="/src/assets/Audio/PopandCasual/TumseNaHoPaayega.mp3"
                />
                <PhraseDetailCard
                    phrase="Utha le re baba"
                    Hindi="उठा ले रे बाबा"
                    literal="Pick (me) up, oh God"
                    level="Meme/Slang (Hera Pheri)"
                    meaning="Oh God, save me from this idiocy / I can't take this anymore"
                    whenToUse="Used when frustrated by someone's stupidity or a bad situation."
                    example="A: (Says something stupid) B: Utha le re baba, utha le."
                    gradient="bg-gradient-to-r from-fuchsia-500 to-pink-500"
                    hoverBorder="hover:border-fuchsia-400"
                    audioSrc="/src/assets/Audio/PopandCasual/UthaleReBaba.mp3"
                />
                <PhraseDetailCard
                    phrase="All Izz Well"
                    Hindi="ऑल इज़ वेल"
                    literal="All is well"
                    level="Pop Culture (3 Idiots)"
                    meaning="Everything is fine / Calm down" whenToUse="Used to calm yourself or others down during a stressful moment."
                    example="A: Exam ka result aane wala hai! B: Tension mat le, bol All Izz Well."
                    gradient="bg-gradient-to-r from-fuchsia-500 to-pink-500"
                    hoverBorder="hover:border-fuchsia-400"
                    audioSrc="/src/assets/Audio/PopandCasual/ALLisWELL.mp3"
                />
                <PhraseDetailCard
                    phrase="Main apni favorite hoon"
                    Hindi="मैं अपनी फेवरेट हूँ"
                    literal="I am my own favorite"
                    level="Pop Culture (Jab We Met)"
                    meaning="I love myself / I am confident" whenToUse="Used to express self-love or confidence (mostly by girls)."
                    example="A: Tumhe kaun pasand hai? B: Main apni favorite hoon."
                    gradient="bg-gradient-to-r from-fuchsia-500 to-pink-500"
                    hoverBorder="hover:border-fuchsia-400"
                    audioSrc="/src/assets/Audio/PopandCasual/MeinApnaFavouriteHoon.mp3"
                />
                <PhraseDetailCard
                    phrase="Keh diya na, bas keh diya"
                    Hindi="कह दिया ना, बस कह दिया"
                    literal="Said it, just said it"
                    level="Filmy (K3G)"
                    meaning="My word is final / End of discussion" whenToUse="Used to assert authority and stop an argument." 
                    example="A: Par papa... B: Nahi. Keh diya na, bas keh diya."
                    gradient="bg-gradient-to-r from-fuchsia-500 to-pink-500"
                    hoverBorder="hover:border-fuchsia-400"
                    audioSrc="/src/assets/Audio/PopandCasual/KehDiyaNa.mp3"
                />
                <PhraseDetailCard
                    phrase="Khallas" 
                    Hindi="खल्लास" 
                    literal="Finished" 
                    level="Slang (Company)" 
                    meaning="Finished / Done for / Game over" whenToUse="Used when a task is completed or someone is 'finished'." 
                    example="A: Project complete ho gaya? B: Haan, ekdum khallas."
                    gradient="bg-gradient-to-r from-fuchsia-500 to-pink-500"
                    hoverBorder="hover:border-fuchsia-400"
                    audioSrc="/src/assets/Audio/PopandCasual/Kalas.mp3"
                />
            </div>
        </div>
    );
};

export default PopStructure;