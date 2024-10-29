import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { auth } from '../firebase/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import '../styles/Puzzles.css';

const puzzles = {
  level1: [
    {
      fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1',
      solution: ['Qxf7#'],
      description: 'Mate in 1: White to move',
      hintComment: "Move Queen to f7"
    },
    {
      fen: "5rk1/5ppp/5PQ1/8/8/8/8/6BK w - - 0 1",
      solution: ['Qxg7#'],
      description: 'Mate in 1: White to move',
      hintComment: "Move Queen to g7"
    },
    {
      fen: '6k1/5ppp/8/8/8/8/5PPP/3Q2K1 w - - 0 1',
      solution: ['Qd8#'],
      description: 'Mate in 1: White to move',
      hintComment: "Move Queen to d8"
    }
  ],
  level2: [
    {
      fen: '1k6/ppp5/8/8/8/8/5Q2/4K3 w - - 0 1',
      solution: ['Qf7', 'Qb7#'],
      description: 'Mate in 2: White to move',
      hintComment: "Use the queen to restrict the king's movement before delivering checkmate."
    },
    {
      fen: '3r2k1/p4ppp/8/8/8/1B6/P4PPP/6K1 w - - 0 1',
      solution: ['Bh7+', 'Bf5#'],
      description: 'Mate in 2: White to move',
      hintComment: "The bishop can force the king into a mating net with a check."
    },
    {
      fen: '4k3/8/8/8/8/5Q2/5P2/4K3 w - - 0 1',
      solution: ['Qe4+', 'Qe7#'],
      description: 'Mate in 2: White to move',
      hintComment: "Use the queen to give a check that limits the king's escape squares."
    }
  ]
};

const Puzzles = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentLevel, setCurrentLevel] = useState('level1');
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [game, setGame] = useState(new Chess());
  const [moveIndex, setMoveIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [boardColors, setBoardColors] = useState({
    light: '#ffffff',
    dark: '#000000'
  });
  const [showHint, setShowHint] = useState(false);
  const [levelOptions] = useState(['level1', 'level2']); // Add level options

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    setGame(new Chess(puzzles[currentLevel][currentPuzzle].fen));
    setMoveIndex(0);
    setMessage(puzzles[currentLevel][currentPuzzle].description);
    setSelectedPiece(null);
    setPossibleMoves([]);
    setShowHint(false);
  }, [currentLevel, currentPuzzle]);
  

  // Handles the click event on a square, managing piece selection and movement
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
          setGame(new Chess(game.fen()));
          setSelectedPiece(null);
          setPossibleMoves([]);

          if (currentLevel === 'level1') {
            if (puzzles[currentLevel][currentPuzzle].solution.includes(move.san)) {
              setMessage('Puzzle solved! Well done!');
            } else {
              setMessage('Incorrect move. Try again.');
              setGame(new Chess(puzzles[currentLevel][currentPuzzle].fen));
            }
          } else if (currentLevel === 'level2') {
            if (move.san === puzzles[currentLevel][currentPuzzle].solution[moveIndex]) {
              setMoveIndex(moveIndex + 1);
              if (moveIndex + 1 === puzzles[currentLevel][currentPuzzle].solution.length) {
                setMessage('Puzzle solved! Well done!');
              } else {
                setMessage('Correct move! Make the final move.');
              }
            } else {
              setMessage('Incorrect move. Try again.');
              setGame(new Chess(puzzles[currentLevel][currentPuzzle].fen));
              setMoveIndex(0);
            }
          }
        }
      } catch (error) {
        setMessage("Invalid move");
        setTimeout(() => setMessage(''), 2000);
      }
    }
    setShowHint(false);
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

  // Renders the chessboard with pieces and squares
  const renderBoard = () => {
    const board = [];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    
    board.push(
      <div key="file-labels" className="file-labels">
        {files.map(file => <div key={file}>{file}</div>)}
      </div>
    );

    for (let i = 7; i >= 0; i--) {
      const row = [];
      
      row.push(<div key={`rank-${i+1}`} className="rank-label">{i+1}</div>);
      
      for (let j = 0; j < 8; j++) {
        const square = String.fromCharCode(97 + j) + (i + 1);
        const piece = game.get(square);
        const isSelected = selectedPiece === square;
        const isPossibleMove = possibleMoves.includes(square);
        const isHint = showHint && square === puzzles[currentLevel][currentPuzzle].solution[moveIndex].slice(-2);
        const squareColor = (i + j) % 2 === 0 ? boardColors.light : boardColors.dark;
        row.push(
          <div
            key={square}
            className={`square ${isSelected ? 'selected' : ''} ${isPossibleMove ? 'possible-move' : ''} ${isHint ? 'hint' : ''}`}
            style={{ backgroundColor: squareColor }}
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

  // Changes the colors of the chessboard squares
  const changeColors = (lightColor, darkColor) => {
    setBoardColors({ light: lightColor, dark: darkColor });
  };

  // Advances to the next puzzle or level
  const nextPuzzle = () => {
    if (currentPuzzle < puzzles[currentLevel].length - 1) {
      setCurrentPuzzle(currentPuzzle + 1);
    } else if (currentLevel === 'level1') {
      setCurrentLevel('level2');
      setCurrentPuzzle(0);
    } else {
      setMessage('Congratulations! You have completed all puzzles.');
    }
  };

  // Shows a hint for the current puzzle
  const showHintMove = () => {
    setShowHint(true);
    const hintComment = puzzles[currentLevel][currentPuzzle].hintComment;
    setMessage(`Hint: ${hintComment}`);
  };

  // Handles level change and resets the current puzzle
  const handleLevelChange = (level) => {
    setCurrentLevel(level);
    setCurrentPuzzle(0); // Reset to the first puzzle of the selected level
  };

  // Exits the game and navigates to the home page
  const handleExit = () => {
    navigate('/');
  };

  return (
    <div className="puzzles">
      {/* Level selection dropdown moved here */}
      <div className="level-selection">
        <label htmlFor="level-select">Select Level:</label>
        <select id="level-select" onChange={(e) => handleLevelChange(e.target.value)} value={currentLevel}>
          {levelOptions.map(level => (
            <option key={level} value={level}>
              {level === 'level1' ? 'Level 1' : 'Level 2'}
            </option>
          ))}
        </select>
      </div>
      <div className="logo-text" onClick={() => navigate('/')}>Chess Battle</div>
      {user && (
        <div className="user-info" onClick={toggleDropdown}>
          {user.displayName || user.email}
          {dropdownVisible && (
            <div className="dropdown">
              <button onClick={handleLogout} className="dropdown-button">Logout</button>
            </div>
          )}
        </div>
      )}
      <main>
        <h2>Level {currentLevel === 'level1' ? '1' : '2'} - Puzzle #{currentPuzzle + 1}</h2>
        <p className="message">{message}</p>
        <div className="chessboard">
          {renderBoard()}
          <div className="game-controls">
            <button onClick={handleExit}>Exit</button>
          </div>
        </div>
        <div className="button-container">
          <button onClick={showHintMove} className="hint-button">Hint</button>
          <button onClick={nextPuzzle} className="next-puzzle">Next Puzzle</button>
        </div>

        <div className="color-options">
          <button onClick={() => changeColors('#ffffff', '#000000')}>Default (Black & White)</button>
          <button onClick={() => changeColors('#f0d9b5', '#b58863')}>Wooden Theme</button>
          <button onClick={() => changeColors('#add8e6', '#4682b4')}>Blue Theme</button>
          <button onClick={() => changeColors('#90EE90', '#228B22')}>Green Theme</button>
        </div>
      </main>
    </div>
  );
};

export default Puzzles;