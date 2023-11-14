## Board and logic

The board is a 2d matrix with each each entry either 0 (invalid position) , 1 (player 1) or 2(player 2).
Positions that can be reached from a given position is calculated using `canReach` adjacency matrix.
in special case of capturing a piece a player can even land at fixed positions that are not in `canReach` matrix. the condition for reaching that position is written in readme.
Mathematical translation of this rule is written below

```
if the cooardinates of final landing position the piece to be captured and the piece capturing it are in A.P. then the piece can be captured.
```

unlike chess where you can only capture one piece in a turn, in surbaggi you can capture multiple pieces in a turn.
it's current implementation could be improved since it gives users a hint that they can multikill.
we use `killStreakPossible` to check whether a player can capture multiple pieces in a turn and if it's not we immediately transfer control to the opposite player.
else we wait for few seconds and then transfer control to the opposite player if no move is made.

## Technologies

Socket.io is used to connect multiple users in realtime.
Html canvas is used to draw board and pieces.

## Logic execution

game logic is mostly executed in front-end and backend only creates room for connecting users.
