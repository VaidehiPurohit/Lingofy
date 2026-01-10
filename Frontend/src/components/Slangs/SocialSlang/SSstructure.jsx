import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PhraseDetailCard from "../PhraseDetailCard";

const SSstructure = () => {
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
                <h1 className="text-3xl font-semibold">Social Slang</h1>
                <p className="text-gray-500 text-sm">
                    Common Phrases in social situations
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                <PhraseDetailCard
                    phrase="Chalega"
                    Hindi="चलेगा" literal="It will walk" level="Casual" meaning="It works / That's fine" whenToUse="Used to agree to a plan or accept an option." example="A: Pizza order karein? B: Haan, chalega."
                    gradient="bg-gradient-to-r from-sky-500 to-cyan-500"
                    hoverBorder="hover:border-cyan-400"
                />
                <PhraseDetailCard
                    phrase="Pakka?"
                    Hindi="पक्का?"
                    literal="Cooked / Solid" level="Common"
                    meaning="Are you sure? / Promise?"
                    whenToUse="Used to confirm a plan or verify if someone is telling the truth."
                    example="A: Main kal aaoonga. B: Pakka?"
                    gradient="bg-gradient-to-r from-sky-500 to-cyan-500"
                    hoverBorder="hover:border-cyan-400"
                />
                <PhraseDetailCard
                    phrase="Bilkul"
                    Hindi="बिलकुल" literal="Absolutely" level="Common" meaning="Totally / Exactly / For sure"
                    whenToUse="Strong agreement with someone."
                    example="A: Ye galat hai na? B: Bilkul!"
                    gradient="bg-gradient-to-r from-sky-500 to-cyan-500"
                    hoverBorder="hover:border-cyan-400"
                />
                <PhraseDetailCard
                    phrase="Koi na"
                    Hindi="कोई ना"
                    literal="No one / None" level="Casual (Short for 'Koi baat nahi')"
                    meaning="No problem / It's okay / Never mind" whenToUse="Used to forgive someone or dismiss a small issue."
                    example="A: Sorry late ho gaya. B: Arre koi na."
                    gradient="bg-gradient-to-r from-sky-500 to-cyan-500"
                    hoverBorder="hover:border-cyan-400"
                />
                <PhraseDetailCard
                    phrase="Rehne de"
                    Hindi="रहने दे"
                    literal="Let it remain" level="Casual"
                    meaning="Forget it / Let it be / Don't bother"
                    whenToUse="Used when you give up on explaining something or tell someone not to do a task." example="A: Main help karoon? B: Nahi, tu rehne de."
                    gradient="bg-gradient-to-r from-sky-500 to-cyan-500"
                    hoverBorder="hover:border-cyan-400"
                />
                <PhraseDetailCard
                    phrase="Chalo"
                    Hindi="चलो"
                    literal="Walk / Move" level="Common"
                    meaning="Okay then / Let's go / Moving on"
                    whenToUse="Used to end a conversation, start leaving, or change the topic."
                    example="A: Bye! B: Chalo, milte hain."
                    gradient="bg-gradient-to-r from-sky-500 to-cyan-500"
                    hoverBorder="hover:border-cyan-400"
                />
                <PhraseDetailCard
                    phrase="Ho jayega"
                    Hindi="हो जाएगा"
                    literal="It will happen" level="Casual Assurance" meaning="Consider it done / Will do"
                    whenToUse="Used to assure someone that a task will be completed."
                    example="A: Ye kaam kal tak chahiye. B: Tension mat lo, ho jayega."
                    gradient="bg-gradient-to-r from-sky-500 to-cyan-500"
                    hoverBorder="hover:border-cyan-400"
                />
                <PhraseDetailCard
                    phrase="Kya baat hai"
                    Hindi="क्या बात है"
                    literal="What a matter" level="Common"
                    meaning="Wow! / That's great / Awesome"
                    whenToUse="Used to express appreciation or admiration." example="A: Maine nayi job join ki. B: Kya baat hai! Mubarak ho."
                    gradient="bg-gradient-to-r from-sky-500 to-cyan-500"
                    hoverBorder="hover:border-cyan-400"
                />
                <PhraseDetailCard
                    phrase="Bas?"
                    Hindi="बस?"
                    literal="Stop / Only / Enough" level="Common"
                    meaning="Is that it? / That's all?"
                    whenToUse="Used to ask if there is anything else or to say 'Stop'."
                    example="A: Aur kuch chahiye? B: Nahi, bas."
                    gradient="bg-gradient-to-r from-sky-500 to-cyan-500"
                    hoverBorder="hover:border-cyan-400"
                />
                <PhraseDetailCard
                    phrase="Sach mein?"
                    Hindi="सच में?"
                    literal="In truth?" level="Common" meaning="Really? / Are you serious?"
                    whenToUse="Used to express skepticism or surprise." example="A: Wo fail ho gaya. B: Sach mein?"
                    gradient="bg-gradient-to-r from-sky-500 to-cyan-500"
                    hoverBorder="hover:border-cyan-400"
                />
                <PhraseDetailCard
                    phrase="Dekhte hain"
                    Hindi="देखते हैं"
                    literal="We see"
                    level="Casual"
                    meaning="We'll see / Let's see (Often means 'Maybe' or 'No')" whenToUse="Used to delay a decision or politely avoid saying yes."
                    example="A: Trip pe chalein? B: Pata nahi, dekhte hain."
                    gradient="bg-gradient-to-r from-sky-500 to-cyan-500"
                    hoverBorder="hover:border-cyan-400"
                />
                <PhraseDetailCard
                    phrase="Samjha"
                    Hindi="समझा"
                    literal="Understood" level="Common"
                    meaning="Got it? / Understood?" whenToUse="Used to check if the other person follows what you are saying."
                    example="A: Isko aise karna hai, samjha? B: Haan, samjha."
                    gradient="bg-gradient-to-r from-sky-500 to-cyan-500"
                    hoverBorder="hover:border-cyan-400"
                />
            </div>
        </div>

    )
}

export default SSstructure