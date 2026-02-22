import React from 'react'
import Swar from '../Alphabets/Swar'
import Vyanjan from '../Alphabets/Vyanjan'
const Alphabets = () => {
    return (

        <div id="alphabets" className="space-y-8">

            <div>
                <h1 className="text-2xl font-semibold text-gray-800">
                    Hindi Alphabet (Varnamala)
                </h1>

                <p className="text-gray-500 mt-2 text-l w-full">
                    The Hindi writing system is divided into two main groups:
                    <span className="font-medium text-gray-700"> Swar (Vowels)</span> and
                    <span className="font-medium text-gray-700"> Vyanjan (Consonants)</span>.
                    Start with vowels to understand basic sounds, then move to consonants to build complete words.
                </p>
            </div>

              <hr className="border-gray-200" />

              <div>
                <h1 className="text-xl font-semibold text-gray-800 mb-4"> Swar </h1>
                <Swar />
              </div>

              <hr className="border-gray-200" />

              <div>
                <h1 className="text-xl font-semibold text-gray-800 mb-4"> Vyanjan </h1>
                <Vyanjan />
              </div>

        </div>


    )
}
export default Alphabets