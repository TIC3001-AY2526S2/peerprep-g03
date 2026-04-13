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

## AI Use Summary

Tools:
- ChatGPT 5.4

Prohibited phases avoided:
- Requirements elicitation and prioritization were done by the team.
- Architecture and service-boundary decisions were made by the team.

Allowed uses:
- Implementation refinement for the MS4 matching service.
- Debugging help for token validation, environment loading, and local startup issues.
- Documentation and comment refinement for the matching service.
- Implementation refinement for the MS5 collaboration service.
- Debugging help for collaboration session persistence, submission confirmation flow.

Verification:
- All AI-assisted output was reviewed, edited, and tested by the authors.
- Final code and design responsibility remained with the team.

Prompts and key exchanges:
- See [ai/usage-log.md](./ai/usage-log.md)
