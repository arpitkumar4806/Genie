import { useAppStore } from "../store/useAppStore";
import { useChatStore } from "../store/useChatStore";
import HistoryIconLight from "../assets/historyIconLight.svg";
import HistoryIconDark from "../assets/historyIconDark.svg";
import NewChatIconLight from "../assets/newChatIconLight.svg";
import NewChatIconDark from "../assets/newChatIconDark.svg";
import ClearIconLight from "../assets/clearIconLight.svg";
import ClearIconDark from "../assets/clearIconDark.svg";

const Sidebar = () => {
  const { theme, isOpen, isChecked, setTheme, toggleOpen, setIsChecked } =
    useAppStore();
  const { recentHistory, setRecentHistory, setSelectedHistory } = useChatStore;

  const handleCheckboxChange = () => {
    if (theme == "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
    setIsChecked(!isChecked);
  };

  const clearHistory = () => {
    localStorage.clear();
    setRecentHistory([]);
  };

  const deleteSelectedQuery = (selectedQuery) => {
    let history = JSON.parse(localStorage.getItem("history"));
    history = history.filter((item) => item !== selectedQuery);
    localStorage.setItem("history", JSON.stringify(history));
    setRecentHistory(history);
  };

  return (
    <aside
      onMouseEnter={() => toggleOpen(true)}
      onMouseLeave={() => toggleOpen(false)}
      className={`grid grid-rows-[48px_calc(100vh-144px)_48px] h-full ${
        isOpen
          ? "w-1/4 rounded-r-xl shadow-lg shadow-zinc-400 dark:shadow-zinc-600"
          : "w-12"
      } fixed bg-zinc-100 transition-all duration-300 dark:bg-zinc-900 dark:text-white`}
      style={{ gridTemplateAreas: '"NewChat" "History" "Theme"' }}
    >
      <div className="[grid-area:NewChat] flex">
        <button className="flex w-full m-1 p-2 cursor-pointer hover:bg-zinc-200 rounded-full dark:hover:bg-zinc-700">
          <img
            src={theme === "light" ? NewChatIconLight : NewChatIconDark}
            alt="New Chat"
          ></img>
          {isOpen && (
            <h1 className="ml-4 text-xl font-bold truncate">New Chat</h1>
          )}
        </button>
      </div>

      <div className="[grid-area:History] p-1">
        {isOpen && (
          <>
            <div className="flex items-center justify-between p-2">
              <div className="flex">
                <img
                  src={theme === "light" ? HistoryIconLight : HistoryIconDark}
                  alt="History"
                />
                <h1 className="ml-4 text-xl font-bold truncate">History</h1>
              </div>
              <button
                type="button"
                className="p-2 cursor-pointer hover:bg-zinc-200 rounded-full dark:hover:bg-zinc-700"
                onClick={clearHistory}
              >
                <img
                  src={theme === "light" ? ClearIconLight : ClearIconDark}
                  alt="Clear History"
                />
              </button>
            </div>
            <ul className="h-4/5 w-[24vw] p-1 scroll-smooth overflow-scroll scrollbar-hide">
              {recentHistory &&
                recentHistory.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <li
                      key={index}
                      onClick={() => {
                        setSelectedHistory(item);
                      }}
                      className="w-full p-2 truncate hover:bg-zinc-200 rounded-full dark:hover:bg-zinc-700 cursor-pointer"
                    >
                      {item}
                    </li>
                    <div>
                      <button
                        type="button"
                        className="p-2 cursor-pointer hover:bg-zinc-200 rounded-full dark:hover:bg-zinc-700"
                        onClick={() => {
                          deleteSelectedQuery(item);
                        }}
                      >
                        <img
                          src={
                            theme === "light" ? ClearIconLight : ClearIconDark
                          }
                          alt="Clear History"
                        />
                      </button>
                    </div>
                  </div>
                ))}
            </ul>
          </>
        )}
      </div>

      <div className="[grid-area:Theme] flex items-center">
        <label className="flex cursor-pointer select-none items-center">
          <div className="relative">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={handleCheckboxChange}
              className="sr-only"
            />
            <div className="box block h-6 w-10 rounded-full bg-zinc-400 dark:bg-zinc-700"></div>
            <div
              className={`absolute left-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white transition ${
                isChecked ? "translate-x-full" : ""
              }`}
            ></div>
          </div>
        </label>
      </div>
    </aside>
  );
};

export default Sidebar;
