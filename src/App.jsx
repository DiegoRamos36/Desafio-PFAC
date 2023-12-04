import React from 'react';
import styles from './App.module.css';
import axios from 'axios';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyC03y27TfLVZomwsU16K1a8JQTpovtYyR4',
  authDomain: 'chatdb-860ce.firebaseapp.com',
  databaseURL: 'https://chatdb-860ce-default-rtdb.firebaseio.com',
  projectId: 'chatdb-860ce',
  storageBucket: 'chatdb-860ce.appspot.com',
  messagingSenderId: '1063378412727',
  appId: '1:1063378412727:web:862418096c6110ad80d932',
  measurementId: 'G-7CW2S0BSLQ',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const App = () => {
  const [nome, setNome] = React.useState(null);
  const [email, setEmail] = React.useState(null);
  const [senha, setSenha] = React.useState(null);
  const [logado, setLogado] = React.useState(false);
  const [mensagem, setMensagem] = React.useState(null);
  const [remetente, setRemetente] = React.useState(null);
  const [session, setSession] = React.useState(null);
  const [mensagensRecebidas, setMensagensRecebidas] = React.useState([]);
  const [mensagensEnviadas, setMensagensEnviadas] = React.useState([]);

  const headers = {
    'Content-Type': 'application/json',
  };

  const cadastrar = async () => {
    try {
      // Verificar se o email já existe no banco de dados
      const verificarEmailResponse = await fetch(
        'https://chatdb-860ce-default-rtdb.firebaseio.com/clientes.json',
      );

      if (!verificarEmailResponse.ok) {
        throw new Error(`Erro HTTP! Status ${verificarEmailResponse.status}`);
      }

      const clientes = await verificarEmailResponse.json();

      const emailJaCadastrado = Object.values(clientes).some(
        (cliente) => cliente.email === email,
      );

      if (emailJaCadastrado) {
        alert('Este email já está cadastrado.');
        return;
      }

      // Se o email não estiver cadastrado, proceder com o cadastro

      const cadastrarResponse = await fetch(
        `https://chatdb-860ce-default-rtdb.firebaseio.com/clientes/${nome}.json`,
        {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ nome, email, senha }),
        },
      );

      if (!cadastrarResponse.ok) {
        throw new Error(`Erro HTTP! Status ${cadastrarResponse.status}`);
      }

      const data = await cadastrarResponse.json();
      alert('Cadastrado com sucesso');
      console.log('Dados enviados com sucesso: ', data);
    } catch (error) {
      console.error('Erro durante o cadastro:', error.message);
    }
  };

  const logar = async () => {
    try {
      if (!email || !senha) {
        console.error('Insira um login e uma senha');
        return;
      }

      const response = await axios.get(
        'https://chatdb-860ce-default-rtdb.firebaseio.com/clientes.json',
      );
      const clientes = response.data;
      const credenciaisValidas = Object.values(clientes).some(
        (cliente) => cliente.email === email && cliente.senha === senha,
      );

      if (credenciaisValidas) {
        setLogado(true);
      } else {
        console.error('Credenciais inválidas');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error.message);
    }
  };

  const enviarMensagem = () => {
    const senderId = email;
    const receiverId = remetente;
    const timestamp = new Date().toString();
    const conteudo = mensagem;

    axios
      .post(
        `https://chatdb-860ce-default-rtdb.firebaseio.com/mensagem.json`,
        {
          senderId,
          receiverId,
          conteudo,
          timestamp,
        },

        { headers },
      )
      .then((response) => {
        setSession(response.data.name);
        console.log('Mensagem enviada com sucesso:');
      })
      .catch((error) => {
        console.error('Erro ao enviar mensagem:', error);
      });
  };

  return (
    <div className={styles.globalContainer}>
      <div className={styles.mainContainer}>
        {logado ? (
          <div className={styles.chat}>
            <span style={{ marginBottom: '2rem' }} className={styles.chatText}>
              {mensagensEnviadas.map((mensagem) => (
                <p>{mensagem}</p>
              ))}

              {mensagensRecebidas.map((message, index) => (
                <p key={index}>{message.conteudo}</p>
              ))}
            </span>
            <label>
              Mensagem:
              <input
                value={mensagem}
                onChange={({ target }) => {
                  setMensagem(target.value);
                }}
                type="text"
              />
              <label className={styles.remetente}>
                <br />
                Remetente:{' '}
                <input
                  value={remetente}
                  onChange={({ target }) => setRemetente(target.value)}
                  type="text"
                />
              </label>
              <button onClick={enviarMensagem}>Enviar</button>
            </label>
            <span
              onClick={({ target }) => {
                setLogado(false);
                setSession(null);
                setMensagensEnviadas([]);
              }}
              className={styles.deslogar}
            >
              deslogar
            </span>
          </div>
        ) : (
          <div className={styles.login}>
            <label>
              Nome
              <br />
              <input
                value={nome}
                onChange={({ target }) => setNome(target.value)}
                required
                type="text"
              />
            </label>
            <label>
              Login
              <br />
              <input
                required
                value={email}
                onChange={({ target }) => setEmail(target.value)}
                type="text"
              />
            </label>
            <label>
              Senha
              <br />
              <input
                value={senha}
                required
                onChange={({ target }) => setSenha(target.value)}
                type="password"
              />
            </label>
            <span className={styles.botoes}>
              <button onClick={cadastrar}>Cadastrar</button>
              <button onClick={logar}>Logar</button>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
export default App;
