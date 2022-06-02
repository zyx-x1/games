export const createRandomCNChar = () => {
  let unicode = "\\u" + (Math.round(Math.random() * 20901) + 19968).toString(16);
  return eval("'" + unicode + "'");
};
