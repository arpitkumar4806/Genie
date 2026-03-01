import { useEffect, useRef } from "react";
import { useAppStore } from "../store/useAppStore";
import { useChatStore } from "../store/useChatStore";
const URL = import.meta.env.VITE_URL;
import Response from "../components/Response";

const Home = () => {
  const { loading, setLoading } = useAppStore();
  const {
    query,
    result,
    selectedHistory,
    setQuery,
    setResult,
    setRecentHistory,
  } = useChatStore();
  const scrollToResult = useRef();

  const askquery = async () => {
    if (query || selectedHistory) {
      const payloadQuery = query ? query : selectedHistory;
      setLoading(loading + 50);

      const response = await fetch("http://localhost:3000/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payloadQuery: payloadQuery,
        }),
        credentials: "include",
      });

      const data = await response.json();
      const dataString = data.result;
      setLoading(loading + 90);

      if (query) {
        if (localStorage.getItem("history")) {
          let history = JSON.parse(localStorage.getItem("history"));
          history = [query, ...history];
          history = history.map(
            (item) =>
              item.trim().charAt(0).toUpperCase() +
              item.trim().slice(1).toLowerCase(),
          );
          history = [...new Set(history)];
          localStorage.setItem("history", JSON.stringify(history));
          setRecentHistory(history);
        } else {
          localStorage.setItem("history", JSON.stringify([query]));
          setRecentHistory([query]);
        }
      }

      setResult([
        ...result,
        {
          type: "query",
          text: query ? query : selectedHistory,
        },
        { type: "response", text: dataString },
      ]);
      setQuery("");
      setTimeout(() => {
        scrollToResult.current.scrollTop = scrollToResult.current.scrollHeight;
        setLoading(100);
      }, 500);
    }
  };

  const isSubmit = (event) => {
    if (event.key == "Enter") {
      askquery();
    }
  };

  useEffect(() => {
    askquery();
  }, [selectedHistory]);

  return (
    <section className="grid grid-rows-6 h-[calc(100vh-48px)] w-[calc(100vw-48px)] ml-12 bg-white border-0 rounded-xl dark:bg-zinc-800">
      <div
        ref={scrollToResult}
        className="row-span-5 container flex flex-col p-12 scroll-smooth overflow-auto scrollbar-hide transition-all duration-300"
      >
        {result.map((item, index) =>
          item.type == "query" ? (
            <div
              key={index}
              id="query"
              className="ml-auto mb-4 px-4 py-2 bg-zinc-200 border-0 rounded-tl-4xl rounded-tr-md rounded-b-4xl leading-relaxed dark:bg-zinc-700 dark:text-white"
            >
              {item.text}
            </div>
          ) : (
            <Response key={index} markdown={item.text} />
          ),
        )}
      </div>
      <div className="row-span-1 flex justify-between m-auto px-4 py-2 border w-2/3 border-neutral-500 rounded-4xl dark:text-white">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={isSubmit}
          name="Prompt"
          id="prompt"
          placeholder="Enter Prompt"
          className="w-full outline-none"
        />
        <button
          onClick={askquery}
          type="button"
          className="mx-2 px-4 py-2 font-medium bg-zinc-200 border-0 rounded-xl shadow-lg cursor-pointer active:translate-y-0.5 active:shadow-md dark:bg-zinc-700 dark:text-white"
        >
          Ask
        </button>
      </div>
    </section>
  );
};

export default Home;
