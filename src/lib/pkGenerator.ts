interface information {
  id: number;
  time: number;
}

export const pkGenerator = ({ id, time }: information) => {
  const now = new Date().getTime();

  return id + time + now;
};
