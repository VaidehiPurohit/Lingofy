import React from 'react'
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PhraseDetailCard from "../PhraseDetailCard";

const YSstructure = () => {
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
                    phrase="Panga"
                    Hindi="पंगा"
                    literal="Mess / Entanglement"
                    level="Informal"
                    meaning="Trouble / To pick a fight"
                    whenToUse="Used when someone is getting into a fight or a difficult situation."
                    example="A: Tu usse kyun lad raha hai? B: Maine panga nahi liya, usne shuru kiya."
                    gradient="bg-gradient-to-r from-orange-500 to-pink-500"
                    hoverBorder="hover:border-orange-400"
                    audioSrc="/Audio/KyahaalhaiDemo.mp3"
                />
                <PhraseDetailCard
                    phrase="Fattu"
                    Hindi="फट्टू"
                    literal="One who is torn" level="Slang" meaning="Coward / Scaredy-cat"
                    whenToUse="Used to tease a friend who is scared to do something adventurous." example="A: Horror movie dekhe? B: Nahi. A: Abe fattu hai kya?"
                    gradient="bg-gradient-to-r from-orange-500 to-pink-500"
                    hoverBorder="hover:border-orange-400"
                />

                <PhraseDetailCard
                    phrase="Dhakkan" Hindi="ढक्कन"
                    literal="Lid / Cap" level="Slang" meaning="Idiot / Dumb" whenToUse="Affectionate but insulting term for a friend acting stupid."
                    example="A: Iska answer kya hai? B: Oye dhakkan, ye toh sabse easy hai."
                    gradient="bg-gradient-to-r from-orange-500 to-pink-500"
                    hoverBorder="hover:border-orange-400"
                />
                <PhraseDetailCard
                    phrase="Machaya"
                    Hindi="मचाया"
                    literal="Caused (usually chaos/noise)"
                    level="Youth Slang" meaning="You killed it / You rocked it"
                    whenToUse="Used to compliment someone for doing an amazing job (Gaming/Sports)." example="A: Maine top kiya exam mein. B: Wah bhai, tune toh machaya!"
                    gradient="bg-gradient-to-r from-orange-500 to-pink-500"
                    hoverBorder="hover:border-orange-400"
                />
                <PhraseDetailCard
                   phrase="Bhau khaana" 
                   Hindi="भाव खाना" 
                   literal="To eat price" 
                   level="Idiom/Slang" 
                   meaning="Acting pricey / Playing hard to get" whenToUse="When someone ignores you or acts superior." 
                   example="A: Wo reply nahi kar rahi. B: Chod na, wo bas bhau kha rahi hai."
                    gradient="bg-gradient-to-r from-orange-500 to-pink-500"
                    hoverBorder="hover:border-orange-400"
                />
                <PhraseDetailCard
                    phrase="Fek mat" 
                    Hindi="फेक मत" literal="Don't throw" level="Casual" meaning="Don't bluff / Stop lying" 
                    whenToUse="Used when someone is exaggerating a story." example="A: Mere paas 5 girlfriends hain. B: Chal be, fek mat."
                    gradient="bg-gradient-to-r from-orange-500 to-pink-500"
                    hoverBorder="hover:border-orange-400"
                />
                <PhraseDetailCard
                    phrase="Kaand" 
                    Hindi="कांड" 
                    literal="Episode / Chapter" 
                    level="Slang" 
                    meaning="A scandal / A serious mistake / A disaster" 
                    whenToUse="When something major and usually bad has happened." 
                    example="A: Jaldi aa, hostel mein bada kaand ho gaya hai."
                    gradient="bg-gradient-to-r from-orange-500 to-pink-500"
                    hoverBorder="hover:border-orange-400"
                />
                <PhraseDetailCard
                    phrase="Chindi" 
                    Hindi="चंदी" 
                    literal="Small change / Rag" 
                    level="Slang" 
                    meaning="Cheap / Stingy person" 
                    whenToUse="Used for a friend who refuses to spend money." 
                    example="A: Wo treat dega? B: Bhool ja, wo bohot chindi hai."
                    gradient="bg-gradient-to-r from-orange-500 to-pink-500"
                    hoverBorder="hover:border-orange-400"
                />
                <PhraseDetailCard
                    phrase="BT" 
                    Hindi="बी.टी" 
                    literal="Bad Trip" 
                    level="Gen Z Slang" 
                    meaning="A bad mood / A difficult situation" whenToUse="Used when something ruins the vibe or causes stress." 
                    example="A: Teacher ne assignment reject kar diya. B: Yaar, bohot BT hai ye."
                    gradient="bg-gradient-to-r from-orange-500 to-pink-500"
                    hoverBorder="hover:border-orange-400"
                />
                <PhraseDetailCard
                    phrase="Dedh shaana" 
                    Hindi="डेढ़ शाणा" 
                    literal="One and a half smart" 
                    level="Street Slang" 
                    meaning="Oversmart / Cunning" 
                    whenToUse="Used for someone who thinks they are smarter than everyone else." 
                    example="A: Tu mujhe mat sikha, dedh shaana mat ban."
                    gradient="bg-gradient-to-r from-orange-500 to-pink-500"
                    hoverBorder="hover:border-orange-400"
                />
                <PhraseDetailCard
                    phrase="Gyaan" 
                    Hindi="ज्ञान" l
                    iteral="Knowledge" 
                    level="Casual Sarcasm" 
                    meaning="Unsolicited advice / Preaching" whenToUse="Used to tell someone to stop lecturing you." 
                    example="A: Tujhe subah jaldi uthna chahiye... B: Please yaar, gyaan mat de abhi."
                    gradient="bg-gradient-to-r from-orange-500 to-pink-500"
                    hoverBorder="hover:border-orange-400"
                />
                <PhraseDetailCard
                    phrase="Khali-pili" 
                    Hindi="खाली-पीली" 
                    literal="Empty-Yellow (Rhyming)" 
                    level="Slang" 
                    meaning="Unnecessarily / For no reason" whenToUse="Used when someone is stressing or talking without cause." 
                    example="A: Main bohot tension mein hoon. B: Khali-pili tension mat le, sab theek hoga."
                    gradient="bg-gradient-to-r from-orange-500 to-pink-500"
                    hoverBorder="hover:border-orange-400"
                />
            </div>
        </div>
    );
};

export default YSstructure