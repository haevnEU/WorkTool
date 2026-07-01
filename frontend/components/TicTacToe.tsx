import React, {useEffect, useState} from 'react';
import {X as XIcon} from 'lucide-react';

interface TicTacToeProps {
    isOpen: boolean;
    onClose: () => void;
}

interface SquareProps {
    value: 'X' | 'O' | null;
    onClick: () => void;
}

// Fix: Use React.FC to correctly type the component and handle React's `key` prop.
const Square: React.FC<SquareProps> = ({value, onClick}) => (
    <button
        className="w-20 h-20 md:w-24 md:h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-4xl font-bold transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-gray-600"
        onClick={onClick}
        aria-label={`Square with value ${value || 'empty'}`}
    >
        {value === 'X' && <span className="text-red-500">{value}</span>}
        {value === 'O' && <span className="text-blue-500">{value}</span>}
    </button>
);

const calculateWinner = (squares: Array<'X' | 'O' | null>): 'X' | 'O' | null => {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6],             // diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
};

const TicTacToe: React.FC<TicTacToeProps> = ({isOpen, onClose}) => {
    const [board, setBoard] = useState<Array<'X' | 'O' | null>>(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true); // Player is always 'X'
    const winner = calculateWinner(board);
    const isDraw = !winner && board.every(square => square !== null);

    const handleClick = (i: number) => {
        if (!isXNext || winner || board[i]) {
            return; // Player can only move on their turn if the square is empty
        }
        const newBoard = board.slice();
        newBoard[i] = 'X';
        setBoard(newBoard);
        setIsXNext(false); // Switch to AI's turn
    };

    // AI's turn logic
    useEffect(() => {
        if (!isXNext && !winner && !isDraw) {
            const timer = setTimeout(() => {
                const findBestMove = (currentBoard: Array<'X' | 'O' | null>): number | null => {
                    // 1. Check if AI ('O') can win
                    for (let i = 0; i < 9; i++) {
                        if (!currentBoard[i]) {
                            const tempBoard = [...currentBoard];
                            tempBoard[i] = 'O';
                            if (calculateWinner(tempBoard) === 'O') return i;
                        }
                    }
                    // 2. Check if Player ('X') can win and block
                    for (let i = 0; i < 9; i++) {
                        if (!currentBoard[i]) {
                            const tempBoard = [...currentBoard];
                            tempBoard[i] = 'X';
                            if (calculateWinner(tempBoard) === 'X') return i;
                        }
                    }
                    // 3. Take a random available spot
                    const emptySquares: number[] = [];
                    currentBoard.forEach((val, idx) => {
                        if (!val) emptySquares.push(idx);
                    });
                    if (emptySquares.length > 0) {
                        const randomIndex = Math.floor(Math.random() * emptySquares.length);
                        return emptySquares[randomIndex];
                    }
                    return null;
                };

                const bestMove = findBestMove(board);
                if (bestMove !== null) {
                    const newBoard = board.slice();
                    newBoard[bestMove] = 'O';
                    setBoard(newBoard);
                    setIsXNext(true); // Switch back to player's turn
                }
            }, 500); // AI "thinks" for half a second

            return () => clearTimeout(timer);
        }
    }, [isXNext, board, winner, isDraw]);

    const handleReset = () => {
        setBoard(Array(9).fill(null));
        setIsXNext(true);
    };

    useEffect(() => {
        if (!isOpen) {
            setTimeout(handleReset, 300); // Reset game when modal closes
        }
    }, [isOpen]);

    let status;
    if (winner) {
        status = `Winner: ${winner === 'X' ? 'You!' : 'AI'}`;
    } else if (isDraw) {
        status = 'It\'s a Draw!';
    } else {
        status = isXNext ? 'Your turn (X)' : 'AI is thinking...';
    }

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[101] p-4 transition-opacity duration-300"
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm transform transition-all duration-300 p-6 text-center"
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tic Tac Toe</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        aria-label="Close game"
                    >
                        <XIcon className="h-6 w-6 text-gray-500 dark:text-gray-400"/>
                    </button>
                </div>

                <div className="text-lg mb-4 font-semibold text-gray-700 dark:text-gray-300 min-h-[28px]">
                    {status}
                </div>

                <div className="grid grid-cols-3 gap-2 md:gap-3 mb-6">
                    {board.map((value, i) => (
                        <Square key={i} value={value} onClick={() => handleClick(i)}/>
                    ))}
                </div>

                <button
                    onClick={handleReset}
                    className="px-6 py-2 text-sm font-semibold text-white bg-primary rounded-lg shadow-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
                >
                    Reset Game
                </button>
            </div>
        </div>
    );
};

export default TicTacToe;
