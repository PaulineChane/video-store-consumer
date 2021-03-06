import React, {Component, useState, useEffect} from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from 'react-router-dom';
import Customers from './Components/Customers'
import Library from './Components/Library'
import Search from './Components/Search'
import Home from './Components/Home'
import './App.css'
import axios from 'axios';
import { useAlert } from 'react-alert'

export default function App() {
  // BASE URL FOR API
  const BASE_URL = 'http://localhost:3000/'
  // error state
  const [errorMessage, setErrorMessage] = useState('');
  // errors 
  const allErrors = (errorData) => {
      const errors = [];
      
      console.log(errorData)
      for(const error of errorData) {
      errors.push(<li>{error}</li>);
      }
  
      return errors;
  }

  const [vidAdded, setVidAdded] = useState(false); // used to update list without losing error messages

  // state variables
  const [videoList, setVideoList] = useState([]);
  const alert = useAlert();

  // get all videos 
  useEffect(() => {
    console.log(`${BASE_URL}videos`);
      axios.get(`${BASE_URL}videos`)
      .then((response) => {
          setVideoList(response.data);
          setErrorMessage(null);
      })
      .catch((error) => {
          setErrorMessage([error.message, 'failed to retrieve videos in library.'])
          console.log(error.message);
      });
  }, [vidAdded]);

  // state for selected video
  const [currentVideo, setVideo] = useState({id: NaN, title: '', imgUrl: 'favicon.ico'});
  const getCurrentVideo = (curId, curTitle, curImg) => {
    setVideo({id: curId, title: curTitle, imgUrl: curImg});
  }

  // state for selected customer
  const [currentCustomer, setCurrentCustomer] = useState({id: NaN, name: ''})
  const getCurrentCustomer = (custId, custName) => {
    setCurrentCustomer({
      id: custId,
      name: custName
    })
  }

  const onCheckOut = (event) => {
    event.preventDefault();

    console.log('checking out')
    // axios post request goes here

    const dueDate = new Date(new Date().getTime()+(7*24*60*60*1000));

    axios.post(`${BASE_URL}rentals/${currentVideo.title}/check-out`, {
      // eslint-disable-next-line camelcase
      customer_id: currentCustomer.id,
      // eslint-disable-next-line camelcase
      due_date: dueDate
    })
    .then((response) => {
      console.log(response);
      alert.show(`${currentVideo.title} successfully checked out to ${currentCustomer.name}!`)
    })
    .catch((error) => {
      console.log(error);
      setErrorMessage([error.message.toLowerCase(), 'rental failed - please check inventory and that customer and video are valid']);
      alert.show(`${errorMessage}`)
    });

    setVideo({id: NaN, title: '', imgUrl: 'favicon.ico'})
    setCurrentCustomer({id: NaN, name: ''})

  }

  return (
    <Router>
      <div>
        <header>
          <nav className='navbar'>
                <Link to="/">Home</Link>
                <Link to="/search">Search</Link>
                <Link to="/library">Video Library</Link>
                <Link to="/customers">Customer List</Link>
          </nav>
        </header>
        <section className='checkout__bar'> 
          <article className='checkout__bar-rentals'>
            <h1>Rentals</h1>
            {currentCustomer.name && currentVideo.title ? <button onClick={onCheckOut} className='checkout__select'>Check-out</button> : null }
          </article>
          <article>
            <h1>current customer</h1>
            <h4>{currentCustomer.name ? currentCustomer.name : 'none selected'}</h4> 
          </article>
          <article>
            <h1>current video</h1>
            <h4>{currentVideo.title ? currentVideo.title : 'none selected'}</h4> 
            <img src = {currentVideo.imgUrl} alt = {`Poster for ${currentVideo.title}`}/>         
          </article>
          
        </section>
        <article className = 'validation-errors-display'>
                <h3>{errorMessage ? 'errors detected!' : ''}</h3>
                <ul className = 'validation-errors-display__list'>
                    {errorMessage ? allErrors(errorMessage) : ''}
                </ul>
        </article> 
        <Switch>
          <Route path="/customers">
            <Customers url = {BASE_URL} curCustomer = {getCurrentCustomer} />
          </Route>
          <Route path="/library">
            <Library url = {`${BASE_URL}videos`} curVid = {getCurrentVideo} videoList = {videoList}/>
          </Route>
          <Route path="/search">
            <Search curVid = {getCurrentVideo} setError = {setErrorMessage} videoList = {videoList} vidAdded = {vidAdded} setVidAdded = {setVidAdded}/>
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
        
        <footer className='footer'>
          Copyrighted © by Pauline and Tram 2021
        </footer>
        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        
      </div>
    </Router>
  );
}

