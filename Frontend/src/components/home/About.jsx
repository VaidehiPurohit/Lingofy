
import { Globe, Globe2, ListChecks, MessageCircle, Zap } from "lucide-react";
import React from "react";
import Title from "./Title";
import Heropic from "../../assets/heropic.png";

const About = () => {
    const [isHover, setIsHover] = React.useState(false);

    return (
        <div id="about" className="flex flex-col items-center mt-8">

            {/* Badge */}
            <div className="flex items-center gap-2 text-sm text-indigo-600 bg-indigo-400/10 rounded-full px-8 py-2">
                <Zap width={14} />
                <span>About Us</span>
            </div>


            {/* Title */}
            <Title
                title="Learn. Practice. Speak."
                description="Bite-sized lessons, real conversations, and progress you can feel."
            />



            {/* Main Content */}
            <div className="flex flex-col md:flex-row items-center gap-12 xl:-mt-10 w-full max-w-7xl">
                {/* IMAGE — FIXED SIZE */}
                <div className="w-full md:w-1/2 flex justify-center md:ml-6 lg:ml-10 mt-6">
                    <img
                        src={Heropic}
                        alt="heropic"
                        className="
                                 mt-8
                                 w-full
                                max-w-xs
                                sm:max-w-sm
                                lg:max-w-md
                                h-auto
                                object-contain
                                rounded-3xl
            "
                    />
                </div>



                {/* GOALS */}

                <div className="px-4 mt-11" onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)}>
                    {/* GOALS-1 */}
                    <div className={"flex items-center justify-center gap-6 max-w-md group cursor-pointer"}>
                        <div className={`p-6 group-hover:bg-pink-100 border border-transparent group-hover:border-pink-300  flex gap-4 rounded-xl transition-colors ${!isHover ? 'border-pink-100 bg-pink-100' : ''}`}>

                            <ListChecks className="size-6 text-pink-600 mt-1 shrink-0" />

                            <div className="space-y-1">
                                <h3 className="text-base font-semibold text-slate-700">
                                    {/* Our Learning Approach */}
                                     Who We Are

                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
                                    {/* We guide learners step by step, focusing on listening, speaking,
                                    and confidence rather than memorization. */}
                                     We are a small team passionate about making language learning simple,
      practical, and accessible to everyone — no matter where they start.
                                </p>
                            </div>
                        </div>
                    </div>


                    {/* GOALS-2 */}
                    <div className="flex items-center justify-center gap-6 max-w-md group cursor-pointer mb-4">
                        <div className="p-6 flex gap-4 rounded-xl transition-colors border border-transparent group-hover:border-indigo-300 group-hover:bg-indigo-100">
                            <MessageCircle className="size-6 text-indigo-600" />

                            <div className="space-y-2">
                                <h3 className="text-base font-semibold text-slate-700">
                                    {/* Real Conversations */}
                                     Our Goal
                                </h3>
                                <p className="text-sm text-slate-600 max-w-xs">
                                    {/* Our lessons are built around everyday situations so users learn
                                    how people actually speak. */}
                                    Our goal is to help learners speak naturally and confidently, not just
      memorize words or grammar rules.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/*GOALS-3 */}
                    <div className="flex items-center justify-center gap-6 max-w-md group cursor-pointer">
                        <div className="p-6 flex gap-4 rounded-xl transition-colors border border-transparent group-hover:border-orange-300 group-hover:bg-orange-100">
                            <Globe2 className="size-6 text-orange-600" />


                            <div className="space-y-2">
                                <h3 className="text-base font-semibold text-slate-700">
                                    {/* Language & Culture */}
                                       Why Choose Us
                                </h3>
                                <p className="text-sm text-slate-600 max-w-xs">
                                    {/* We help learners understand culture, slang, and expressions so
                                    they feel comfortable using the language in real life. */}
                                      We focus on real conversations, cultural understanding, and steady
      progress — so learning feels useful, motivating, and enjoyable.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default About;
