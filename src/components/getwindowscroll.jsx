import { useEffect, useState } from 'react';

function getWindowScroll() {
  if (typeof window !== 'undefined') {
    return window.pageYOffset;
  }
  return 0;
}

export const useWindowScrollPosition = () => {
  const [scrollPos, setScrollPos] = useState(getWindowScroll());

  useEffect(() => {
    const updateScroll = () => {
      setScrollPos(getWindowScroll());
    };

    window.addEventListener('scroll', updateScroll);
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  return scrollPos;
};