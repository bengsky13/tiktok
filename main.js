const { WebcastPushConnection } = require("tiktok-live-connector");
const { WebSocketServer } = require("ws");
// Username of someone who is currently live
let tiktokUsername = "primitiveadventure2";
const wss = new WebSocketServer({ port: 8080 });
const percentage = {
  prabowo: 0,
  anis: 0,
  ganjar: 0,
};

const getPercentage = (data) => {
  const result = { prabowo: 0, anis: 0, ganjar: 0 };
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  result.prabowo = ((data.prabowo / total) * 100).toFixed(2);
  result.anis = ((data.anis / total) * 100).toFixed(2);
  result.ganjar = ((data.ganjar / total) * 100).toFixed(2);
  return result;
};
wss.on("connection", function connection(ws) {
  // Create a new wrapper object and pass the username
  let tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

  // Connect to the chat (await can be used as well)
  tiktokLiveConnection
    .connect()
    .then((state) => {
      console.info(`Connected to roomId ${state.roomId}`);
    })
    .catch((err) => {
      console.log("error");
      //   ws.close();
    });
  // Define the events that you want to handle
  // In this case we listen to chat messages (comments)
  tiktokLiveConnection.on("chat", (data) => {
    var comment = data.comment.toLowerCase();
    console.log(comment);
    switch (comment) {
      case "prabowo":
        percentage.prabowo += 1;
        break;
      case "ganjar":
        percentage.ganjar += 1;
        break;
      case "anies":
        percentage.anis += 1;
        break;
      default:
        break;
    }
    const response = JSON.stringify(getPercentage(percentage));
    ws.send(`{"type":2, "data":${response}"}`);
  });

  // And here we receive gifts sent to the streamer
  tiktokLiveConnection.on("gift", (data) => {
    // 5655 rose
    // 5760 weight
    // 5269
    if (data.gift.repeat_end) {
      switch (data.gift.gift_id) {
        case 5655:
          percentage.prabowo += data.gift.repeat_count;
          break;
        case 5760:
          percentage.ganjar += data.gift.repeat_count;
          break;
        case 5269:
          percentage.anis += data.gift.repeat_count;
          break;
        default:
          break;
      }
      const response = JSON.stringify(getPercentage(percentage));
      ws.send(`{"type":1, "data":${response}"}`);
    }
  });
});
