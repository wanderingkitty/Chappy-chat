# Chappy-chat API

This is a **Chat API** build with  **MERN stack** (MngoDb, Express, React, Node.js) and icludes authentication with **JWT(JSON Web Tokens)** and validation using **Joi**. Chappy-chat is application where userrs can send and recieve messaegs in channels or directly to other users(DMs). The API provides endpoints for user authentication, managing channels, and sending messages in both open and locked channels. The application allows for guest access to open channels and secured communication for logged-in users.

Documented with [https://writer.mintlify.com/](Mintlify Document Writer)

## Table of contents

-  [Features](#features)
-  [Tech Stack](#tech-stack)
-  [Installatiob](#installation)
-  [Database model](#database-model)
-  [API Endpints](#api-endpoints)

## Features:


### Database-model
### User model 

| Property | Data Type | Description |
| --- | --- | --- |
| userId | string | Unique ID for the user (generated by database). |
| name | string | The user's name or username. |
| password | string | Hashed password for authentication. |
| isGuest | boolean | Indicates whether the user is a guest or logged-in. |

### Message model 

| Property | Data Type | Description |
| --- | --- | --- |
| messageId | string | Unique ID for each message. | 
| senderId | string | ID for the user who sent the message. |
| recipientId| ObjectId | ID for the user who receives the message.
| channelId | string | ID for the channel where the message was send. |
| content | string | The content of the message (text, link, or media). |
| isPrivate | boolean | Indicates whether the message is private (DM) or was sent in a channel. |
| sentAt | Date | Indicates the time the  message was sent. |

### Channel model

| Property | Data Type | Description |
| --- | --- | --- |
| channelId | string | Unique ID for each channel. | 
| name | string | The name of the chanel. |
| isPrivate | boolean | Indicates whether the channel is locked or open. |
| members | ObjectId[] | List of users which are included to the channel. |


### Private messages model

| Property | Data Type | Description |
| --- | --- | --- |
| dmId | string | Unique ID for DMs(generated by database). |
| senderId | string | ID for the user who sends the message. |
| recieverId | string | ID for the user who receives the message. |
| content | string | The content of the private message. |

