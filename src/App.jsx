import React from 'react';
import styles from './App.module.css';
import io from 'socket.io-client';
const socket = io('http://localhost:3001');

const App = () => {
  const [nome, setNome] = React.useState(null);
  const [login, setLogin] = React.useState(null);
  const [senha, setSenha] = React.useState(null);
  const [logado, setLogado] = React.useState(false);
  const [mensagem, setMensagem] = React.useState(null);
  const [remetente, setRemetente] = React.useState(null);
  const [mensagensRecebidas, setMensagensRecebidas] = React.useState([]);
  const [mensagensEnviadas, setMensagensEnviadas] = React.useState([]);
  const cadastrar = async () => {
    try {
      const response = await fetch('http://localhost:3000/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome,
          login,
          senha,
        }),
      });
      if (response.ok) {
        console.log('Cadastro bem-sucedido!');
      } else {
        console.error('Erro ao cadastrar:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao cadastrar:', error.message);
    }
  };

  const logar = async () => {
    try {
      if (!login || !senha) {
        console.error('Insira um login e uma senha');
        return;
      }

      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login,
          senha,
        }),
      });

      if (response.ok) {
        console.log('Login bem-sucedido!');
        const socket = io('http://localhost:3001');
        socket.emit('usuario_autenticado', { login });
        setLogado(true);
      } else {
        console.error('Erro ao fazer login:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error.message);
    }
  };

  const enviarMensagem = () => {
    if (mensagem.trim() === '') {
      console.error('Digite uma mensagem antes de enviar.');
      return;
    }
    setMensagensEnviadas((mensagens) => [...mensagens, mensagem]);
    socket.emit('enviar_mensagem', {
      senderId: login,
      receiverId: remetente,
      conteudo: mensagem,
      timestamp: new Date(),
    });
    setMensagem('');
    console.log(mensagensEnviadas);
    console.log('VERIFICANDO DADOS: ', login, remetente);
  };
  React.useEffect(() => {
    const fetchMensagens = async () => {
      try {
        const mensagensResponse = await fetch(
          `http://localhost:3000/mensagens/${login}`,
        );
        const mensagensData = await mensagensResponse.json();

        if (mensagensData) {
          setMensagensRecebidas(mensagensData);
        } else {
          console.warn(
            'Mensagens recebidas não contêm propriedade "conteudo".',
            mensagensData,
          );
        }
      } catch (error) {
        console.error('Erro ao obter mensagens:', error.message);
      }
    };

    if (logado && login) {
      fetchMensagens();
    }
  }, [logado, login]);
  React.useEffect(() => {
    socket.on('receber_mensagem', (mensagemRecebida) => {
      setMensagensRecebidas((mensagens) => [...mensagens, mensagemRecebida]);
    });

    return () => {
      socket.off('receber_mensagem');
    };
  }, [mensagem]);

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
                  console.log(mensagem);
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
                value={login}
                onChange={({ target }) => setLogin(target.value)}
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
