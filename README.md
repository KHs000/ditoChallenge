# ditoChallenge



<h2><b>Execução</b></h2>

`git clone` <br/>
`cd ditoChallenge/` <br/>
`npm install` <br/>
`node server.js` <br/>

<h2><b>Endpoints</b></h2>

<ul>
  <li><code>pushEvents</code>: (POST) Inseri um array de eventos na base de dados. POST params exemplo:
    <pre>
    <code>
      [
        {
           event: "some_event", 
           timestamp: "2016-09-22T13:57:31.2311892-04:00"
        }, ...
      ]
    </code>
    </pre>
  </li>
  <li><code>autoComplete</code>: (POST) Busca pelo nome do evento na base de dados. POST params exemplo:
    <pre>
    <code>
      {
        word: "bu"
      }
    </code>
    </pre>
  </li>
  <li><code>timeline</code>: (GET) Monta uma timeline dos eventos disponibilizados no endpoint 
    https://storage.googleapis.com/dito-questions/events.json
  </li>
</ul>

<h2><b>Versões utilizadas</b></h2>

<ul>
  <li>Nodejs v8.12.0</li>
  <li>npm v6.4.1</li>
  <li>Dependências internas do projeto listadas em <code>package.json</code></li>
</ul>
