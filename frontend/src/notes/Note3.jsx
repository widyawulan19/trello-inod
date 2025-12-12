import React, { useState, useEffect, useCallback } from "react";
import { searchGlobal } from "../services/ApiServices"; // ganti service ke searchGlobal
import "../style/fitur/SearchCard.css";
import { IoSearchOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import {
  FaCreditCard,
  FaXmark,
  FaFaceSadCry,
} from "react-icons/fa6";
import { BsFillInboxesFill } from "react-icons/bs";
import { HiArchiveBoxArrowDown } from "react-icons/hi2";

const SearchGlobalCard = ({ userId }) => {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  let controller = null;

  /* ---------------------------------------
   *  Debounce Search
   * --------------------------------------*/
  useEffect(() => {
    const handler = setTimeout(() => {
      if (keyword.trim().length >= 2 && userId) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 500); // lebih responsif

    return () => clearTimeout(handler);
  }, [keyword, userId]);

  /* ---------------------------------------
   *  API Search
   * --------------------------------------*/
  const handleSearch = async () => {
    try {
      if (controller) controller.abort();
      controller = new AbortController();

      setLoading(true);
      const res = await searchGlobal(keyword, userId, {
        signal: controller.signal,
      });
      setResults(res.data);

    } catch (err) {
      if (err.name === "CanceledError" || err.name === "AbortError") {
        console.log("Request dibatalkan");
      } else {
        console.error("Search failed:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------
   *  Close Search Result
   * --------------------------------------*/
  const closeResult = () => {
    setKeyword("");
    setResults([]);
  };

  /* ---------------------------------------
   *  Highlight Universal
   * --------------------------------------*/
  const highlightText = useCallback((text, keyword) => {
    if (!text || !keyword) return text;

    const regex = new RegExp(`(${keyword})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
  }, []);

  /* ---------------------------------------
   *  Extract Snippet (remove HTML + highlight)
   * --------------------------------------*/
  const extractMatchingSnippet = (description, keyword, context = 30) => {
    if (!description || !keyword) return "";

    const plain = description.replace(/<[^>]+>/g, "");
    const lower = plain.toLowerCase();
    const key = keyword.toLowerCase();

    const index = lower.indexOf(key);
    if (index === -1) return "";

    const start = Math.max(index - context, 0);
    const end = Math.min(index + keyword.length + context, plain.length);

    let snippet = plain.slice(start, end);
    if (start > 0) snippet = "... " + snippet;
    if (end < plain.length) snippet += " ...";

    return highlightText(snippet, keyword);
  };

  return (
    <div className="search-global-container">
      <IoSearchOutline className="icon-search" />

      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Search your cards across all workspaces..."
      />

      {keyword !== "" && (
        <div className="search-global-result">
          <div className="search-header">
            <h2>
              <div className="sgh-icon">
                <FaCreditCard />
              </div>
              Search results
            </h2>

            <div className="search-close-btn" onClick={closeResult}>
              <FaXmark />
            </div>
          </div>

          {/* LOADING EFFECT */}
          {loading && (
            <div className="loading-spinner">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <p>Searching...</p>
            </div>
          )}

          {/* NO RESULTS */}
          {!loading && results.length === 0 && keyword.length >= 2 && (
            <div className="no-res">
              <FaFaceSadCry size={40} style={{ marginBottom: "10px" }} />
              <h5>Oops, nothing matches your search.</h5>
              <p>
                Coba ketikkan kata kunci lain ya, bestie.  
                Mungkin judul, nama workspace, atau list yang lebih spesifik 💛
              </p>
            </div>
          )}

          {/* RESULTS LIST */}
          {!loading && results.length > 0 && (
            <ul className="search-result-list">
              {results.map((item) => {
                const isArchive = item.type === "card" && item.status === "Archive";

                return (
                  <li
                    key={`${item.type}-${item.entity_id}`}
                    className={`search-result-item ${isArchive ? "archive-card" : ""}`}
                    onClick={() => {
                      if (isArchive) {
                        navigate(`/archive/cards/${item.card_id}`);
                      } else if(item.type === "card") {
                        navigate(
                          `/layout/workspaces/${item.workspace_id}/board/${item.board_id}/lists/${item.list_id}/cards/${item.card_id}`
                        );
                      } else if(item.type === "board") {
                        navigate(
                          `/layout/workspaces/${item.workspace_id}/boards/${item.board_id}`
                        );
                      } else if(item.type === "list") {
                        navigate(
                          `/layout/workspaces/${item.workspace_id}/boards/${item.board_id}/lists/${item.list_id}`
                        );
                      } else if(item.type === "workspace") {
                        navigate(
                          `/layout/workspaces/${item.entity_id}/boards`
                        );
                      }
                      setKeyword("");
                    }}
                  >
                    <div className="result-icon">
                      {isArchive ? (
                        <HiArchiveBoxArrowDown className="ri" />
                      ) : (
                        <BsFillInboxesFill className="ri" />
                      )}
                    </div>

                    <div className="result-isi">
                      {/* TITLE */}
                      <div className="card-title">
                        <strong
                          dangerouslySetInnerHTML={{
                            __html: highlightText(item.name, keyword),
                          }}
                        ></strong>

                        {isArchive && (
                          <span className="archive-badge">Archive</span>
                        )}
                      </div>

                      {/* DESCRIPTION SNIPPET */}
                      {item.description && (
                        <p
                          className="p-desc"
                          dangerouslySetInnerHTML={{
                            __html: extractMatchingSnippet(
                              item.description,
                              keyword
                            ),
                          }}
                        ></p>
                      )}

                      {/* CONTEXT (workspace / board / list) */}
                      <p className="p-contex">
                        Workspace:{" "}
                        <strong
                          dangerouslySetInnerHTML={{
                            __html: highlightText(item.workspace_name || "N/A", keyword),
                          }}
                        ></strong>{" "}
                        | Board:{" "}
                        <strong
                          dangerouslySetInnerHTML={{
                            __html: highlightText(item.board_name || "N/A", keyword),
                          }}
                        ></strong>{" "}
                        | List:{" "}
                        <strong
                          dangerouslySetInnerHTML={{
                            __html: highlightText(item.list_name || "N/A", keyword),
                          }}
                        ></strong>
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchGlobalCard;
