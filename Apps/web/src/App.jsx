import { useEffect } from "react";
import { Outlet } from "react-router";
import LoadingBar from "react-top-loading-bar";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { useAppStore } from "./store/useAppStore";

const App = () => {
  const { loading, theme, setLoading } = useAppStore();
  useEffect(() => {
    if (theme == "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, [theme]);

  return (
    <>
      <LoadingBar
        progress={loading}
        onLoaderFinished={() => setLoading(0)}
        color={theme === "light" ? "#272727" : "#f5f5f5"}
      />
      <Header />
      <main className="flex">
        <Sidebar />
        <Outlet />
      </main>
    </>
  );
};

export default App;
