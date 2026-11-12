import { useState } from 'react';
import { FactoryControlWindow } from './FactoryControlWindow';
import { LadderStage } from './LadderStage';
import { PidStage } from './PidStage';
import './factory-stages.css';
export function FactoryStagesWindow() {
  const [stage, setStage] = useState(1);
  return (
    <div className="factory-stages">
      <nav aria-label="Factory stages">
        {['Sorting Line', 'PLC Ladder', 'PID Temperature'].map((label, i) => (
          <button
            key={label}
            className={stage === i + 1 ? 'active' : ''}
            onClick={() => setStage(i + 1)}
          >
            <b>0{i + 1}</b>
            {label}
          </button>
        ))}
      </nav>
      <div className="factory-stage-content">
        {stage === 1 ? <FactoryControlWindow /> : stage === 2 ? <LadderStage /> : <PidStage />}
      </div>
    </div>
  );
}
