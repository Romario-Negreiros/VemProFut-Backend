import app from ".";

app.listen({ port: 5000 }, (err, address) => {
  if (err == null) {
    console.error(err);
  } else {
    console.log(address);
  }
});
