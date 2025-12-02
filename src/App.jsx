import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Details from './pages/Details';
import Search from './pages/Search';
import MyList from './pages/MyList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="details/:mediaType/:id" element={<Details />} />
          <Route path="search" element={<Search />} />
          <Route path="my-list" element={<MyList />} />
          {/* Placeholder routes for now */}
          <Route path="series" element={<div className="container" style={{paddingTop: '100px'}}>Series Page (Coming Soon)</div>} />
          <Route path="movies" element={<div className="container" style={{paddingTop: '100px'}}>Movies Page (Coming Soon)</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
