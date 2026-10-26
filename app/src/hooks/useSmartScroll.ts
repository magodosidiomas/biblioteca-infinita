import { useState, useEffect, useRef } from 'react';

export function useSmartScroll() {
  const [isHidden, setIsHidden] = useState(false);
  const inputFocusedRef = useRef(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      // No desktop (>= 768px) ou com foco em input, nunca esconde
      if (window.innerWidth >= 768 || inputFocusedRef.current) {
        setIsHidden(false);
        return;
      }

      const currentY = window.scrollY;
      const delta = currentY - lastScrollY;

      // Próximo ao topo: sempre visível
      if (currentY <= 40) {
        setIsHidden(false);
      } 
      // Rolar para BAIXO com folga mínima de 6px: esconde suavemente
      else if (delta > 6 && currentY > 60) {
        setIsHidden(true);
      } 
      // Rolar para CIMA com folga mínima de 6px: revela imediatamente
      else if (delta < -6) {
        setIsHidden(false);
      }

      lastScrollY = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { isHidden, inputFocusedRef };
}
