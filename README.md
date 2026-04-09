[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/vHiHb8vh)
# TIC3001/TCX3225 Project (PeerPrep) - AY2526S2

## Group: Gxx

### Note:
You are required to develop individual microservices within separate folders within this repository.
The teaching team should be given access to the repositories, as we may require viewing the history of the repository in case of any disputes or disagreements.

## To prevent merge conflicts
Create a .gitignore file and add in files that should remain in local repo

## To connect to DB
Create a .env file under "server" folder. In .env file, add the following text: 
MONGODB_URI="mongodb+srv://MongoDBAdm:Password1234@peerprepg03.l2ceiwp.mongodb.net/peerprep"

## Start Application from project root (PEERPREP-G03)

For the full local development setup, run:
npm run dev


This starts:
- client
- question service
- user service
- matching service

If you only want the backend services, run:
npm start