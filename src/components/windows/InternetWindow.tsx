import { useState } from 'react';

export function InternetWindow() {
  const [address, setAddress] = useState('');
  const [url, setUrl] = useState('');
  const navigate = () => {
    const input = address.trim();
    if (!input) return;
    if (/^(https?:\/\/|[\w-]+\.[\w.-]+)/i.test(input)) {
      const next = /^https?:\/\//i.test(input) ? input : `https://${input}`;
      setAddress(next);
      setUrl(next);
    } else {
      window.open(
        `https://www.google.com/search?q=${encodeURIComponent(input)}`,
        '_blank',
        'noopener,noreferrer'
      );
    }
  };
  return (
    <div className="flex flex-col h-full bg-[#ece9d8]">
      <form
        className="flex gap-2 p-2"
        onSubmit={(event) => {
          event.preventDefault();
          navigate();
        }}
      >
        <label htmlFor="internet-address">Address</label>
        <input
          id="internet-address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          className="flex-1 min-w-0 border border-gray-500 px-1"
          placeholder="Website address or search"
        />
        <button type="submit">Go</button>
        {url && (
          <a href={url} target="_blank" rel="noreferrer">
            Open ↗
          </a>
        )}
      </form>
      {url ? (
        <>
          <div className="text-xs px-2 pb-1">If this website blocks the window, use Open ↗.</div>
          <iframe title="Internet" src={url} className="w-full flex-1 bg-white border-0" />
        </>
      ) : (
        <div className="flex-1 bg-white p-6 text-[#163b80]">
          <img src="images/internet-explorer.svg" alt="" className="w-12 h-12 mb-3" />
          <h1 className="text-xl font-bold">Internet Explorer</h1>
          <p className="mt-3 text-sm">
            Enter a website address above. Enter search words to search the web in a new tab.
          </p>
          <p className="mt-3 text-sm">Some websites require opening in a new tab.</p>
        </div>
      )}
    </div>
  );
}
