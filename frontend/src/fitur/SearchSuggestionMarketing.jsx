import { useMemo, useState } from "react";
import { HiOutlineSearch } from "react-icons/hi";
import { FaUser, FaHashtag } from "react-icons/fa";
import { BsWallet2 } from "react-icons/bs";
import { HiOutlinePencil } from "react-icons/hi2";
import "../style/fitur/SearchSuggestion.css";

const MAX_RESULT = 5;

const highlight = (text, keyword) => {
  if (!keyword) return text;
  const regex = new RegExp(`(${keyword})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
};

const SearchSuggestionMarketing = ({ data = [], onSearch, onSelect }) => {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    if (!value) return null;
    const keyword = value.toLowerCase();

    const buyer = [];
    const orderNumber = [];
    const account = [];
    const inputBy = [];

    data.forEach((item) => {
      if (item.buyer_name?.toLowerCase().includes(keyword)) {
        buyer.push(item.buyer_name);
      }

      if (item.order_number?.toLowerCase().includes(keyword)) {
        orderNumber.push(item.order_number);
      }

      if (item.account_name?.toLowerCase().includes(keyword)) {
        account.push(item.account_name);
      }

      if (item.input_by_name?.toLowerCase().includes(keyword)) {
        inputBy.push(item.input_by_name);
      }
    });

    return {
      buyer: [...new Set(buyer)].slice(0, MAX_RESULT),
      orderNumber: [...new Set(orderNumber)].slice(0, MAX_RESULT),
      account: [...new Set(account)].slice(0, MAX_RESULT),
      inputBy: [...new Set(inputBy)].slice(0, MAX_RESULT),
    };
  }, [value, data]);

  const hasResult =
    results &&
    (
      results.buyer.length ||
      results.orderNumber.length ||
      results.account.length ||
      results.inputBy.length
    );

  return (
    <div className="ss-wrapper">
      <div className="ss-input">
        <HiOutlineSearch />
        <input
          type="search"
          placeholder="Search buyer, order number, account, input by..."
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
            onSearch(e.target.value); // 🔥 tetap trigger filter utama
          }}
          onFocus={() => setOpen(true)}
        />
      </div>

      {open && value && (
        <div className="ss-dropdown">
          {!hasResult && (
            <div className="ss-empty">No results found</div>
          )}

          {/* BUYER */}
          {results?.buyer.length > 0 && (
            <div className="ss-group">
              <p className="ss-title">
                <FaUser /> Buyer
              </p>
              {results.buyer.map((item, i) => (
                <div
                  key={i}
                  className="ss-item"
                  onClick={() => {
                    onSelect("buyer_name", item);
                    setValue(item);
                    setOpen(false);
                  }}
                  dangerouslySetInnerHTML={{
                    __html: highlight(item, value),
                  }}
                />
              ))}
            </div>
          )}

          {/* ORDER NUMBER */}
          {results?.orderNumber.length > 0 && (
            <div className="ss-group">
              <p className="ss-title">
                <FaHashtag /> Order Number
              </p>
              {results.orderNumber.map((item, i) => (
                <div
                  key={i}
                  className="ss-item mono"
                  onClick={() => {
                    onSelect("order_number", item);
                    setValue(item);
                    setOpen(false);
                  }}
                  dangerouslySetInnerHTML={{
                    __html: highlight(item, value),
                  }}
                />
              ))}
            </div>
          )}

          {/* ACCOUNT */}
          {results?.account.length > 0 && (
            <div className="ss-group">
              <p className="ss-title">
                <BsWallet2 /> Account
              </p>
              {results.account.map((item, i) => (
                <div
                  key={i}
                  className="ss-item"
                  onClick={() => {
                    onSelect("account_name", item);
                    setValue(item);
                    setOpen(false);
                  }}
                  dangerouslySetInnerHTML={{
                    __html: highlight(item, value),
                  }}
                />
              ))}
            </div>
          )}

          {/* INPUT BY */}
          {results?.inputBy.length > 0 && (
            <div className="ss-group">
              <p className="ss-title">
                <HiOutlinePencil /> Input By
              </p>
              {results.inputBy.map((item, i) => (
                <div
                  key={i}
                  className="ss-item"
                  onClick={() => {
                    onSelect("input_by_name", item);
                    setValue(item);
                    setOpen(false);
                  }}
                  dangerouslySetInnerHTML={{
                    __html: highlight(item, value),
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchSuggestionMarketing;
