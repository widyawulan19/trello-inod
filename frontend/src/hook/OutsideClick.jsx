import React, { useEffect, useRef } from 'react'

const OutsideClick=(callback)=> {
    const ref = useRef(null)

    useEffect(()=>{
        const handleClickOutside = (event) =>{
            if(ref.current && !ref.current.contains(event.target)){
                callback();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return() =>{
            document.removeEventListener('mousedown', handleClickOutside);
        };
    },[callback]);

    return ref;
}

export default OutsideClick