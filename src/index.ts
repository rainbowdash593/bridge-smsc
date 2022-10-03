import smpp from 'smpp';
import { SessionEvent, Handlers } from '@/handlers';

var server = smpp.createServer(
  {
    debug: true,
  },
  function (session) {
    const event = new SessionEvent();

    event
      //TODO submit_sm_multi
      //TODO data_sm
      //TODO query_sm
      //TODO cancel_sm
      //TODO generic_nack
      .register('bind_transceiver', session, Handlers.bind)
      .register('bind_transmitter', session, Handlers.bind)
      .register('bind_receiver', session, Handlers.bind)
      .register('unbind', session, Handlers.unbind)
      .register('error', session, Handlers.error)
      .register('enquire_link', session, Handlers.enquire_link)
      .register('submit_sm', session, Handlers.submit_sm);
  },
);
console.log('Start listening 2775....');
server.listen(2775);
