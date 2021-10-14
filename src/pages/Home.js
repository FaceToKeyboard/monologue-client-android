import { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import Message from '../components/Message.jsx';
import './Home.css';
import axios from 'axios';
import { createAlarm } from '@facetokeyboard/android-alarmclock';

const Home = () => {
  const messageData = {};
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(1);
  const queryString = new URLSearchParams();

  const getMessages = (userId) => {
    queryString.set('userId', userId);
    return axios.get('http://10.0.12.45:3000/messages', { params: queryString })
      .catch(err => console.log('Error retrieving messages: ', err))
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

    axios.post('http://10.0.12.45:3000/messages', messageData)
      .catch(err => console.log('Error submitting message: ', err))
      .then(() => getMessages(userId));
  };

  const userIdChangeHandler = (e) => {
    setUserId(e.target.value);
  }

  const alarmCreateHandler = () => {
    createAlarm(7, 50, 'This alarm is from Monologue!');
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
      </IonContent>
    </IonPage>
  );
};

export default Home;
