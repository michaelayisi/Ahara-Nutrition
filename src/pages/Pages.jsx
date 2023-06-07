import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./Home";
import { AnimatePresence } from "framer-motion";

const Pages = () => {
  const location = useLocation();

  return (
    <AnimatePresence exitBeforeEnter>
      <Routes Location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
      </Routes>
    </AnimatePresence>
  );
};

export default Pages;
