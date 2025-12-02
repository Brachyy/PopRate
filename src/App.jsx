import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Details from './pages/Details';
import Search from './pages/Search';
import MyList from './pages/MyList';
import Profile from './pages/Profile';
import Feed from './pages/Feed';
import UserProfile from './pages/UserProfile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="details/:mediaType/:id" element={<Details />} />
          <Route path="search" element={<Search />} />
          <Route path="my-list" element={<MyList />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:userId" element={<UserProfile />} />
          <Route path="feed" element={<Feed />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
