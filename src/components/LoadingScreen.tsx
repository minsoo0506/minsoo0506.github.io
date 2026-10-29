import React from 'react';

const LoadingScreen: React.FC = () => (
  <div className="xp-boot" role="status" aria-label="Starting Windows XP">
    <div className="xp-boot-screen">
      <img
        src="images/windows-xp-boot.png"
        alt="Microsoft Windows XP Professional"
        width="640"
        height="480"
        draggable={false}
      />
      <div className="xp-boot-track" aria-hidden="true">
        <div className="xp-boot-blocks">
          <i />
          <i />
          <i />
        </div>
      </div>
    </div>
  </div>
);

export default LoadingScreen;
