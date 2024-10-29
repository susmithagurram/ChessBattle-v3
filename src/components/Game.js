import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { auth, firestore } from '../firebase/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../styles/Game.css';

const Game = () => {
  const [game, setGame] = useState(new Chess());
  const [user, setUser] = useState(null);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [message, setMessage] = useState('');
  const [boardColors, setBoardColors] = useState({
    light: '#ffffff',
    dark: '#000000'
  });
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isCheck, setIsCheck] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [activeTheme, setActiveTheme] = useState('default');
  const navigate = useNavigate();
  const [moveHistory, setMoveHistory] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setName(user.displayName || '');
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Handles the click on a square, managing piece selection and movement
  const handleSquareClick = (square) => {
    const piece = game.get(square);
    
    if (selectedPiece === square) {
      setSelectedPiece(null);
      setPossibleMoves([]);
    } else if (piece && piece.color === game.turn()) {
      setSelectedPiece(square);
      const moves = game.moves({ square: square, verbose: true });
      setPossibleMoves(moves.map(move => move.to));
    } else if (selectedPiece) {
      try {
        const move = game.move({
          from: selectedPiece,
          to: square,
          promotion: 'q'
        });
        
        if (move) {
          if (move) {
            const newGame = new Chess(game.fen());
            setGame(newGame);
            setSelectedPiece(null);
            setPossibleMoves([]);
            saveGameState();
            setIsCheck(newGame.inCheck());
            
            // Save the current game state to the move history
            setMoveHistory(prevHistory => [...prevHistory, game.fen()]);
          }
        }
      } catch (error) {
        setMessage("Invalid move");
        setTimeout(() => setMessage(''), 2000);
      }
    }
  };

  const handleUndo = () => {
    if (moveHistory.length > 0) {
      const previousState = moveHistory[moveHistory.length - 1];
      const newGame = new Chess(previousState);
      setGame(newGame);
      setMoveHistory(prevHistory => prevHistory.slice(0, -1));
      setIsCheck(newGame.inCheck());
      saveGameState();
    } else {
      setMessage("No more moves to undo");
      setTimeout(() => setMessage(''), 2000);
    }
  };

  // Saves the current game state to Firestore
  const saveGameState = async () => {
    if (user) {
      try {
        await setDoc(doc(firestore, 'games', user.uid), {
          fen: game.fen(),
          lastUpdated: new Date()
        });
      } catch (error) {
        console.error('Error saving game state:', error);
      }
    }
  };

  // Returns the image source for a given chess piece
  const getPieceImage = (piece) => {
    if (!piece) return null;
    const color = piece.color === 'w' ? 'white' : 'black';
    const pieceType = {
      'p': 'pawn',
      'n': 'knight',
      'b': 'bishop',
      'r': 'rook',
      'q': 'queen',
      'k': 'king'
    }[piece.type];
    return `/assets/${color}_${pieceType}.svg`;
  };

  // Finds the position of the king for a given color
  const getKingPosition = (color) => {
    const squares = game.board();
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = squares[i][j];
        if (piece && piece.type === 'k' && piece.color === color) {
          return String.fromCharCode(97 + j) + (8 - i);
        }
      }
    }
    return null;
  };

  // Renders the chessboard and its squares
  const renderBoard = () => {
    const board = [];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    
    board.push(
      <div key="file-labels" className="file-labels">
        {files.map(file => <div key={file}>{file}</div>)}
      </div>
    );

    const kingPosition = getKingPosition(game.turn());

    for (let i = 7; i >= 0; i--) {
      const row = [];
      
      row.push(<div key={`rank-${i+1}`} className="rank-label">{i+1}</div>);
      
      for (let j = 0; j < 8; j++) {
        const square = String.fromCharCode(97 + j) + (i + 1);
        const piece = game.get(square);
        const isSelected = selectedPiece === square;
        const isPossibleMove = possibleMoves.includes(square);
        const isKingInCheck = isCheck && square === kingPosition;
        const squareColor = (i + j) % 2 === 0 ? boardColors.light : boardColors.dark;
        row.push(
          <div
            key={square}
            className={`square ${isSelected ? 'selected' : ''} ${isPossibleMove ? 'possible-move' : ''} ${isKingInCheck ? 'king-in-check' : ''}`}
            style={{ backgroundColor: isKingInCheck ? 'red' : squareColor }}
            onClick={() => handleSquareClick(square)}
          >
            {piece && <img src={getPieceImage(piece)} alt={piece.type} className="chess-piece" />}
          </div>
        );
      }
      board.push(<div key={`row-${i}`} className="board-row">{row}</div>);
    }
    return board;
  };

  // Changes the colors of the chessboard based on the selected theme
  const changeColors = (lightColor, darkColor, themeName) => {
    setBoardColors({ light: lightColor, dark: darkColor });
    setActiveTheme(themeName);
  };

  // Toggles the visibility of the dropdown menu
  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  // Logs out the user and navigates to the home page
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Navigates to the home page when the logo is clicked
  const handleLogoClick = () => {
    navigate('/');
  };

  // Opens the profile editing modal
  const handleProfileClick = () => {
    setProfileVisible(true);
    setDropdownVisible(false);
  };

  // Saves the profile changes and closes the modal
  const handleSaveProfile = () => {
    setProfileVisible(false);
  };

  // Exits the game and navigates to the home page
  const handleExit = () => {
    navigate('/');
  };

  // Starts a new game by resetting the game state
  const handleNewGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setSelectedPiece(null);
    setPossibleMoves([]);
    setIsCheck(false);
    saveGameState();
  };

  return (
    <div className="game">
      <div className="logo-text" onClick={handleLogoClick}>Chess Battle</div>
      {user && (
        <div className="user-info" onClick={toggleDropdown}>
          {user.displayName || user.email}
          {dropdownVisible && (
            <div className="dropdown">
              <button onClick={handleProfileClick} className="dropdown-button">Profile</button>
              <button onClick={handleLogout} className="dropdown-button">Logout</button>
            </div>
          )}
        </div>
      )}
      <div className="game-container">
        <div className="chessboard-container">
          <div className="chessboard">
            {renderBoard()}
          </div>
          <div className="game-controls">
            <button onClick={handleExit}>Exit</button>
            <button onClick={handleNewGame}>New Game</button>
            <button onClick={handleUndo}>Undo</button>
          </div>
        </div>
        {message && <div className="message">{message}</div>}
        <div className="color-options">
          <button 
            onClick={() => changeColors('#ffffff', '#000000', 'default')}
            style={{ backgroundColor: activeTheme === 'default' ? 'white' : '#00A0FF', color: activeTheme === 'default' ? '#00A0FF' : 'white' }}
          >
            Default (Black & White)
          </button>
          <button 
            onClick={() => changeColors('#f0d9b5', '#b58863', 'wooden')}
            style={{ backgroundColor: activeTheme === 'wooden' ? 'white' : '#00A0FF', color: activeTheme === 'wooden' ? '#00A0FF' : 'white' }}
          >
            Wooden Theme
          </button>
          <button 
            onClick={() => changeColors('#add8e6', '#4682b4', 'blue')}
            style={{ backgroundColor: activeTheme === 'blue' ? 'white' : '#00A0FF', color: activeTheme === 'blue' ? '#00A0FF' : 'white' }}
          >
            Blue Theme
          </button>
          <button 
            onClick={() => changeColors('#90EE90', '#228B22', 'green')}
            style={{ backgroundColor: activeTheme === 'green' ? 'white' : '#00A0FF', color: activeTheme === 'green' ? '#00A0FF' : 'white' }}
          >
            Green Theme
          </button>
        </div>
        <div className="turn-indicator">
          {game.turn() === 'w' ? "White's turn" : "Black's turn"}
        </div>
      </div>
      {profileVisible && (
        <div className="profile-modal">
          <div className="profile-content">
            <h2>Edit Profile</h2>
            <label>
              Name:
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label>
              Date of Birth:
              <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
            </label>
            <button onClick={handleSaveProfile}>Save</button>
            <button onClick={() => setProfileVisible(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;