I have tried to resolve a task counting of people in a hall. \
Each people have own "counter" by default it is 1. \
During each iteration people should connect in pairs and one person from pair should say value of his "counter" to other person and sit down. \
So after first iteration only half of people should still stay. And their counters will have value 2. \
Then we repeat iterations (connect in pairs, say value of his "counter" to other person and sit down) until only 1 person still stay. \
And his counter will have a count of people in the hall.

I decided to use nodeJS worker_threads for resolving this task. \
Each person is new Worker. They "talk" to each other creating a pairs, decide "who should sit down" and do this is asynchronously (like a real people).\
Some of them have 'setTimeout' to imitate some delays in conversations.

Start Server:
>`nvm use v12.*` Use nodejs v12 or ^\
>`node server.js`

Start Front-end
>`npm run start`


Used libraries:
https://github.com/knadh/localStorageDB
