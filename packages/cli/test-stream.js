const EventSource = require('eventsource');

const url = 'http://localhost:3003/api/generate-sdlc/stream?input=test&documentTypes=business';
console.log('Connecting to:', url);

const eventSource = new EventSource(url);

eventSource.onopen = () => {
  console.log('Connection opened');
};

eventSource.onmessage = (event) => {
  console.log('Message received:', event.data.substring(0, 100));
};

eventSource.onerror = (error) => {
  console.log('Error event:', error);
  console.log('ReadyState:', eventSource.readyState);
  console.log('URL:', eventSource.url);
  
  if (error.status) {
    console.log('Status:', error.status);
  }
  if (error.message) {
    console.log('Message:', error.message);
  }
  
  eventSource.close();
  process.exit(1);
};

// Close after 30 seconds
setTimeout(() => {
  console.log('Closing connection');
  eventSource.close();
  process.exit(0);
}, 30000);