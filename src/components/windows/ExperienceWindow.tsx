import React from 'react';

interface Experience {
  company: string;
  position: string;
  period: string;
  description?: string;
}

interface Education {
  institution: string;
  degree: string;
  period: string;
}

interface ExperienceWindowProps {
  experience: Experience[];
  education: Education[];
}

export const ExperienceWindow: React.FC<ExperienceWindowProps> = ({ experience, education }) => {
  return (
    <div className="space-y-4 font-tahoma text-[11px] sm:text-[12px]">
      <div className="bg-[#FFFFE1] border border-[#ACA899] p-2 flex items-center gap-2 mb-4">
        <div className="text-blue-600 font-bold text-lg">ⓘ</div>
        <div className="text-black">
          <p className="font-bold">Experience & Education</p>
          <p className="text-[10px]">My professional and Academic journey</p>
        </div>
      </div>

      <fieldset className="border border-[#D4D0C8] p-4 rounded-[3px]">
        <legend className="text-[#003399] px-1 font-bold ml-2">Work Experience</legend>
        <div className="space-y-6">
          {experience.map((exp, index) => (
            <div key={index} className="pl-2 relative">
              {/* Timeline line */}
              {index !== experience.length - 1 && (
                <div className="absolute left-[3px] top-[18px] bottom-[-24px] w-[1px] bg-[#D4D0C8]"></div>
              )}
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-2">
                  <div className="w-[7px] h-[7px] bg-[#3A8CFF] rounded-full shrink-0 relative z-10 border border-white shadow-sm"></div>
                  <h4 className="font-bold text-black text-[13px]">{exp.position}</h4>
                </div>
                <div className="pl-4">
                  <p className="text-[#003399] font-bold text-[11px]">{exp.company}</p>
                  <p className="text-[10px] text-gray-500 mb-1">{exp.period}</p>
                  <p className="text-black leading-relaxed">{exp.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="border border-[#D4D0C8] p-4 rounded-[3px]">
        <legend className="text-[#003399] px-1 font-bold ml-2">Education</legend>
        <div className="space-y-4 pl-2">
          {education.map((edu, index) => (
            <div key={index} className="flex flex-col gap-1">
              <h4 className="font-bold text-black text-[12px]">{edu.degree}</h4>
              <div className="flex justify-between items-center border-b border-[#eee] pb-1">
                <p className="text-[#003399]">{edu.institution}</p>
                <p className="text-[10px] text-gray-500">{edu.period}</p>
              </div>
            </div>
          ))}
        </div>
      </fieldset>
    </div>
  );
};
