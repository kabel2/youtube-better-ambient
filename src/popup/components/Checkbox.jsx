import React, { useCallback } from 'react';

const Checkbox = ({ value, onChange }) => {
    const handleChange = useCallback(({ target }) => {
        onChange(target.value);
    }, [onChange]);

    return (
        <input type="checkbox" value={value} onChange={handleChange} />
    )
}

export default Checkbox;