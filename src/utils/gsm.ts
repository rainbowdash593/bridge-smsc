interface UDHInfo {
  uniq: number;
  total: number;
  part: number;
}

const readUDH = (raw: Buffer): UDHInfo | undefined => {
  try {
    const info = raw.toJSON();
    const [part, total, uniq, ...rest] = info.data.reverse();
    return { uniq, part, total };
  } catch (e) {
    console.error(`Cant parse UDH buffer: ${raw}`);
    return;
  }
};

export { readUDH, UDHInfo };
