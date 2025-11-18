import { useState, useEffect } from "react";

import Slider from './components/Slider';
import { DEFAULT_BLUR, DEFAULT_OPACITY } from '../config/default';
import { storageLocal } from '../shared/storage';

import './popup.css';

const Popup = () => {
  const [active, setActive] = useState(false);
  const [blur, setBlur] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    storageLocal.get(['active', 'blur', 'opacity']).then((result) => {
      setActive(result.active ?? false);
      setBlur(result.blur ?? DEFAULT_BLUR);
      setOpacity(result.opacity ?? DEFAULT_OPACITY);
    });
  }, []);

  const handleChange = (newValues) => {
    storageLocal.set(newValues);
  };

  return (
    <div className="p-5 w-76">
      <div className="grid grid-cols-5 gap-3">
        <label>Blur</label>
        <Slider
          min={0}
          max={40}
          step={1}
          value={blur}
          onChange={(value) => {
            setBlur(value);
            handleChange({ active, blur: value, opacity });
          }}
          className="col-span-3 col-start-2 ml-2 mr-2"
        />
        <div className="text-right">
          {blur}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        <label>Opacity</label>
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={opacity}
          onChange={(value) => {
            setOpacity(value);
            handleChange({ active, blur, opacity: value });
          }}
          className="col-span-3 col-start-2 ml-2 mr-2"
        />
        <div className="text-right">
          {Math.round(opacity * 100)}
        </div>
      </div>
    </div>
  );
}

export default Popup;