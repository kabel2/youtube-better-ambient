import { useCallback } from 'react';

const Slider = ({ min, max, step, value, onChange, ...props }) => {
    const handleChange = useCallback(({ target }) => {
        onChange(target.value);
    }, [onChange]);

    return (
        <input type="range" min={min} max={max} value={value} onChange={handleChange} step={step} {...props}/>
    )
}

export default Slider;