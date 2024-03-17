<h1> ReviTerm </h1>
A reviewer app in a form of quiz creator that specifically helps to <b><u>Re</u></b>view <b><u>Term</u></b>inologies(ReviTerm) for people who finds reviewing boring or have trouble remembering terminologies and hopefully help them to get higher scores in the actual quizzes

<h3> Features </h3>
<ul>
  <li> "Gaming" experience when reviewing terms </li>
  <li> Quick creation of reviewers by just putting a question and answer </li>
  <li> Choices are automatically shuffled based on the groupings that the user created when making adding items </li>
  <li> Remix mode! (ex: multiple choice becomes true or false, or question becomes shuffled modes)</li>
  <li> Ability to share your reviewers to other people (import/export) </li>
  <li> Implementation of unique algorithm that prioritizes the items that you forget the most (Mayonnaise Algorithm), an algorithm that randomly structures items like "biomes" (Ketchup Algorithm) and a system that adjusts the difficulty based on the performance of the user (Dynamic Difficulty System)</li>
</ul>

<h3> Mayonnaise Algorithm </h3>
The Mayonnaise Algorithm is based on the spaced repetition algorithm called <b>Leitner System</b> but is modified to fit the gamification element. Instead of putting items in a box with time intervals, the Mayonnaise algorithm flags which item you are having a hard time dealing with and based on the flag, its difficulty will be modified with the <b>Dynamic Difficulty System</b>.

<h3> Ketchup Algorithm </h3>
The Ketchup Algorithm works by either shuffling the items that the user created, applying Mayonnaise Algorithm or its vice versa or keeping its arrangement on how user created the items. This is only happens on Classic Mode and Perfection Mode as a part of gamification element, hoping that this algorithm gives a sense of unpredictability and replay value on taking their own made quiz

<h3> Dynamic Difficulty System </h3>
Flags that are created by Mayonnaise or Ketchup will be read by this and will modify the difficulty of the item. There are 4 flags that user might encounter during the time they're taking the quiz. Red, Orange, Green, Blue

Red Flag = There will be only 2 choices in multiple choice and only hides the clue in enumeration by 30%

Yellow Flag = There will be only 3 choices in multiple choice, and only hides the clue in enumaration by 50%

Gray Flag(not visible but default) = 4 choices in multiple choice, and hides the clue in enumeration by 60%

Green Flag = If its in classic mode, allows remixes to happen where question type can suddenly change (except for enumaration question type). The clue in enumaration mode is now hidden by 70%

Blue Flag = If its in classic mode, remixes have a higher chance of happening and the damage taken will be increased by 1.5x. The clue in enumaration mode is now hidden by 80%

<h3>Question type remixes</h3>
Only occurs in Classic mode or Perfection mode, it is a gamification element where there is a chance that a question type can suddenly change in which is not available to the user when creating their reviewer/quiz.

Here are the list of remix question types
True Or False = user must determine if the answer for the particular question is true

Scrambled = user must analyze and unscramble the text in the choices

Which is wrong = user must pick the wrong answer

Identification = user must manually type the answer by relying on the clue or their memory

Fill in the blank = user must type the blank section in the defintion of the term

<h3> Game Modes </h3>
Overall there are 3 game modes that are in ReviTerm. Each of them having their own quirks and those are Practice, Classic, and Perfection mode


<b>Practice Mode</b> = Mayonnaise Algorithm works here. It allows the user to select which group to only review, thus making them focus only at a certain group in which they have trouble getting right. Dynamic difficulty system happens here but no remixes of question type

<b>Classic Mode</b> = Introduces a new mechanic of choosing a character with abilities and having a health. In this mode the Ketchup algorithm is used to give a sense of unpredictability and really test the user's memory while allowing the dynamic difficulty system to happen. the user must complete the quiz/reviewer while maintaining the health which is slowly being drained overtime. Each correct answers heal their health but a wrong answer damages them and leading to gameover if they fail to maintain the health

<b>Perfection Mode</b> = It is classic mode but its harder and the damage taken is increased. Health drains a bit faster and the remix mode are buffed(example, in True or False there will be a chance where instead of [Is this answer correct] it would be [is this answer NOT correct]). This game mode can only be unlocked if the user got all blue flag on practice and classic mode, In short this mode serves to test your memory and is why its called "Perfection" mode.

<h3> Characters </h3>
To make the reviewing/studying more enjoyable or easier there are characters you can unlock by getting coins from answering a blue flagged item. One of the characters that is available is "The Instinctual", in which they have the ability to remove 2 incorrect choices from the multiple choice and they have a 60 second cooldown.. Each characters are designed to be balanced and to be not too reliant on their ability so that you can still focus on studying. Think of them as a support or a help, they can only be used in Classic/Perfection mode :)
