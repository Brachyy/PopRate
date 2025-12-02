import React, { createContext, useState, useEffect, useContext } from 'react';

const ListContext = createContext();

export const useList = () => useContext(ListContext);

export const ListProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('watchlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [watched, setWatched] = useState(() => {
    const saved = localStorage.getItem('watched');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('watched', JSON.stringify(watched));
  }, [watched]);

  const addToWatchlist = (item) => {
    setWatchlist((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
  };

  const removeFromWatchlist = (id) => {
    setWatchlist((prev) => prev.filter((item) => item.id !== id));
  };

  const isInWatchlist = (id) => {
    return watchlist.some((item) => item.id === id);
  };

  const addToWatched = (item) => {
    setWatched((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
  };

  const removeFromWatched = (id) => {
    setWatched((prev) => prev.filter((item) => item.id !== id));
  };

  const isInWatched = (id) => {
    return watched.some((item) => item.id === id);
  };

  return (
    <ListContext.Provider
      value={{
        watchlist,
        watched,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        addToWatched,
        removeFromWatched,
        isInWatched,
      }}
    >
      {children}
    </ListContext.Provider>
  );
};
