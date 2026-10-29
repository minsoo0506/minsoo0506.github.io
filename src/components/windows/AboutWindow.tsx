import React from 'react';
import { Github, Instagram } from 'lucide-react';

interface AboutWindowProps {
  data: {
    personal: {
      fullname: string;
      title: string;
      bio: string;
      avatar: string;
      location: string;
      email: string;
    };
    skills?: { category: string; items: string[] }[];
    social: {
      github: string;
      instagram: string;
    };
  };
}

export const AboutWindow: React.FC<AboutWindowProps> = ({ data }) => {
  return (
    <div className="space-y-4 font-tahoma text-[11px] sm:text-[12px]">
      <div className="bg-white p-4">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="p-1 bg-white border border-[#D4D0C8] shadow-sm">
            <img
              src={'images/' + data.personal.avatar}
              alt={data.personal.fullname}
              className="w-32 h-32 object-cover border border-[#808080]"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-black mb-1">{data.personal.fullname}</h2>
            <p className="text-[#555] mb-3 italic">{data.personal.title}</p>
            <p className="text-black leading-relaxed whitespace-pre-line">{data.personal.bio}</p>
          </div>
        </div>
      </div>

      {data.skills && (
        <fieldset className="border border-[#D4D0C8] p-4 rounded-[3px]">
          <legend className="text-[#003399] px-1 font-bold ml-2">Technical Skills</legend>
          <dl className="space-y-3 pl-2">
            {data.skills.map((group) => (
              <div key={group.category}>
                <dt className="font-bold text-[#003399] mb-1">{group.category}</dt>
                <dd className="flex flex-wrap gap-1">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="px-2 py-0.5 bg-[#EFEFEF] border border-[#D4D0C8] text-[#333]"
                    >
                      {item}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </fieldset>
      )}

      <fieldset className="border border-[#D4D0C8] p-4 rounded-[3px]">
        <legend className="text-[#003399] px-1 font-bold ml-2">Contact Information</legend>
        <div className="space-y-2 text-black pl-2">
          <p className="flex items-center gap-2">
            <span className="font-bold w-20">Location:</span>
            <span>{data.personal.location}</span>
          </p>
          <p className="flex items-center gap-2">
            <span className="font-bold w-20">Email:</span>
            <a
              href={`mailto:${data.personal.email}`}
              className="text-blue-600 hover:underline break-all"
            >
              {data.personal.email}
            </a>
          </p>
        </div>
      </fieldset>

      <fieldset className="border border-[#D4D0C8] p-4 rounded-[3px]">
        <legend className="text-[#003399] px-1 font-bold ml-2">Connect</legend>
        <div className="flex gap-4 pl-2">
          <a
            href={data.social.github}
            target="_blank"
            rel="noopener noreferrer"
            className="xp-button flex items-center gap-2 active:translate-y-[1px]"
          >
            <Github size={16} />
            <span>GitHub</span>
          </a>
          <a
            href={data.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="xp-button flex items-center gap-2 active:translate-y-[1px]"
          >
            <Instagram size={16} />
            <span>Instagram</span>
          </a>
        </div>
      </fieldset>
    </div>
  );
};
