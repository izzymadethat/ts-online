All of the details of building out TrakSync. I plan on using NextJS for it's simple routing and server side design.

## Features

### Project Collaboration:

When a user creates a project, the project is then shared between whoever they send the link to. Those who view as a client will have read-only access to the project except for the client uploads folder which is provided upon creation. The client does not need to be authenticated in order to upload and view the files in the project. Only a name is needed to identify the client.

### TimeStamped Comments from Client:

While listening to a song on the project, the client will be able to make a comment on the song at the moment of discrepancy. This will allow the user to know exactly where to make changes, and what changes are requested to be made.

### Revision History and Checklist:

When a client submits a comment, whether timestamped or just general feedback, then a to-do list style comment and revision history section is generated. The comment is stored in the database under the client's name. The comment created by the client can be edited so long as the comment has NOT been marked for completion. Each comment is displayed for the creator of the project as read-only. When the user feels they have met the requirement s of the comment, they can mark the comment as completed.

The client will be able to view the completed comments as well as comments that have been generated from other clients of the project. The creator of the project is the only person that can mark comments as completed once done.

### Paywall for Completed Files:

During project creation, the user has the option to set a project total for the services rendered during completion of the project. A client's action of uploading is their agreement to the user that they understand that payment is needed in order to download any completed files.

## Tech Stack:

- NextJs
- Prisma
- Supabase
- Stripe for User Sign Up
- Stripe Connect to help Users get paid for their services
- Kinde Authentication
- React-Player

## Navigation

The routes and server functions once the user or client has navigated.

### _Authentication_

| Task     | Client Route      | Api Route             |
| -------- | ----------------- | --------------------- |
| sign in  | /api/auth/sign-in | handled by kinde auth |
| sign out | /api/auth/logout  | handled by kinde auth |
| sign up  | /api/auth/sign-up | handled by kinde auth |

### _Projects_

| Task                | Client Route                  | Api Route(s)                   |
| ------------------- | ----------------------------- | ------------------------------ |
| create a project    | /dashboard/projects/new       | none                           |
| view all projects   | /dashboard/projects/          | none                           |
| view single project | /dashboard/projects/[id]      | none                           |
| update a project    | /dashboard/projects/[id]/edit | none                           |
| delete a project    |                               | none                           |
| listen to a track   | /project/[id]/track/[name]    | /api/track?:projectId&:trackId |

### _Services_

| Task                       | Client Route       | Api Route         |
| -------------------------- | ------------------ | ----------------- |
| view payments made to user | /payments          | none              |
| view user profile          | /dashboard/profile | none              |
| setup billing details      | /dashboard/billing | handled by Stripe |
| view all clients           | /clients           | none              |

---

## Forms

This section is a collection of forms that can be submitted through TrakSync.

### _Projects_

#### Create a new project:

- Title
- Description
- Project Cost
- Due Date

#### Update a project:

- All fields from create new project filled in with data
- Project Status
  - active
  - on hold
  - completed
  - in active

---

### _Files_

- A drag and drop form to upload files and folders
- For each file, have a selection choice if "Final, Revision, or Draft"
- For each file in files, If the file is submitted final or revision, and the project has a balance and the balance has not been paid in full, disable download button for client
- Else also, if the file is submitted as draft, do not allow client to view file(s), but only the authenticated user
- Every file upload should also have the ability to be deleted before and after submission
