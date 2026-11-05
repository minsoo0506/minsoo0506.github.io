import { useState } from 'react';
export function InternetWindow() {
  const [address, setAddress] = useState('https://example.com');
  const [url, setUrl] = useState(address);
  return (
    <div className="flex flex-col h-full bg-[#ece9d8]">
      <form
        className="flex gap-2 p-2"
        onSubmit={(e) => {
          e.preventDefault();
          const next = /^https?:\/\//i.test(address) ? address : `https://${address}`;
          setAddress(next);
          setUrl(next);
        }}
      >
        <label htmlFor="internet-address">Address</label>
        <input
          id="internet-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="flex-1 min-w-0 border border-gray-500 px-1"
        />
        <button type="submit">Go</button>
        <a href={url} target="_blank" rel="noreferrer">
          Open ↗
        </a>
      </form>
      <div className="text-xs px-2 pb-1">
        Some websites block display in this window. Use Open ↗ if needed.
      </div>
      <iframe title="Internet" src={url} className="w-full flex-1 bg-white border-0" />
    </div>
  );
}
