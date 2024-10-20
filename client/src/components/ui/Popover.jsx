// src/components/ui/Popover.jsx
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export const Popover = ({ children }) => {
  const [show, setShow] = useState(false);
  const referenceElement = useRef(null);
  const popperElement = useRef(null);

  const handleClickOutside = (event) => {
    if (popperElement.current && !popperElement.current.contains(event.target) && !referenceElement.current.contains(event.target)) {
      setShow(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div>
      <div ref={referenceElement} onClick={() => setShow(!show)}>
        {children[0]}
      </div>
      {show && createPortal(
        <div ref={popperElement} className="popover-content">
          {children[1]}
        </div>,
        document.body
      )}
    </div>
  );
};

export const PopoverTrigger = ({ children }) => <>{children}</>;
export const PopoverContent = ({ children }) => <>{children}</>;