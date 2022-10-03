import { UDHInfo } from '@utils/gsm';

interface IMessagePart {
  message: string;
  part: number;
}

interface IStorageItem {
  pdus: Array<any>;
  parts: IMessagePart[];
  length: number;
}

class MultipartMessages {
  protected storage = new Map<number, IStorageItem>();

  protected getEmptyItem(udh: UDHInfo): IStorageItem {
    return {
      pdus: [],
      parts: [],
      length: udh.total,
    };
  }

  protected concatenateMessage(item: IStorageItem): string {
    const parts = [...item.parts];
    parts.sort((a, b) => a.part - b.part);
    return parts.map((part) => part.message).join('');
  }

  public put(pdu, message, udh: UDHInfo): [string, Array<any>] | undefined {
    const item = this.storage.has(udh.uniq) ? this.storage.get(udh.uniq) : this.getEmptyItem(udh);
    item.parts.push({ message, part: udh.part });
    item.pdus.push(pdu);

    console.log(item);

    if (item.length === item.parts.length) {
      this.storage.delete(udh.uniq);
      return [this.concatenateMessage(item), item.pdus];
    }

    this.storage.set(udh.uniq, item);
    return;
  }
}

export default new MultipartMessages();
