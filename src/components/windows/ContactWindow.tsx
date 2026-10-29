import React from 'react';
import { Mail, MapPin, Instagram } from 'lucide-react';

interface ContactWindowProps {
  data: {
    email: string;
    location: string;
    instagram: string;
    instagramHandle: string;
  };
}

export const ContactWindow: React.FC<ContactWindowProps> = ({ data }) => {
  return (
    <div className="space-y-4 font-tahoma text-[11px] sm:text-[12px]">
      <div className="bg-[#FFFFE1] border border-[#ACA899] p-2 flex items-center gap-2 mb-4">
        <div className="text-blue-600 font-bold text-lg">ⓘ</div>
        <div className="text-black">
          <p className="font-bold">Get In Touch</p>
          <p className="text-[10px]">Feel free to reach out for collaborations or inquiries</p>
        </div>
      </div>

      <fieldset className="border border-[#D4D0C8] p-4 rounded-[3px]">
        <legend className="text-[#003399] px-1 font-bold ml-2">Contact Information</legend>
        <div className="space-y-3 pl-2">
          <div className="flex items-center gap-3 text-black">
            <Mail className="text-[#003399]" size={16} />
            <a href={`mailto:${data.email}`} className="hover:underline text-blue-600 break-all">
              {data.email}
            </a>
          </div>
          <div className="flex items-center gap-3 text-black">
            <Instagram className="text-[#003399] shrink-0" size={16} />
            <a
              href={data.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-blue-600 break-all"
            >
              {data.instagramHandle}
            </a>
          </div>
          <div className="flex items-center gap-3 text-black">
            <MapPin className="text-[#003399]" size={16} />
            <span>{data.location}</span>
          </div>
        </div>
      </fieldset>
    </div>
  );
};
