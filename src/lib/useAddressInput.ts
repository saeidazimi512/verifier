import React, { useCallback, useEffect, useState } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { SEARCH_HISTORY } from "../const";
import { SearchRequest } from "../components/AddressInput";
import { isValidAddress } from "../utils";
import useNotification from "./useNotification";
import { useLocation, useNavigate } from "react-router-dom";

export function useAddressInput() {
  const [value, setValue] = useState("");
  const [active, setActive] = useState(false);
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const { storedValue: searchResults, setValue: setSearchResults } = useLocalStorage<
    SearchRequest[]
  >(SEARCH_HISTORY, []);

  const defineActive = (value: boolean) => setActive(value);

  const defineValue = (value: string) => setValue(value);

  const onClear = useCallback(() => setValue(""), []);

  const onItemClick = useCallback((item: SearchRequest) => {
    setActive(false);
    navigate(`/${item.value}`);
  }, []);

  const onHistoryClear = useCallback(() => {
    setSearchResults([]);
  }, []);

  const onItemDelete = useCallback(
    (e: React.MouseEvent, item: SearchRequest) => {
      e.stopPropagation();
      setSearchResults((prev) => prev.filter((result) => result.value !== item.value));
    },
    [searchResults],
  );

  const onSubmit = async () => {
    const isAlreadyInTheList = searchResults.find((item) => {
      return item.value === value;
    });

    if (!value) {
      setValue("");
      setActive(false);
      navigate("/");
      return;
    }

    if (!isValidAddress(value)) {
      showNotification("Invalid address", "error");
      return;
    }

    !isAlreadyInTheList &&
      setSearchResults((prevState) => [...prevState, { index: searchResults?.length, value }]);

    setValue("");
    setActive(false);
    navigate(`/${value}`);
  };

  useEffect(() => {
    const currentAddress = location.pathname.slice(1, location.pathname.length);

    if (!isValidAddress(currentAddress)) {
      return;
    }

    setSearchResults(() => [{ index: 0, value: currentAddress }]);
  }, []);

  useEffect(() => {
    const currentAddress = location.pathname.slice(1, location.pathname.length);

    if (!isValidAddress(currentAddress)) {
      return;
    }

    const isAlreadyInTheList = searchResults.find((item) => {
      return item.value === currentAddress;
    });

    !isAlreadyInTheList &&
      setSearchResults((prevState) => [
        ...prevState,
        { index: searchResults?.length, value: currentAddress },
      ]);
  }, [location.pathname]);

  return {
    onSubmit,
    onClear,
    onHistoryClear,
    onItemClick,
    onItemDelete,
    active,
    searchResults,
    value,
    defineActive,
    defineValue,
  };
}
