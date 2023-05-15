# :memo: Creating a game mode

**Game Modes**

> Mode files are stored in *client/src/components/games*
> 
> The main logic of the game mode would go here.

**Game Screens**

> Screens are stored in *client/src/components/screens*
> 
> Screens can be namespaced by creating sub-folders. (*ex. screens/MyGameMode/screen.js*)
> 
> Screens are components composed of widgets to build whatever interface you want.
> 
> Secondary logic specific to this screen should go here.

**Game Widgets**

> Widgets are stored in *client/src/components/widgets*
> 
> Widgets are smaller components that can be combined together to form game screens.
> 
> Widgets should also contain their own state/logic if appropriate.

## :building_construction: Basic Game Mode Structure

*client/src/components/games/MyGameMode.js*

```jsx
/**
 * MyGameMode Component
 */
const MyGameMode = (props) => {

    /**
     * Game Logic Here
     */

    return (
        <>
        {props.gameScreen === 0 && <Screen0 {...props} />}
        {props.gameScreen === 1 && <Screen1 {...props} />}
        </>
    )
}

export default MyGameMode;

/**
 * Component config and settings
 */
export const title = 'MyGameMode';
export const description = 'My mode plays like this...';
export const settings = {
    maxPlayers: 8,
    // other settings...
}
```

*client/src/components/screens/Screen0.js*

```jsx
/**
 * Screen 0
 */
const Screen0 = (props) => {
    /**
     * Screen specific logic
     */
    return (
        <>
            <Widget0 {...props} />
            <Widget1 {...props} />
        </>
    )
}

export default Screen0;
```

*client/src/components/widgets/Widget0.js*

```jsx
/**
 * Widget 0
 */
const Widget0 = (props) => {
    return (
        <>
            <Typography>Hello from Widget 0.</Typography>
        </>
    )
}

export default Widget0;
```

:star: **Now import the game to finish.**

*client/src/modules/Games.js*

```jsx
import * as Standard from '../components/games/Standard'; // The standard game mode
// ...
import * as MyGameMode from '../components/games/MyGameMode'; // Add your game mode


const Games = [
    Standard,
    // ...
    MyGameMode // Add your game mode to the list
];

export default Games;
```

## :gear: API

Game Mode Components receive the following props.

```ts
// Game Lobby properties
{
code:string,           // The lobby code

owner:string,          // Name of the player that owns the lobby

status:string,         // LobbyStatus Constants:
                       // OPEN - Players are in the lobby waiting for game to start
                       // STARTED - The game has been started. No new players allowed.
                       // GAME - The game has ended

appScreen:string,      // AppScreen Constants:
                       // LOGIN - The login screen
                       // LOBBY - The lobby screen
                       // GAME  - This screen is what shows while a game is being played.

gameScreen:number,     // Automatically increments by 1 for each game screen.
                       // (So you can track what screen to show)

round:number,          // Automatically increments by 1 for each round of the game.
                       // Currently Not implemented

mode:string,           // The title of the game mode. This is set in your game component.

settings:object,       // This is the json object of options available to your game mode.
                       // You must configure the predefined settings. You may add any others you want.
                       // Predefined settings:
                       // maxPlayers:number   - The maximum number of players allowed.
                       // groupSize:number    - Required group amount.
                       //                        (Groups of 2: 2, Groups of 3: 3, etc.)
                       //                        (This is not currently implemented)
                       // time:number         - Per game screen timer in seconds.
                       //                        (0 = infinite)
                       //                        (This is not currently implemented)

players:Array<object>, // List of players in the game and their info
                       // Each player has the following properties
                       // name:string      - The name of the player
                       // owner:boolean    - Flag of lobby ownership
                       // status:string    - PlayerStatus Constant
                       //                    ACTIVE        - Player is ready
                       //                    DONE          - Player has pressed done
                       // connected:string - ConnectionStatus Constant
                       //                    CONNECTED     - Player is connected
                       //                    DISCONNECTED  - Player is disconnected

// Other properties
socket:object,          // The websocket to emit/listen for custom events
playerName:string,      // Name of the the player

lobbyData:object,       // Json data store that can be used to store images, text, etc
                        // Formatting is completely up to the game mode

onGameEnd:function,     // Callback to fire when you want the game to end

onRoundEnd:function,     // Callback to fire when you want the round to end (Not yet implemented)

onDone:function(data:object),    // Callback to fire when you want to mark a player as done
                                 // data:object    - Data to save in the lobbyData storage

onQuit:function(),       // Callback to fire when a player quits the lobby
}
```
