# Kapture Collections Voicebot

A voice-based collections assistant built using Vapi and a Node.js mock backend.

## Overview

This project demonstrates a voicebot for customer collections workflows.

The assistant verifies the customer, handles payment commitments, sends payment links, escalates to a human agent when required, and records the final call disposition.

## Features

- Customer identity verification
- Promise-to-pay recording
- Payment link simulation
- Human-agent escalation
- Call disposition recording
- Voice-based customer interaction
- Vapi function/tool integration
- Node.js mock backend

## Tools

The assistant uses five custom tools:

1. `verify_customer`
2. `log_promise_to_pay`
3. `send_payment_link`
4. `escalate_to_agent`
5. `mark_disposition`

## Tech Stack

- Vapi
- Node.js
- Express.js
- JavaScript
- REST API
- Webhooks
- JSON

## Mock Customer

Test customer:

- Name: Rahul Sharma
- Account ID: ACC-88392
- Verification Code: 1234

## Mock Server

The backend provides a webhook endpoint:

```text
POST /webhook