import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth", // "instant" pour éviter le scroll visuel brusque, ou "smooth" si on veut voir le défilement
    });
  }, [pathname]);

  return null;
}
