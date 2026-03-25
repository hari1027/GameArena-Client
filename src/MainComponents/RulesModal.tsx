import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { XIcon } from "lucide-react";
import "./rulesModal.css";

interface RulesModalProps {
  isRulesModalOpen: boolean;
  setIsRoomsModalOpen: (value: boolean) => void;
}

const rulesData = [
  {
    gameName : "General Rules",
    rules: [
        "You Can play either Play With Mates (Friends) or Play Online or even Make Play With Mates and convert it to online Room (host can only convert)",
        "You can Join in a room created by your friend through Join Room in the Top",
        "In Play Online Either you can join in an exsisting room or Create a New Online Room Itself",
        "In Play With Mates players can leave the game before game starts , Host can Kick any player before starting , Host can Delete the Room , Host can even Change the Game , Host can only start the game",
        "In Online Rooms the game will be Started in the Stipulated time which will be running or If Max PLayers for that game reaches . The Game will be Started with the Joined Players in the Online Room after time ends",
        "Host of the Online Room have Option to Delete the Room before the game starts",
        "Players can Leave the Online Game also before staring",
        "In Play Online even If you select a game and view the rooms there is an option to view and join rooms of other games also",
        "You Have the Rules Section on the top when ever you need to view the Rules",
        "You have the Light and Dark Mode of the Screens also Available on the Top",
        "You can Logout from the Application using logout on top Or even Browser close (even if you are in the game)",
        "You can Speak with other players once you are in a room",
        "You can Mute/UnMute your Mic Whenever you need once you are in a room",
        "If Any Player left InBetween the game the player will be replaced by a Bot (dont Worry)",
        "Scrools (Vertically and Horizontally) are available in all Screens so check Correctly (Example: While Viewing you cards in the games)",
        "To Discard a Card in the games (you can double click the card or Drag and drop in the correct Box - for computer, laptop and BigScreen's) (you can double click the card - for Tablet and Mobile) you can understand once you are in the game",
        "For Some Games (Seven Card Challenge) you can Discard many cards if you want so CheckBox will be available to each card's to Select and unSelect Cards",
        "To (Pick The Card Either from deck or Discarded Top you should click that Respective Boxes - in FourCardChallenge and SevenCardChallenge) for some games there will not be card pick option (According to Rules of the game it will Change)",
        "You Should Play your Move within the Stipulated time given (it will be running in the game screen) else you will be automatically Kicked from room and replaced by a Bot",
        "You can see the (Game details) in the Game Screen Once you are inside a Game",
        "Individual Game Rules are Illustrated below please read that and once you get the flow you can Enjoy these games",
        "Try to play Ticket To Ride game mostly in laptops or Monitors as it is hard to view the map in mobile with too small screen. In mobile also it will work but it will be hard for you to view map in mobile"
    ]
  },
  {
    gameName: "Five Alive",
    rules: [
      "Total Cards: 77, Number Cards: 47, Power Cards: 30",
      "Specific Number Cards Counts - zero: 8, one: 8, Two: 8, Three: 8, Four: 8, Five: 4, Six: 2, Seven: 1",
      "Specific Power Cards Counts - reverse: 6, pass: 4, skip: 4, plus2: 2, plus1: 2, equal to zero (eq0): 3, equal to ten (eq10): 2, equal to twenty one (eq21): 5, bomb: 1, shuffle: 1",
      "The Game Consists of 5 Lives for each Players. If any Player losses all the 5 lives the game will be over and the Player/Players with Maximum lives at the end of that round is the Winner",
      "On Every Round each Player will be initially provided 10 random cards",
      "If any Player Completes all his cards in hand then the player is the winner of that round and all other players will lose one life. And next Round will begin.",
      "Every Player Should play a card in his move",
      "There is an important rule in this game which is Tally 21. If a Player played a card which makes tally above 21 that player will lose one life and becomes inactive from that particular round (player cannot further play in that round)",
      "Functionalities of Number cards - zero : Adds 0 to the tally , one : Adds 1 to the tally , Two : Adds 2 to the tally , Three : Adds 3 to the tally , Four : Adds 4 to the tally , Five : Adds 5 to the tally , Six : Adds 6 to the tally , Seven : Adds 7 to the tally",
      "reverse : The Direction in which the game is going will be reversed (clockwise -> Anticlockwise , Anticlockwise -> clockwise)",
      "pass : You are just playing this card and skipping yourself",
      "skip : You are playing this card and not allowing the next player (in the direction the game is moving) to play his move",
      "plus2 : Apart from the player who played this card rest all will take 2 cards from the deck in order the game is moving",
      "plus1 : Apart from the player who played this card rest all will take 1 card from the deck in order the game is moving",
      "equal to zero (eq0) : The Tally will be changed to 0",
      "equal to ten (eq10) : The Tally will be changed to 10",
      "equal to twenty one (eq21) : The Tally will be changed to 21 . You can play this card even when the tally is already 21 also.",
      "bomb : When a Player plays this card all other players apart from the one who played the bomb will have to submit a zero card . If Any player does not have zero card they will lose one life automatically. The Player who is already inactive in that round will not get affect by this. And the Tally will be changed to 0",
      "shuffle : When a Player plays this card the cards in hand of all active players will be collected and shuffled and dealing of cards will happen from the next player (in the moving direction of the game) to whom played the shuffle card . So the probability of getting less number of cards to whom played the shuffle will be high . And the Tally will be changed to 0.",
      "Once Complete game is Over the room will be deleted automatically"
    ]
  },
  {
    gameName: "Four Card Challenge",
    rules: [
      "When 4 or less players are there 1 deck is used , when 5 to 8 players are there 2 decks are used , when more than 8 players are there 3 decks are used",
      "Each deck consists of 54 cards 52 playing cards and 2 joker cards",
      "There are 4 suits and 13 ranks",
      "Spade, Club, Diamond, and Heart are the 4 suits and from 2 to 10, J, Q, K and A are the 13 ranks",
      "There are totally 10 rounds in the game and the player/players with lowest Cummulative score is the winner of the game",
      "In Each round every player will be provided 4 cards",
      "The goal of this game is to keep as low points as you can . Every number card takes its number as points and j , Q , K are 10 points and A is 1 point , Joker is 0 point",
      "The round will be moved in clockwise direction",
      "In each player turn they Should discard a card and take a card from deck or discarded card from your before player",
      "If a player play a card ( for example 5 if he has any other 5's ) it will be automatically discarded . Means same rank cards will be dicarded if one is discarded also",
      "If discarded card by before player is (for example Q) If you also play Q then you need not take a card . Means if same rank of the discarded card from before player is played you need not take a card",
      "If three circle's are over a player can make Challenge in his round before playing a card",
      "If Before 3 circle's over any player reaches 0 points Challenge will be called automatically",
      "If Challenge is made by any player or auto challenge has happend the round gets over and points calculation happens",
      "If the Challenged player has the least points in that round the challenger is the winner of that round and his points will be 0 for that round",
      "If any other player has less or same points as the challenged player the Challenged player gets caught and gets 40 points . And the player/players with less points in that round gets 0 points and the player/players is the winner of that round",
      "Rest all players will get the points they have in hand",
      "After every round finishes new round will be started and after 10 rounds the game gets over"
    ]
  },
  {
    gameName: "Seven Card Challenge",
    rules: [
      "When 4 or less players are there 1 deck is used , when 5 to 8 players are there 2 decks are used , when more than 8 players are there 3 decks are used",
      "Each deck consists of 54 cards 52 playing cards and 2 joker cards",
      "There are 4 suits and 13 ranks",
      "Spade, Club, Diamond, and Heart are the 4 suits and from 2 to 10, J, Q, K and A are the 13 ranks",
      "There are totally 10 rounds in the game and the player/players with lowest Cummulative score is the winner of the game",
      "In Each round every player will be provided 7 cards",
      "The goal of this game is to keep as low points as you can . Every number card takes its number as points and j , Q , K are 10 points and A is 1 point , Joker is 0 point",
      "The round will be moved in clockwise direction",
      "Every round will have a specific card as a special joker card and it will be visble to all players. The Rank of that card will be also be consider as joker",
      "In your turn you can discard single card or multiple cards. If you are discarding multiple cards there are certain rules you need to satisfy",
      "You can discard multiple cards but all cards should be same rank or it should be in (rummy pattern (minimum 3 cards)) means same suit of order cards ( example - 4 heart , 5 heart , 6 heart , 7 heart ) like this",
      "If you miss any number of cards in your rummy you can subsitute that with joker (real joker card or special card rank). Means you can do (3 spade , joker , 5 spade , Q heart (Q is the joker rank of the round) , 7 spade)",
      "Every Player will have the oppoutunity to take One card from deck or any card from the discarded cards by the before player",
      "If you play any card which is in discarded cards by the before player you will be not taking a card Even If you want to take . Special joker is not valid to this (example if you consider substituing joker instead of 6 spade and 6 rank is available in the discarded card of before player) then you have to pick a card . Since you are substituting only.",
      "Simple you can use Joker or special rank card as any substitute . Its totally depend on how you want to use it. If you want you can use and discard your cards but think also that it will be available for the next player to take also. You can discard 2 (9 rank cards) and a Joker or special rank card also.",
      "K A and 2 order does not make a rummy . A 2 and 3 only make a order . A is the start of order . You cannot mix last k and first A",
      "If three circle's are over a player can make Challenge in his round before playing cards",
      "If Before 3 circle's over any player reaches 0 points Challenge will be called automatically",
      "If Challenge is made by any player or auto challenge has happend the round gets over and points calculation happens",
      "In Calculation also the rank of the special card of the round is also 0 point",
      "If the Challenged player has the least points in that round the challenger is the winner of that round and his points will be 0 for that round",
      "If any other player has less or same points as the challenged player the Challenged player gets caught and gets 70 points . And the player/players with less points in that round gets 0 points and the player/players is the winner of that round",
      "Rest all players will get the points they have in hand",
      "After every round finishes new round will be started and after 10 rounds the game gets over"
    ]
  },
  {
    gameName: "Ace",
    rules: [
      "This game consists of 52 cards",
      "There are 4 suits and 13 ranks",
      "Spade, Club, Diamond, and Heart are the 4 suits and from 2 to 10, J, Q, K and A are the 13 ranks",
      "All 52 cards will we dealed in the circular manner",
      "Players who discarded all his in hand cards will not be the donkey . The last remaining player is the donkey",
      "The Player with 'A' spade starts the game",
      "In New Round start the player who needs to start can play any card",
      "All other players need to play a card in the same suit",
      "If a player does not have any card on the same suit the player can cut the round with any card",
      "If Cut happens the round ends and the player who put largest rank of the suit gets all the cards of the round and start the next round",
      "If all players contribute a card on the same suit then also the round is over and all round cards will move to dustbin pile and player who puts largest rank of the suit will start the next round",
      "Once a player completes his in hand cards he escaped and he will further not be involved in the game",
      "Lowest to Highest Order - (2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> 10 -> J -> Q -> k -> A)"
    ]
  },
    {
    gameName: "Ticket To Ride",
    rules: [
      "This game is a strategic game where the player with most Points wins the game",
      "Each Player will have 45 trains and a color identity for them",
      "This game have 58 destination tickets with varying points and 110 color cards (Red , Blue , Green , Pink , Orange , Yellow , White , Black - each 12 and 14 locomotive cards)",
      "This game have a classical India Map as board with different city points",
      "Initially the game starts by providing 4 destination tickets to each player . The player should keep minimum of 2 tickets mandatory and only 4 min's is available for the player to decide after that if not decided 2 random tickets will be discarded . Random player will start the round after Initial ticket discard is done",
      "Your goal is to complete the destination without any gap's (like constructing a path between from and to points) to construct this we need color cards",
      "There will be a deck of closed color cards and 5 face up color cards for the players to pick",
      "In a particular round a player can either pick color cards or construct the path or take additional tickets",
      "When you choose deck the top two deck cards will be added to your hand",
      "When you choose face up card you can either pick 2 color cards (with same color or different) or a single locomotive card",
      "If you choose Locomotive from face up card you can pick only one card alone not two as you are seeing and picking , if you get two locomotive's from deck also no issue its your luck.",
      "Locomotive card can be used as a substitue for any color",
      "While making take tickets move you will be provided 3 new destination tickets in that you have to keep minimum of atleast one mandatory",
      "For example if you have a destination Ticket Bombay to Calcutta you cannot complete the full path at a single round (like even if you have all required cards to build you cannot do it in a single go)",
      "You can travel from one city to next movable city alone in the board in one build move not from one destination ticket to other completely",
      "To Contruct you have to provide the color cards required for that path to travel in exact counts",
      "For Example to travel from Mangalore to Madras if 4 pink's are required means you have give 4 pinks's not like 2 pinks's ill give now and 2 later that is not possible . Travel from one city to possible next city by providing necessary cards is required",
      "If you Dont have exact color required you can use locomotive as a substitue . For example 3 pinks and one locomotive , or even 2 pinks and 2 locomotive's , or even 4 locomotives also . Its your chooise . Remember locomotive can be substitute for any color",
      "There will be gray color's in the board path but there will be no color card called gray . So Gray means also any color but of same.",
      "For example if a path have 2 gray you have to provide 2 red's or 2 white's or 2 orange any color but same . You can use locomotive for gray also . In Game you will have option to select the color if you have many selecting scenarios for gray",
      "There will be purple path also in some places which means that is locomotive path , means you have to definetely provide the required locomotive's to travel in that path (it will be 1 and 2 locomotive's complusory only)",
      "You cannot build on a path once it is already build by someone or even you",
      "For some path there will be dual path means another player can use the one more path which is available . Same player cannot build same dual path even if it is open to build",
      "In dual path also if both are constructed another player cannot construct there",
      "Once Constructed that path will be marked with stripes of the respective player color",
      "You can find your identity color and other players identity color in the game",
      "There will be not extra trains provided to any players - each player 45 trains alone",
      "You will have the option of calling last round once you have so much less train in a way that you cannot build a path anymore (your trains < count of trains required to fill atleast one path in the board)",
      "You will have the option but taking the decision is your chooise , at this moment also if you want you can take tickets",
      "So What I am saying is as the game goes on you would have constructed the path and by taking tickets the destination coverage will be mostly or even completely already done for new tickets sometimes , In that also you have to keep only one madatory",
      "Card points calculation is simple after game ends if you have completed the destination ticket (means you have to connect the from and to by any means is okie either shortest path or longest or you completed a destination using that path loop to complete another ticket you build , any means you have to connect it) that ticket points will be Added and if you have not completed that ticket points will get deducted from the tally",
      "It is not complusory that you have to build path only to connect your destination . You can play destruction startegy like for (example - you cannot able to complete your some of your destination tickets as all possible ways to connect are closed , so you tried taking new destination ticket's for few rounds and nothing cannot be connected or large paths needs to be filled and you are getting minus points , you can start building randomly from any city to city and make other players not to complete thier destination . But you cannot see other players tickets only you can guess and build according to thier construction)",
      "You can see the train count of all players",
      "you can take as much tickets you want . (example - you took 3 tickets and all the three tickets cannot be achieved , try to keep ticket with less points)",
      "you took another three tickets and in that you have 2 already completed (you cannot discard the ticket you keep on the previous round in this round)",
      "Remember after accepting the ticket you cannot discard it further anymore , either you complete it or it becomes negative points for you",
      "And finally you will have train points also which is diplayed in the top right of the board also",
      "Each path will have 1 or 2 or 3 or 4 or 6 or 8 trains to complete a path city to city - if you construct itself it will added finally it is not neccessary weather you completed the desination with that path or not just like coin points",
      "1 train path - 1 point , 2 train path - 2 point , 3 train path - 4 point , 4 train path - 7 point , 6 train path (tunnel) - 15 point , 8 train path (big tunnel) - 21 point ",
      "Though big train path offers you extra points here as you go big the cities you are in will become less, shorter path more connectivity but rounds taken will be more as you are travelling by covering more cities and as game goes I can take tickets it will be connected moreover",
      "It completely depends on how you make startegies in the game",
      "To construct click on the city points and you will be shown the possible other cities you can pass",
      "For dual path's selection you can click on the path after selecting the points",
      "You will have a board and side panel to take cards and destination ticket's and call last round",
      "Once last round is called by any player that is going to be the last round of the game meaning the game will be over before the player who started the game (all player gets equal amount of moves) no advantage for any",
      "Once game ends you can see all players points in game end screen"
    ]
  }
];

const RulesModal = ({
  isRulesModalOpen,
  setIsRoomsModalOpen
}: RulesModalProps) => {

  return (
    <Dialog
      open={isRulesModalOpen}
      onClose={(_, reason) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") return;
        setIsRoomsModalOpen(false);
      }}
      disableEscapeKeyDown
      className="rules-dialog"
    >
      <DialogTitle className="dialog-title">
        Rules
        <IconButton
          aria-label="close"
          className="dialog-close-btn"
          onClick={() => setIsRoomsModalOpen(false)}
        >
          <XIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className="rules-content">
        {rulesData.map((game, index) => (
          <div key={index} className="rules-game-block">

            <div className="rules-game-title">
              {game.gameName}
            </div>

            <ul className="rules-list">
              {game.rules.map((rule, i) => (
                <li key={i}>{rule}</li>
              ))}
            </ul>

            {index !== rulesData.length - 1 && (
              <div className="rules-divider" />
            )}

          </div>
        ))}
      </DialogContent>

    </Dialog>
  );
};

export default RulesModal;
