import { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import Message from '../components/Message.jsx';
import './Home.css';
import axios from 'axios';
import { AndroidAlarmIntent } from '@facetokeyboard/android-alarmclock';

const Home = () => {
  const messageData = {};
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(1);
  const queryString = new URLSearchParams();
  const httpRequest = axios.create({
    baseURL: 'http://10.0.12.45:3000',
    timeout: 2000,
  });

  const getMessages = (userId) => {
    queryString.set('userId', userId);
    return httpRequest.get('/messages', { params: queryString })
      .catch(err => {
        console.log('There was an error GETting messages.');
        if (err.response) {
          console.log('err.response is: ', err.response);
        } else if (err.request) {
          console.log('err.request is: ', err.request);
        } else {
          console.log('No .request or .response method on the object, so more likely not a network error.', err);
        }
      })
      .then(({data}) => {
        if (data !== undefined) {
          setMessages(data);
        }
      })
      .catch(err => console.log('Error mapping messages: ', err));
  };

  useEffect(() => {
    getMessages(userId);
  }, [userId])

  const messageChangeHandler = (e) => {
    setMessage(e.target.value);
  };

  const sendButtonHandler = (e) => {
    e.preventDefault();
    messageData.userId = userId;
    messageData.messageType = 'text';
    messageData.messageContent = message;

    httpRequest.post('/messages', messageData)
      .catch(err => console.log('Error submitting message: ', err))
      .then(() => getMessages(userId));
  };

  const userIdChangeHandler = (e) => {
    setUserId(e.target.value);
  }

  const alarmCreateHandler = () => {
    const settings = {
      hour: 7,
      minute: 50,
      message: 'This alarm is from Monologue!',
    }
    AndroidAlarmIntent.createAlarm(settings);
  }

  const timerCreateHandler = () => {
    AndroidAlarmIntent.createTimer({duration: 10, message: 'This was created by Monologue!'});
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Monologue</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Monologue</IonTitle>
          </IonToolbar>
        </IonHeader>
        <label>Enter user ID:
          <input name='input-userid' type='number' value={userId} onChange={userIdChangeHandler} ></input>
        </label>
        <br></br>
        <div id='message-container'>
          {messages.map((message) => (
            <Message key={message._id.slice(message.length-7)} message={message} />
          ))}
        </div>
        <br></br>
        <form>
          <label>Message:
            <input id='input-message' name='message-input' type='text' placeholder='Send a message' value={message} onChange={messageChangeHandler} ></input>
          </label>
          <button id='button-send' type='submit' onClick={sendButtonHandler} >Send</button>
        </form>
        <br></br>
        <button onClick={alarmCreateHandler} >Create an alarm?</button>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <button onClick={timerCreateHandler} >Create a timer?</button>
      </IonContent>
    </IonPage>
  );
};

export default Home;
