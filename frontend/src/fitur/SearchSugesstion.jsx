import { useEffect, useMemo, useState } from "react";
import { HiOutlineSearch } from "react-icons/hi";
import { FaUser, FaHashtag } from "react-icons/fa";
import { BsWallet2 } from "react-icons/bs";
import { HiOutlineCodeBracket } from "react-icons/hi2";
import '../style/fitur/SearchSuggestion.css';

const MAX_RESULT = 5;

const highlight = (text, keyword) => {
  if (!keyword) return text;
  const regex = new RegExp(`(${keyword})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
};

const SearchSugesstion = ({ data = [], onSelect, onSearch }) => {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    if (!value) return null;
    const keyword = value.toLowerCase();

    const buyer = [];
    const codeOrder = [];
    const orderNumber = [];
    const account = [];

    data.forEach((item) => {
      if (item.buyer_name?.toLowerCase().includes(keyword)) {
        buyer.push(item.buyer_name);
      }

      if (item.code_order?.toLowerCase().includes(keyword)) {
        codeOrder.push(item.code_order);
      }

      if (item.order_number?.toLowerCase().includes(keyword)) {
        orderNumber.push(item.order_number);
      }

      if (item.account_name?.toLowerCase().includes(keyword)) {
        account.push(item.account_name);
      }
    });

    return {
      buyer: [...new Set(buyer)].slice(0, MAX_RESULT),
      codeOrder: [...new Set(codeOrder)].slice(0, MAX_RESULT),
      orderNumber: [...new Set(orderNumber)].slice(0, MAX_RESULT),
      account: [...new Set(account)].slice(0, MAX_RESULT),
    };
  }, [value, data]);

  const hasResult =
    results &&
    (
      results.buyer.length ||
      results.codeOrder.length ||
      results.orderNumber.length ||
      results.account.length
    );

  return (
    <div className="ss-wrapper">
      <div className="ss-input">
        <HiOutlineSearch />
        <input
          type="search"
          placeholder="Search buyer, code order, order number, account..."
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
            onSearch(e.target.value);
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
                  onClick={() => onSelect("buyer_name", item)}
                  dangerouslySetInnerHTML={{
                    __html: highlight(item, value),
                  }}
                />
              ))}
            </div>
          )}

          {/* CODE ORDER */}
          {results?.codeOrder.length > 0 && (
            <div className="ss-group">
              <p className="ss-title">
                <HiOutlineCodeBracket /> Code Order
              </p>
              {results.codeOrder.map((item, i) => (
                <div
                  key={i}
                  className="ss-item mono"
                  onClick={() => onSelect("code_order", item)}
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
                  className="ss-item"
                  onClick={() => onSelect("order_number", item)}
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
                  onClick={() => onSelect("account", item)}
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

export default SearchSugesstion;
