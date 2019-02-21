# SwarmCityShortcode

Temporal UX solution for users to transfer funds easily / ENS based solution is being developed

## Generate short url

To generate a short url, the front end has to do a POST request to "/" with text data:

```
'{"publicKey":"0xabcd1234"}'
```

Since the data will be directly stored in a level db, the API is expecting text data to avoid parsing / stringifing and save resources.

The API will reply with json:

```js
{
  shortcode: "00423";
}
```

## Query shortcode

Do a GET request to the url "/\${id}", i.e. s.swarm.city/00423. It will return the stored data as json

```js
{
  publicKey: "0xabcd1234";
}
```
