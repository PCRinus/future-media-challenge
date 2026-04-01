# SDE Challenge – Full Stack

## Introduction

This challenge is your opportunity to show us how you approach real-world technical
problems — not just how you write code, but how you design, structure, and
communicate your solutions. There is no single correct answer — we want to
understand your thought process, trade-offs, and technical leadership mindset.
You’re not expected to spend more than a few hours on this, but feel free to show off
a little. 😄

## The Challenge

Build a small fullstack application using NestJS (backend) and NextJS (frontend)
with the following features:

## Requirements

- Users can register and log in
- Authenticated users can post short messages (max 240 characters) and
  assign a tag (category)
- All messages are visible on a Message Page and can be filtered by:
  - Tag
  - Date & time
  - User
- Only the author can inline-edit or delete their own messages
- Messages should lazy-load on scroll (pagination or infinite scroll)

Feel free to make decisions about edge cases or missing details — we’re interested
in how you handle ambiguity.

## What to Submit

Please ensure your submission includes:

✅ README.md — setup instructions to run the app locally
✅ .env.example — so we can run your backend without surprises
✅ Modular, well-structured code in both frontend and backend
✅ A short explanation (in ARCHITECTURE.md or in the README) covering:

- Application structure and reasoning
- Decisions made (e.g. for filtering, pagination, auth, error handling)
- Suggestions for next steps (e.g. testing, CI/CD, deployment)

## Bonus Points

- Include at least one example test (e.g. NestJS service unit test or Next
  component test)
- Provide a Docker-based setup (optional)
- Handle input validation and basic error handling
- Include suggestions for observability (e.g. logs, metrics, health checks)

## Bonus Question: High Read Load

Imagine your app needs to support thousands of read requests per second.

- How would you scale it?
- How would you ensure minimal response time at scale?
- How would you ensure fault tolerance?
- How would you monitor performance and errors in production?
  Please explain your ideas briefly in the README.md or as a separate file.

## Submission Instructions

Please zip your project folder and send it to us via reply to the email we shared with
you.
Ensure everything is included so we can run your app locally with minimal setup.

## Final Note

This is not a test of perfection. We want to see how you think, how you structure your
work, and how you approach solving problems. Imagine this is a product feature you
own, and you’re proposing it to a peer team.
