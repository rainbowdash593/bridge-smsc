import smpp from 'smpp';
import { v4 as uuidv4 } from 'uuid';
import MultipartMessages from '@utils/multipart';
import { readUDH } from '@utils/gsm';

//TODO validate user credentials
const checkAsyncUserPass = async (system_id, password) => {
  return Promise.resolve(true);
};

const saveAsyncSms = async (sms) => {
  const message_id = uuidv4();
  return Promise.resolve(message_id);
};

class SessionEvent {
  register(event: string, session, callback: CallableFunction): SessionEvent {
    session.on(event, (...args) => callback(session, ...args));
    return this;
  }
}

class Handlers {
  static error(session, err): void {
    console.log(session);
    console.log(err);
  }

  static async bind(session, pdu): Promise<void> {
    // we pause the session to prevent further incoming pdu events,
    // untill we authorize the session with some async operation.
    session.pause();
    const isValid = await checkAsyncUserPass(pdu.system_id, pdu.password);
    if (isValid) {
      session.send(pdu.response());
      session.resume();
    } else {
      session.send(
        pdu.response({
          command_status: smpp.ESME_RBINDFAIL,
        }),
      );
      session.close();
    }
  }

  static async enquire_link(session, pdu): Promise<void> {
    session.send(pdu.response());
  }

  static async unbind(session, pdu): Promise<void> {
    session.send(pdu.response());
  }

  static async submit_sm(session, pdu): Promise<void> {
    if (pdu.short_message.udh) {
      const [header, ...rest] = pdu.short_message.udh;
      const udh = readUDH(header);
      const result = MultipartMessages.put(pdu, pdu.short_message.message, udh);
      if (!result) return;

      const [message, pdus] = result;
      const sms = {
        from: pdu.source_addr,
        to: pdu.destination_addr,
        message,
      };
      const messageId = await saveAsyncSms(sms);
      pdus.forEach((unhandledPdu) => {
        session.send(unhandledPdu.response({ message_id: messageId }));
      });
    } else {
      const sms = {
        from: pdu.source_addr,
        to: pdu.destination_addr,
        // message: pdu.message_payload ? pdu.message_payload : pdu.short_message,
        message: pdu.short_message,
      };
      const messageId = await saveAsyncSms(sms);
      session.send(pdu.response({ message_id: messageId }));
    }
  }
}

export { SessionEvent, Handlers };
