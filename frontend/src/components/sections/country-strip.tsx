"use client";

import Image from "next/image";

// Universities with Wikipedia/Wikimedia Commons logo URLs
const UNIVERSITIES = [
  { name: "University of Melbourne", logo: "https://upload.wikimedia.org/wikipedia/en/0/0c/University_of_Melbourne_Logo.svg", country: "🇦🇺 Australia" },
  { name: "University of Oxford", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2a/University_of_Oxford_coat_of_arms.svg", country: "🇬🇧 UK" },
  { name: "ETH Zürich", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2a/ETH_Z%C3%BCrich_Logo_black.svg", country: "🇨🇭 Switzerland" },
  { name: "Harvard University", logo: "https://upload.wikimedia.org/wikipedia/en/2/29/Harvard_shield_wreath.svg", country: "🇺🇸 USA" },
  { name: "University of Auckland", logo: "https://upload.wikimedia.org/wikipedia/en/5/59/University_of_Auckland_logo.svg", country: "🇳🇿 New Zealand" },
  { name: "TU Munich", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Logo_of_the_Technical_University_of_Munich.svg", country: "🇩🇪 Germany" },
  { name: "NYU Abu Dhabi", logo: "https://upload.wikimedia.org/wikipedia/commons/1/16/New_York_University_Seal.svg", country: "🇦🇪 UAE" },
  { name: "University of Toronto", logo: "https://upload.wikimedia.org/wikipedia/commons/7/79/University_of_Toronto_coat_of_arms.svg", country: "🇨🇦 Canada" },
  { name: "University of Sydney", logo: "https://upload.wikimedia.org/wikipedia/en/4/4e/University_of_Sydney_seal.svg", country: "🇦🇺 Australia" },
  { name: "University of Cambridge", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Coat_of_Arms_of_the_University_of_Cambridge.svg", country: "🇬🇧 UK" },
  { name: "KAUST", logo: "https://upload.wikimedia.org/wikipedia/en/4/47/King_Abdullah_University_of_Science_and_Technology_Logo.svg", country: "🇸🇦 Saudi Arabia" },
  { name: "MIT", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0c/MIT_logo.svg", country: "🇺🇸 USA" },
  { name: "University of Otago", logo: "https://upload.wikimedia.org/wikipedia/en/a/a6/University_of_Otago_Logo.svg", country: "🇳🇿 New Zealand" },
  { name: "Sorbonne University", logo: "https://upload.wikimedia.org/wikipedia/commons/3/31/Logo_Sorbonne_Universit%C3%A9.svg", country: "🇫🇷 France" },
  { name: "NUS Singapore", logo: "https://upload.wikimedia.org/wikipedia/en/b/b9/NUS_coat_of_arms.svg", country: "🇸🇬 Singapore" },
  { name: "Khalifa University", logo: "https://upload.wikimedia.org/wikipedia/en/4/47/Khalifa_University_Logo.svg", country: "🇦🇪 UAE" },
  { name: "ANU", logo: "https://upload.wikimedia.org/wikipedia/commons/1/19/Australian_National_University_crest.svg", country: "🇦🇺 Australia" },
  { name: "Trinity College Dublin", logo: "https://upload.wikimedia.org/wikipedia/commons/8/84/Trinity_College_Dublin_Crest.svg", country: "🇮🇪 Ireland" },
  { name: "Stanford University", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b7/Stanford_University_seal_2003.svg", country: "🇺🇸 USA" },
  { name: "McGill University", logo: "https://upload.wikimedia.org/wikipedia/commons/8/83/McGill_University_CoA.svg", country: "🇨🇦 Canada" },
  { name: "University of Queensland", logo: "https://upload.wikimedia.org/wikipedia/en/2/2b/University_of_Queensland_logo.svg", country: "🇦🇺 Australia" },
  { name: "TU Delft", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f4/TU_Delft_Logo.svg", country: "🇳🇱 Netherlands" },
  { name: "Qatar University", logo: "https://upload.wikimedia.org/wikipedia/en/2/2a/Qatar_University_Logo.svg", country: "🇶🇦 Qatar" },
  { name: "Imperial College London", logo: "https://upload.wikimedia.org/wikipedia/commons/5/53/Imperial_College_London_logo.svg", country: "🇬🇧 UK" },
  { name: "Victoria University of Wellington", logo: "https://upload.wikimedia.org/wikipedia/en/d/d5/Victoria_University_of_Wellington_logo.svg", country: "🇳🇿 New Zealand" },
  { name: "LMU Munich", logo: "https://upload.wikimedia.org/wikipedia/commons/0/06/LMU_Muenchen_Logo.svg", country: "🇩🇪 Germany" },
  { name: "Tel Aviv University", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Tel_Aviv_University_logo.svg", country: "🇮🇱 Israel" },
  { name: "UNSW Sydney", logo: "https://upload.wikimedia.org/wikipedia/en/b/bd/University_of_New_South_Wales_logo.svg", country: "🇦🇺 Australia" },
  { name: "Yale University", logo: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Yale_University_logo.svg", country: "🇺🇸 USA" },
  { name: "University of Amsterdam", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e3/UvA_Logo.svg", country: "🇳🇱 Netherlands" },
  { name: "Monash University", logo: "https://upload.wikimedia.org/wikipedia/en/c/c2/Monash_University_logo.svg", country: "🇦🇺 Australia" },
  { name: "KU Leuven", logo: "https://upload.wikimedia.org/wikipedia/commons/9/95/KU_Leuven_logo.svg", country: "🇧🇪 Belgium" },
  { name: "UBC Vancouver", logo: "https://upload.wikimedia.org/wikipedia/commons/7/75/University_of_British_Columbia_Coat_of_Arms.svg", country: "🇨🇦 Canada" },
  { name: "University of Edinburgh", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4f/University_of_Edinburgh_coat_of_arms.svg", country: "🇬🇧 UK" },
  { name: "HKU", logo: "https://upload.wikimedia.org/wikipedia/en/4/47/HKU_logo.svg", country: "🇭🇰 Hong Kong" },
  { name: "Heidelberg University", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Ruprecht-Karls-Universit%C3%A4t_Heidelberg_Logo.svg", country: "🇩🇪 Germany" },
  { name: "University of Canterbury", logo: "https://upload.wikimedia.org/wikipedia/en/9/94/University_of_Canterbury_logo.svg", country: "🇳🇿 New Zealand" },
  { name: "LSE London", logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/LSE_Logo.svg", country: "🇬🇧 UK" },
  { name: "NTU Singapore", logo: "https://upload.wikimedia.org/wikipedia/en/c/c6/Nanyang_Technological_University_coat_of_arms.svg", country: "🇸🇬 Singapore" },
];


export function CountryStrip() {
  // Double the array for seamless infinite scroll
  const duplicatedUniversities = [...UNIVERSITIES, ...UNIVERSITIES];

  return (
    <section className="bg-white py-10 border-y-2 border-[#111827] overflow-hidden">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-center justify-center gap-3">
          <div className="w-3 h-3 bg-[#22C55E] rounded-full animate-pulse" />
          <span className="text-base font-bold text-[#111827] uppercase tracking-wider">
            Partner Universities Worldwide
          </span>
          <div className="w-3 h-3 bg-[#22C55E] rounded-full animate-pulse" />
        </div>
      </div>

      {/* Infinite Scroll Container */}
      <div className="relative">
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Scrolling Track - FASTER animation */}
        <div className="flex animate-scroll-fast hover:[animation-play-state:paused]">
          {duplicatedUniversities.map((uni, index) => (
            <div
              key={`${uni.name}-${index}`}
              className="flex-shrink-0 mx-4 group cursor-pointer"
            >
              <div className="flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300 hover:bg-gray-50 hover:shadow-xl hover:scale-105">
                {/* University Logo - BIGGER */}
                <div className="w-24 h-24 md:w-28 md:h-28 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 p-3 transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105">
                  <Image
                    src={uni.logo}
                    alt={uni.name}
                    width={80}
                    height={80}
                    className="object-contain w-full h-full"
                    unoptimized
                  />
                </div>
                {/* University Name & Country */}
                <div className="text-center max-w-[130px]">
                  <p className="text-sm font-bold text-[#111827] leading-tight line-clamp-2">
                    {uni.name}
                  </p>
                  <p className="text-xs text-[#6B7280] mt-1">{uni.country}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats line */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex items-center justify-center gap-6 md:gap-10 text-base text-[#6B7280] flex-wrap">
          <span className="flex items-center gap-2">
            <span className="font-black text-xl text-[#111827]">500+</span> Universities
          </span>
          <span className="w-1.5 h-1.5 bg-[#6B7280] rounded-full hidden md:block" />
          <span className="flex items-center gap-2">
            <span className="font-black text-xl text-[#111827]">50+</span> Countries
          </span>
          <span className="w-1.5 h-1.5 bg-[#6B7280] rounded-full hidden md:block" />
          <span className="flex items-center gap-2">
            <span className="font-black text-xl text-[#111827]">10,000+</span> Programs
          </span>
        </div>
      </div>
    </section>
  );
}
