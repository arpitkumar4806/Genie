import { Squash as Hamburger } from "hamburger-react";
import { useAppStore } from "../store/useAppStore";

const Header = () => {
  const { theme, isOpen, toggleOpen } = useAppStore();

  return (
    <header>
      <nav className="flex">
        <Hamburger
          rounded
          size={24}
          distance="sm"
          color={theme === "light" ? "#000000" : "#f5f5f5"}
          easing="ease-in"
          label="Show Menu"
          toggled={isOpen}
          toggle={toggleOpen}
        />
        <h1 className="my-auto text-2xl font-bold">Genie</h1>
      </nav>
    </header>
  );
};

export default Header;
