import { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import Message from '../components/Message.jsx';
import './Home.css';
import axios from 'axios';
import { AndroidAlarmIntent } from '@facetokeyboard/android-alarmclock';
import useRecursiveTimeout from '../useRecursiveTimeout.ts';

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
  const commandConfirm = {
      userId,
      messageType: 'text',
      messageContent: 'Command confirmed',
    };

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
          const latestMsg = data[data.length - 1].messageContent;
          if (latestMsg[0] === '/') {
            commandHandler(latestMsg);
          }
        }
      })
      .catch(err => console.log('Error mapping messages: ', err));
  };

  useEffect(() => {
    getMessages(userId);
  }, [userId])

  useRecursiveTimeout(() => {
    getMessages(userId);
  }, 6000);

  const commandHandler = (msg) => {
    console.log('handling command: ', msg);
    const params = msg.split(' ');
    const first = params.shift();
    if (first === '/alarm') {
      alarmCreateHandler(params.shift(), params.shift(), params.join(' '));
    }
    if (first === '/timer') {
      timerCreateHandler(params.shift(), params.join(' '));
    }

  };

  const messageChangeHandler = (e) => {
    setMessage(e.target.value);
  };

  const messageSendHandler = (e) => {
    e.preventDefault();
    messageData.userId = userId;
    messageData.messageType = 'text';
    messageData.messageContent = message;

    httpRequest.post('/messages', messageData)
      .catch(err => console.log('Error submitting message: ', err))
      .then(() => {
        getMessages(userId);
        setMessage('');
      });
  };

  const userIdChangeHandler = (e) => {
    setUserId(e.target.value);
  }

  const alarmCreateHandler = (hour, minute, message) => {
    const settings = {
      hour: parseInt(hour),
      minute: parseInt(minute),
      message,
    }
    AndroidAlarmIntent.createAlarm(settings)
      .then(() => httpRequest.post('/messages', commandConfirm))
      .catch(err => console.log('command confirm error: ', err))
      .then(() => getMessages(userId));
  }

  const timerCreateHandler = (duration, message) => {
    const options = {
      duration: parseInt(duration),
      message,
    }
    console.log('timer options: ', options);
    AndroidAlarmIntent.createTimer(options)
      .then(() => httpRequest.post('/messages', commandConfirm))
      .catch(err => console.log('command confirm error: ', err))
      .then(() => getMessages(userId));
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
          <br></br>
          <br></br>
          <button id='button-send' type='submit' onClick={messageSendHandler} >Send</button>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default Home;
