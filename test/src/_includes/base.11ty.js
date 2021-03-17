module.exports = class Base {
  data() {
    return {};
  }

  render(data) {
    return `
    <!doctype html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width,  initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0">
            <meta name="description" content="test thing" >
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <title>
                test
            </title>
        </head>
        <body class="">
            ${data.content}
        </body>
    </html>
      `;
  }
};
