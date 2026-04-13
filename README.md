[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/vHiHb8vh)
# TIC3001/TCX3225 Project (PeerPrep) - AY2526S2

## Group: G03

## To prevent merge conflicts
Create a .gitignore file and add in files that should remain in local repo
## Pre-Requisites
### Ensure the following has been installed:
<ul> 1.	Git</ul>
<ul> 2.	Node.js (version >= 20) </ul>
<ul> 3. Clone code into local computer
<ul>a.	On local computer, create a folder with any name that identifies the group’s code to be downloaded</ul>
<ul>b.	Open command prompt from the new folder created</ul>
<ul>c.	Type command ‘git clone https://github.com/TIC3001-AY2526S2/peerprep-g03.git’</ul>
<ul>d.	Success: remote code downloads to computer</ul></ul>


## To connect to DB
### Question Service
In the <strong>questionService\server</strong> directory, copy <strong>.env.sample</strong> and paste it in the same directory, rename it to <strong>.env</strong>

### User Service
In the <strong>userService\server</strong> directory, copy <strong>.env.sample</strong> and paste it in the same directory, rename it to <strong>.env</strong>

### Matching Service
In the <strong>matchingService\server</strong> directory, copy <strong>.env.sample</strong> and paste it in the same directory, rename it to <strong>.env</strong>

### Collaboration Service
In the <strong>matchingService\server</strong> directory, copy <strong>.env.sample</strong> and paste it in the same directory, rename it to <strong>.env</strong>

## Start Application from project root (PEERPREP-G03)
<strong>For containerization setup (Docker)</strong>

In the root directory (VSCode), open a Command Prompt Terminal and run
```
docker compose build --no-cache
```
Once the build completes, run
```
docker compose up
```
Once you are done, run
```
docker compose down
```

<strong>For the full local development setup, run:
npm run dev</strong>

This starts:
- client
- question service
- user service
- matching service


## Accessing PeerPrep
- Front-end: http://localhost:3000

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
