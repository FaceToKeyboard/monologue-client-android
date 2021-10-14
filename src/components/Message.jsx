import React from "react";

const Message = (props) => {

  return (
    <p className='message' >{props.message.date ? new Date(props.message.date).toLocaleString() : null} | {props.message.messageContent}</p>
  );
};

export default Message;
