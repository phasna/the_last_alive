export function getHealth(_req, res) {
  res.json({
    status: "ok",
    game: "Last One Alive",
    stack: "Express + Socket.io",
  });
}
